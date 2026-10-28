import "reflect-metadata";
import "../src/configs/dotenv";
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import type { Server } from "node:http";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import religiousCommunityRoutes from "../src/routes/religiousCommunity.routes";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";

const basePath = process.env.NODE_BASE_URL || "/api/v1";
const statsPath = `${basePath}/religious-communities/public/stats`;

type Stage = Record<string, any>;
type Aggregated = Record<string, any>;

/** Resultado que o aggregate mockado devolve na requisição corrente. */
let aggregateResult: Aggregated[] = [];
let aggregateError: Error | null = null;
/** Pipelines capturados, para validar os estágios enviados ao Mongo. */
let capturedPipelines: Stage[][] = [];

const originalAggregate = ReligiousCommunity.aggregate.bind(ReligiousCommunity);
let server: Server;
let baseUrl: string;

const resetAggregate = (result: Aggregated[]) => {
  aggregateResult = result;
  aggregateError = null;
  capturedPipelines = [];
};

const fetchStats = async (endpoint: string) => {
  const response = await fetch(`${baseUrl}${statsPath}/${endpoint}`);
  const body = await response.json();
  return { response, body };
};

const findStage = (pipeline: Stage[], operator: string): Stage | undefined =>
  pipeline.find((stage) => operator in stage);

const assertApprovedMatch = (pipeline: Stage[]) => {
  const match = findStage(pipeline, "$match");
  assert.ok(match, "pipeline deve começar com $match");
  assert.equal(match!.$match.censusStep, "approved");
};

const assertGroupField = (pipeline: Stage[], expected: string) => {
  const group = findStage(pipeline, "$group");
  assert.ok(group, "pipeline deve conter $group");
  assert.equal(group!.$group._id, expected);
};

before(async () => {
  (ReligiousCommunity as any).aggregate = async (pipeline: Stage[]) => {
    capturedPipelines.push(pipeline);
    if (aggregateError) throw aggregateError;
    return aggregateResult;
  };

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
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("GET /public/stats/by-nation conta por religiousSpaceNation", async () => {
  resetAggregate([
    { _id: "ketu", count: 3 },
    { _id: "angola", count: 2 },
  ]);

  const { response, body } = await fetchStats("by-nation");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, [
    { nation: "ketu", count: 3 },
    { nation: "angola", count: 2 },
  ]);
  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$religiousSpaceNation");
});

test("GET /public/stats/by-city conta por communityAddress.city", async () => {
  resetAggregate([
    { _id: "João Pessoa", count: 4 },
    { _id: "Bayeux", count: 1 },
  ]);

  const { response, body } = await fetchStats("by-city");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { city: "João Pessoa", count: 4 },
    { city: "Bayeux", count: 1 },
  ]);
  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$communityAddress.city");
});

test("GET /public/stats/by-decade converte o ano em rótulo de década", async () => {
  resetAggregate([
    { _id: 1950, count: 2 },
    { _id: 2020, count: 5 },
  ]);

  const { response, body } = await fetchStats("by-decade");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { decade: "1950s", count: 2 },
    { decade: "2020s", count: 5 },
  ]);

  const pipeline = capturedPipelines[0];
  assertApprovedMatch(pipeline);
  assert.deepEqual(pipeline[0].$match.religiousSpaceYearFoundation, {
    $gte: 1000,
    $lte: 2100,
  });

  const group = findStage(pipeline, "$group");
  assert.ok(group);
  assert.ok(group!.$group._id.$multiply, "deve calcular a década no $group");
  assert.deepEqual(group!.$group._id.$multiply[1], 10);
});

test("GET /public/stats/by-type-and-nation separa matriz africana e comunidade de terreiro", async () => {
  resetAggregate([
    { _id: "ketu", african: 2, traditional: 1, total: 3 },
    { _id: "umbanda", african: 0, traditional: 4, total: 4 },
  ]);

  const { response, body } = await fetchStats("by-type-and-nation");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { nation: "ketu", african: 2, traditional: 1 },
    { nation: "umbanda", african: 0, traditional: 4 },
  ]);

  const pipeline = capturedPipelines[0];
  assertApprovedMatch(pipeline);
  assertGroupField(pipeline, "$religiousSpaceNation");

  const serialized = JSON.stringify(pipeline);
  assert.ok(serialized.includes("matriz africana"));
  assert.ok(serialized.includes("comunidade de terreiro"));
});

