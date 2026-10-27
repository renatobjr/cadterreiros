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
const endpoint = `${basePath}/religious-communities/public/stats/summary`;

type Fixture = {
  censusStep: string;
  communityAddress: { city: string; neighborhood: string };
};

const fixtures: Fixture[] = [
  {
    censusStep: "approved",
    communityAddress: { city: "João Pessoa", neighborhood: "Centro" },
  },
  {
    censusStep: "approved",
    communityAddress: { city: "João Pessoa", neighborhood: "Bessa" },
  },
  {
    censusStep: "approved",
    communityAddress: { city: "Recife", neighborhood: "Centro" },
  },
  {
    censusStep: "approved",
    communityAddress: { city: "Recife", neighborhood: "" },
  },
  {
    censusStep: "pending",
    communityAddress: { city: "Natal", neighborhood: "Alecrim" },
  },
  {
    censusStep: "rejected",
    communityAddress: { city: "Olinda", neighborhood: "Carmo" },
  },
];

const getByPath = (doc: unknown, field: string): unknown =>
  field
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      doc
    );

const matches = (doc: Fixture, match: Record<string, unknown>): boolean =>
  Object.entries(match).every(([field, expected]) => {
    const value = getByPath(doc, field);

    if (expected && typeof expected === "object" && "$nin" in expected) {
      return !(expected as { $nin: unknown[] }).$nin.includes(value);
    }

    return value === expected;
  });

/**
 * Emula apenas os estágios usados por /public/stats/summary
 * ($match, $group por campo único e $count).
 * Qualquer outro estágio faz o teste falhar.
 */
const applyPipeline = (docs: Fixture[], pipeline: Record<string, any>[]) => {
  let result: Record<string, any>[] = docs.map((doc) => ({ ...doc }));

  for (const stage of pipeline) {
    const [operator] = Object.keys(stage);

    if (operator === "$match") {
      result = result.filter((doc) =>
        matches(doc as Fixture, stage.$match as Record<string, unknown>)
      );
    } else if (operator === "$group") {
      const groupField = String(stage.$group._id).replace("$", "");
      const seen = new Set<unknown>();

      result = result.reduce<Record<string, any>[]>((grouped, doc) => {
        const key = getByPath(doc, groupField);

        if (!seen.has(key)) {
          seen.add(key);
          grouped.push({ _id: key });
        }

        return grouped;
      }, []);
    } else if (operator === "$count") {
      result = result.length ? [{ [stage.$count]: result.length }] : [];
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
  (ReligiousCommunity as any).aggregate = async (
    pipeline: Record<string, any>[]
  ) => applyPipeline(fixtures, pipeline);

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

test("GET /public/stats/summary retorna 200 com os totais aprovados", async () => {
  const response = await fetch(`${baseUrl}${endpoint}`);

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.equal(body.data.status, true);
  assert.deepEqual(body.data.data, {
    totalReligiousCommunities: 4,
    totalCities: 2,
    totalNeighborhoods: 2,
  });
});

test("GET /public/stats/summary retorna zeros quando não há comunidades aprovadas", async () => {
  const aggregateWithFixtures = (ReligiousCommunity as any).aggregate;

  (ReligiousCommunity as any).aggregate = async () => [];

  try {
    const response = await fetch(`${baseUrl}${endpoint}`);

    assert.equal(response.status, 200);

    const body = await response.json();

    assert.deepEqual(body.data.data, {
      totalReligiousCommunities: 0,
      totalCities: 0,
      totalNeighborhoods: 0,
    });
  } finally {
    (ReligiousCommunity as any).aggregate = aggregateWithFixtures;
  }
});
