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
  religiousSpacePraticalLanguages: "yoruba",
  religiousSpaceYearFoundation: 1980,
  religiousSpaceLeaderName: "Mãe Teste",
  religiousSpaceLeaderFoundation: "Mãe Teste",
  religiousSpacePositionName: "Ialorixá",
  religiousSpaceStartedBy: "Mãe Teste",
  religiousSpaceNameDateStartedBy: "1980-03-15T00:00:00.000Z",
  leaderEthnicity: "negra",
  leaderGender: "feminino",
  leaderEducationalLevel: "ensino médio",
  leaderSufferedRacism: false,
  communityGoogleApiLocalization: { lat: -7.115, long: -34.864 },
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

  // Sem Mongo disponível no ambiente de teste, o `create` é substituído por
  // uma versão que executa a validação real do schema (`validateSync`) antes
  // de devolver o documento — nenhum campo required pode ser omitido.
  (ReligiousCommunity as any).create = async (
    payload: Partial<IReligiousCommunity>
  ) => {
    createdPayload = payload;

    const community = new ReligiousCommunity(payload);
    const validationError = community.validateSync();

    if (validationError) {
      throw validationError;
    }

    return community;
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

test("POST /public/create com payload completo satisfaz a validação do schema", async () => {
  const response = await postAuthorized();

  assert.equal(response.status, 201);
  assert.ok(createdPayload, "payload deve ser enviado ao schema");

  for (const field of [
    "communityGoogleApiLocalization",
    "religiousSpaceLeaderFoundation",
    "religiousSpacePraticalLanguages",
    "religiousSpacePositionName",
    "religiousSpaceStartedBy",
    "religiousSpaceNameDateStartedBy",
    "leaderEthnicity",
    "leaderGender",
    "leaderEducationalLevel",
    "leaderSufferedRacism",
  ]) {
    assert.ok(field in createdPayload, `payload deve conter ${field}`);
  }

  const community = new ReligiousCommunity(createdPayload);
  assert.equal(
    community.validateSync(),
    undefined,
    "payload completo deve passar na validação do schema"
  );
  assert.ok(
    community.religiousSpaceNameDateStartedBy instanceof Date,
    "religiousSpaceNameDateStartedBy deve ser convertido para Date"
  );
});

test("POST /public/create sem campo obrigatório novo retorna 400 e não cria", async () => {
  const { leaderSufferedRacism: _omitted, ...withoutRacism } = validPayload;
  const response = await postAuthorized(withoutRacism);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.ok(
    (body.data.errors ?? []).some(
      (error: { field: string }) => error.field === "leaderSufferedRacism"
    ),
    "deve apontar leaderSufferedRacism como obrigatório"
  );
  assert.equal(createdPayload, undefined, "não deve criar sem campo obrigatório");
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

test("POST /public/create sem localização geocodifica o endereço pelo Nominatim", async () => {
  const { communityGoogleApiLocalization: _omitted, ...withoutLocation } =
    validPayload;
  const realFetch = globalThis.fetch;
  let geocodeUrl = "";

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("nominatim")) {
      geocodeUrl = url;
      return new Response(JSON.stringify([{ lat: "-7.12", lon: "-34.87" }]), {
        status: 200,
      });
    }
    return realFetch(input, init);
  }) as typeof fetch;

  try {
    const response = await postAuthorized(withoutLocation);

    assert.equal(response.status, 201);
    assert.deepEqual(createdPayload?.communityGoogleApiLocalization, {
      lat: -7.12,
      long: -34.87,
    });
    assert.equal(
      new URL(geocodeUrl).searchParams.get("q"),
      validPayload.communityAddress.fullAddress
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("POST /public/create sem localização grava 0,0 quando o geocoding falha", async () => {
  const { communityGoogleApiLocalization: _omitted, ...withoutLocation } =
    validPayload;
  const realFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes("nominatim")) {
      throw new Error("geocoding indisponível");
    }
    return realFetch(input, init);
  }) as typeof fetch;

  try {
    const response = await postAuthorized(withoutLocation);

    assert.equal(response.status, 201);
    assert.deepEqual(createdPayload?.communityGoogleApiLocalization, {
      lat: 0,
      long: 0,
    });
  } finally {
    globalThis.fetch = realFetch;
  }
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