test("GET /public/stats/by-type conta por communityType", async () => {
  resetAggregate([
    { _id: "matriz africana", count: 6 },
    { _id: "comunidade de terreiro", count: 5 },
  ]);

  const { response, body } = await fetchStats("by-type");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { type: "matriz africana", count: 6 },
    { type: "comunidade de terreiro", count: 5 },
  ]);
  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$communityType");
});

test("GET /public/stats/by-leader-gender conta por leaderGender", async () => {
  resetAggregate([
    { _id: "feminino", count: 7 },
    { _id: "masculino", count: 4 },
  ]);

  const { response, body } = await fetchStats("by-leader-gender");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { gender: "feminino", count: 7 },
    { gender: "masculino", count: 4 },
  ]);
  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$leaderGender");
});

test("GET /public/stats/by-leader-ethnicity conta por leaderEthnicity", async () => {
  resetAggregate([
    { _id: "preta", count: 8 },
    { _id: "parda", count: 3 },
  ]);

  const { response, body } = await fetchStats("by-leader-ethnicity");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { ethnicity: "preta", count: 8 },
    { ethnicity: "parda", count: 3 },
  ]);
  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$leaderEthnicity");
});

test("GET /public/stats/by-language conta por religiousSpacePraticalLanguages", async () => {
  resetAggregate([
    { _id: "yoruba", count: 5 },
    { _id: "quicongo", count: 2 },
  ]);

  const { response, body } = await fetchStats("by-language");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { language: "yoruba", count: 5 },
    { language: "quicongo", count: 2 },
  ]);
  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$religiousSpacePraticalLanguages");
});

test("GET /public/stats/by-neighborhood devolve top 10 + outros", async () => {
  const rows: Aggregated[] = Array.from({ length: 12 }, (_, index) => ({
    _id: `Bairro ${index + 1}`,
    count: 12 - index,
  }));

  resetAggregate(rows);

  const { response, body } = await fetchStats("by-neighborhood");

  assert.equal(response.status, 200);

  const data = body.data.data as Array<{ neighborhood: string; count: number }>;

  assert.equal(data.length, 11);
  assert.deepEqual(data[0], { neighborhood: "Bairro 1", count: 12 });
  assert.deepEqual(data[9], { neighborhood: "Bairro 10", count: 3 });
  assert.deepEqual(data[10], { neighborhood: "outros", count: 2 + 1 });

  assertApprovedMatch(capturedPipelines[0]);
  assertGroupField(capturedPipelines[0], "$communityAddress.neighborhood");
});

test("GET /public/stats/by-neighborhood não cria 'outros' com 10 bairros ou menos", async () => {
  resetAggregate([
    { _id: "Centro", count: 2 },
    { _id: "Bessa", count: 1 },
  ]);

  const { response, body } = await fetchStats("by-neighborhood");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, [
    { neighborhood: "Centro", count: 2 },
    { neighborhood: "Bessa", count: 1 },
  ]);
});

test("GET /public/stats/photo-coverage devolve com/sem foto e total", async () => {
  resetAggregate([
    { _id: null, withPhoto: 6, withoutPhoto: 2, total: 8 },
  ]);

  const { response, body } = await fetchStats("photo-coverage");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, {
    withPhoto: 6,
    withoutPhoto: 2,
    total: 8,
  });

  const pipeline = capturedPipelines[0];
  assertApprovedMatch(pipeline);

  const serialized = JSON.stringify(pipeline);
  assert.ok(serialized.includes("religiousSpaceMainPicture"));
});

test("GET /public/stats/photo-coverage devolve zeros sem comunidades aprovadas", async () => {
  resetAggregate([]);

  const { response, body } = await fetchStats("photo-coverage");

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.data, {
    withPhoto: 0,
    withoutPhoto: 0,
    total: 0,
  });
});

test("GET /public/stats/by-city sinaliza erro do aggregate sem quebrar a resposta", async () => {
  resetAggregate([]);
  aggregateError = new Error("aggregate indisponível");

  const { response, body } = await fetchStats("by-city");

  assert.equal(response.status, 200);
  assert.equal(body.data.status, false);
  assert.ok(body.data.error);
});
