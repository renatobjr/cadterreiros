import "reflect-metadata";
import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";
import type { Server } from "node:http";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import { publicCreateRateLimit } from "../src/middlewares/rateLimit";
import religiousCommunityRoutes from "../src/routes/religiousCommunity.routes";
import {
  ECensusStep,
  IReligiousCommunity,
  ReligiousCommunity,
} from "../src/schemas/ReligiousCommunity";

const API_KEY = "chave-de-teste";
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const endpoint = `${basePath}/religious-communities/public/create`;

const validPayload = {
  authorization: true,
  religiousSpaceName: "Ilê Axé Teste",
  communityType: "matriz africana",
  religiousSpaceNation: "ketu",
  religiousSpaceYearFoundation: 1980,
  religiousSpaceLeaderName: "Mãe Teste",
  communityAddress: {
    fullAddress: "Rua Teste, 1, Centro, João Pessoa - PB, 58000-000",
    street: "Rua Teste",
    number: "1",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
};

const originalCreate = ReligiousCommunity.create.bind(ReligiousCommunity);
let createdPayload: Partial<IReligiousCommunity> | undefined;
let server: Server;
let baseUrl: string;

const resetRateLimit = async () => {
  for (const key of ["127.0.0.1", "::1", "::ffff:127.0.0.1"]) {
    await publicCreateRateLimit.resetKey(key);
  }
};

const post = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

const postAuthorized = (body: unknown = validPayload) =>
  post(body, { "x-cadterreiros-api": API_KEY });

before(async () => {
  process.env.CADTERREIROS_API_KEY = API_KEY;

  (ReligiousCommunity as any).create = async (
    payload: Partial<IReligiousCommunity>
  ) => {
    createdPayload = payload;
    return new ReligiousCommunity(payload);
  };

  const app = express();
  app.use(express.json());
  app.use(handleResponse);
  app.use(religiousCommunityRoutes);

  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

beforeEach(async () => {
  createdPayload = undefined;
  await resetRateLimit();
});

after(async () => {
  (ReligiousCommunity as any).create = originalCreate;
  delete process.env.CADTERREIROS_API_KEY;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("POST /public/create com payload válido retorna 201 e o id", async () => {
  const response = await postAuthorized();
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.status, true);
  assert.ok(body.data.data.id, "resposta deve conter o id do cadastro");
});

test("POST /public/create cria com censusStep PENDING, registeredVoluntarily true e censusTaker null", async () => {
  const response = await postAuthorized();
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(createdPayload?.censusStep, ECensusStep.PENDING);
  assert.equal(createdPayload?.registeredVoluntarily, true);
  assert.equal(createdPayload?.censusTaker, null);

  assert.equal(body.data.data.censusStep, ECensusStep.PENDING);
  assert.equal(body.data.data.registeredVoluntarily, true);
  assert.equal(body.data.data.censusTaker, null);
});

test("POST /public/create sem header x-cadterreiros-api retorna 403", async () => {
  const response = await post(validPayload);

  assert.equal(response.status, 403);
  assert.equal(createdPayload, undefined, "não deve criar sem o header");
});

test("POST /public/create com payload inválido retorna 400 com erros de validação", async () => {
  const response = await postAuthorized({ religiousSpaceName: "" });
  const body = await response.json();
  const fields = (body.data.errors ?? []).map(
    (error: { field: string }) => error.field
  );

  assert.equal(response.status, 400);
  assert.ok(
    fields.includes("communityAddress"),
    "deve apontar o endereço obrigatório"
  );
  assert.equal(createdPayload, undefined, "não deve criar com payload inválido");
});

test("POST /public/create 6x em 1 min retorna 429 na sexta requisição", async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await postAuthorized();
    assert.equal(response.status, 201, `requisição ${attempt} deveria passar`);
  }

  const blocked = await postAuthorized();

  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get("retry-after"), "deve retornar Retry-After");
});
