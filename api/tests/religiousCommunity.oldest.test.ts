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
const endpoint = `${basePath}/religious-communities/public/oldest`;

type Fixture = {
  _id: string;
  censusStep: string;
  religiousSpaceName: string;
  religiousSpaceYearFoundation: number;
  religiousSpaceNation: string;
  communityAddress: Record<string, string>;
  communityGoogleApiLocalization: { lat: number; long: number };
};

const buildFixture = (
  id: string,
  censusStep: string,
  name: string,
  year: number
): Fixture => ({
  _id: id,
  censusStep,
  religiousSpaceName: name,
  religiousSpaceYearFoundation: year,
  religiousSpaceNation: "ketu",
  communityAddress: {
    street: "Rua Exemplo",
    number: "1",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
  communityGoogleApiLocalization: { lat: -7.115, long: -34.864 },
});

const fixtures: Fixture[] = [
  buildFixture("1", "approved", "Zumbi", 1950),
  buildFixture("2", "approved", "Abc", 1950),
  buildFixture("3", "approved", "Terreiro 1960", 1960),
  buildFixture("4", "approved", "Terreiro 1970", 1970),
  buildFixture("5", "approved", "Terreiro 1980", 1980),
  buildFixture("6", "approved", "Terreiro 1990", 1990),
  buildFixture("7", "approved", "Terreiro 2000", 2000),
  buildFixture("8", "approved", "Terreiro 2010", 2010),
  buildFixture("9", "approved", "Terreiro 2020", 2020),
  buildFixture("10", "approved", "Terreiro 2025", 2025),
  buildFixture("11", "pending", "Pendente 1900", 1900),
  buildFixture("12", "rejected", "Rejeitado 1910", 1910),
];

/**
 * Emula apenas os estágios usados pelo endpoint ($match, $sort, $limit).
 * Qualquer outro estágio (ex.: $sample) faz o teste falhar.
 */
const applyPipeline = (docs: Fixture[], pipeline: Record<string, any>[]) => {
  let result = docs.map((doc) => ({ ...doc }));

  for (const stage of pipeline) {
    const [operator] = Object.keys(stage);

    if (operator === "$match") {
      const match = stage.$match as Record<string, unknown>;
      result = result.filter((doc) =>
        Object.entries(match).every(
          ([field, value]) => (doc as Record<string, unknown>)[field] === value
        )
      );
    } else if (operator === "$sort") {
      const entries = Object.entries(stage.$sort) as [keyof Fixture, number][];
      result.sort((a, b) => {
        for (const [field, direction] of entries) {
          if (a[field] < b[field]) return -1 * direction;
          if (a[field] > b[field]) return 1 * direction;
        }
        return 0;
      });
    } else if (operator === "$limit") {
      result = result.slice(0, stage.$limit as number);
    } else {
      throw new Error(`Estágio de aggregation não suportado: ${operator}`);
    }
  }

  return result;
};

const originalAggregate = ReligiousCommunity.aggregate.bind(ReligiousCommunity);
let server: Server;
let baseUrl: string;

before(async () => {
  (ReligiousCommunity as any).aggregate = async (pipeline: Record<string, any>[]) =>
    applyPipeline(fixtures, pipeline);

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

test("GET /public/oldest retorna 200 com 9 terreiros", async () => {
  const response = await fetch(`${baseUrl}${endpoint}`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.data.status, true);
  assert.equal(body.data.data.length, 9);
});

test("GET /public/oldest considera apenas censusStep APPROVED", async () => {
  const response = await fetch(`${baseUrl}${endpoint}`);
  const body = await response.json();

  const names = body.data.data.map((community: any) => community.religiousSpaceName);

  assert.ok(!names.includes("Pendente 1900"));
  assert.ok(!names.includes("Rejeitado 1910"));
  assert.ok(!names.includes("Terreiro 2025"));
});

test("GET /public/oldest ordena por ano de fundação asc e depois por nome", async () => {
  const response = await fetch(`${baseUrl}${endpoint}`);
  const body = await response.json();

  const years = body.data.data.map(
    (community: any) => community.religiousSpaceYearFoundation
  );
  const names = body.data.data.map((community: any) => community.religiousSpaceName);

  assert.deepEqual(years, [1950, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]);
  assert.deepEqual(names.slice(0, 2), ["Abc", "Zumbi"]);
});
