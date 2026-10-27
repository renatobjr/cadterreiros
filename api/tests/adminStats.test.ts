import "reflect-metadata";
import "../src/configs/dotenv";
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import type { Server } from "node:http";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import religiousCommunityRoutes from "../src/routes/religiousCommunity.routes";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";
import tokenUtils from "../src/utils/token.utils";

const basePath = process.env.NODE_BASE_URL || "/api/v1";
const statsPath = `${basePath}/religious-communities/stats`;
const AUTH_HEADERS = { authorization: "Bearer token-de-teste" };

const adminStatsEndpoints = [
  "by-census-step",
  "by-status",
  "by-educational-level",
  "bio-coverage",
  "voluntary-registrations",
];

type Stage = Record<string, any>;
type Aggregated = Record<string, any>;

/** Resultado que o aggregate mockado devolve na requisição corrente. */
let aggregateResult: Aggregated[] = [];
let aggregateError: Error | null = null;
/** Pipelines capturados, para validar os estágios enviados ao Mongo. */
let capturedPipelines: Stage[][] = [];

const originalAggregate = ReligiousCommunity.aggregate.bind(ReligiousCommunity);
const originalVerify = tokenUtils.verify;
let server: Server;
let baseUrl: string;

const resetAggregate = (result: Aggregated[]) => {
  aggregateResult = result;
  aggregateError = null;
  capturedPipelines = [];
};

const fetchStats = async (
  endpoint: string,
  headers: Record<string, string> = AUTH_HEADERS
) => {
  const response = await fetch(`${baseUrl}${statsPath}/${endpoint}`, {
    headers,
  });
  const body = await response.json();
  return { response, body };
};

const findStage = (pipeline: Stage[], operator: string): Stage | undefined =>
  pipeline.find((stage) => operator in stage);

/** As agregações admin não podem filtrar por censusStep (todos os registros). */
const assertNoCensusFilter = (pipeline: Stage[]) => {
  const match = findStage(pipeline, "$match");

  if (match) {
    assert.equal(
      match.$match.censusStep,
      undefined,
      "agregação admin não deve filtrar por censusStep"
    );
  }
};

before(async () => {
  (ReligiousCommunity as any).aggregate = async (pipeline: Stage[]) => {
    capturedPipelines.push(pipeline);
    if (aggregateError) throw aggregateError;
    return aggregateResult;
  };

  // Auth mockado: qualquer token Bearer válido resolve para um usuário admin.
  (tokenUtils as any).verify = () => ({ id: "admin-user-id" });

  const app = express();
  app.use(handleResponse);
  app.use(religiousCommunityRoutes);

  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  (ReligiousCommunity as any).aggregate = originalAggregate;
  (tokenUtils as any).verify = originalVerify;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("GET /stats/by-census-step exige auth e conta approved/pending/rejected", async () => {
  for (const endpoint of adminStatsEndpoints) {
    const unauthorized = await fetchStats(endpoint, {});
    assert.equal(
      unauthorized.response.status,
      401,
      `${endpoint} deve exigir autenticação`
    );
  }

  assert.equal(capturedPipelines.length, 0, "sem auth não deve consultar o banco");

  resetAggregate([
    { _id: null, approved: 5, pending: 2, rejected: 1, total: 8 },
  ]);

  const { response, body } = await fetchStats("by-census-step");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, {
    approved: 5,
    pending: 2,
    rejected: 1,
    total: 8,
  });

  const pipeline = capturedPipelines[0];
  assertNoCensusFilter(pipeline);
  assert.equal(findStage(pipeline, "$group")?.$group._id, null);
});

test("GET /stats/by-status conta active/inactive", async () => {
  resetAggregate([
    { _id: null, active: 7, inactive: 3, total: 10 },
  ]);

  const { response, body } = await fetchStats("by-status");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, { active: 7, inactive: 3, total: 10 });

  const pipeline = capturedPipelines[0];
  assertNoCensusFilter(pipeline);
  const serialized = JSON.stringify(pipeline);
  assert.ok(serialized.includes("religiousSpaceStatus"));
});

test("GET /stats/by-educational-level conta por leaderEducationalLevel", async () => {
  resetAggregate([
    { _id: "superior completo", count: 4 },
    { _id: "ensino médio", count: 2 },
  ]);

  const { response, body } = await fetchStats("by-educational-level");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, [
    { educationalLevel: "superior completo", count: 4 },
    { educationalLevel: "ensino médio", count: 2 },
  ]);

  const pipeline = capturedPipelines[0];
  assertNoCensusFilter(pipeline);
  assert.equal(
    findStage(pipeline, "$group")?.$group._id,
    "$leaderEducationalLevel"
  );
});

test("GET /stats/bio-coverage conta com/sem bio", async () => {
  resetAggregate([{ _id: null, withBio: 6, withoutBio: 4, total: 10 }]);

  const { response, body } = await fetchStats("bio-coverage");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, {
    withBio: 6,
    withoutBio: 4,
    total: 10,
  });

  const pipeline = capturedPipelines[0];
  assertNoCensusFilter(pipeline);
  assert.ok(JSON.stringify(pipeline).includes("$bio"));
});

test("GET /stats/voluntary-registrations conta registeredVoluntarily true/false", async () => {
  resetAggregate([
    {
      _id: null,
      registeredVoluntarily: 3,
      notRegisteredVoluntarily: 7,
      total: 10,
    },
  ]);

  const { response, body } = await fetchStats("voluntary-registrations");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, {
    registeredVoluntarily: 3,
    notRegisteredVoluntarily: 7,
    total: 10,
  });

  const pipeline = capturedPipelines[0];
  assertNoCensusFilter(pipeline);
  assert.ok(JSON.stringify(pipeline).includes("$registeredVoluntarily"));
});
