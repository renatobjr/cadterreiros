import "reflect-metadata";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import test from "node:test";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import { validateDTO } from "../src/middlewares/validateDTO";
import { ReligiousCommunityCreateDTO } from "../src/dtos/religiousCommunitiesDTOS/religiousCommunitiesCreate.DTO";

const ENDPOINT = "/public/create";

type TestServer = {
  baseUrl: string;
  server: Server;
};

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
  leaderContacts: { email: "lideranca@teste.local" },
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

const REQUIRED_FIELDS = [
  "authorization",
  "religiousSpaceName",
  "communityType",
  "religiousSpaceNation",
  "religiousSpacePraticalLanguages",
  "religiousSpaceYearFoundation",
  "religiousSpaceLeaderName",
  "religiousSpaceLeaderFoundation",
  "religiousSpacePositionName",
  "religiousSpaceStartedBy",
  "religiousSpaceNameDateStartedBy",
  "leaderEthnicity",
  "leaderGender",
  "leaderEducationalLevel",
  "leaderSufferedRacism",
  "communityAddress",
];

/** Sobe uma instância isolada com o middleware de validação sob teste. */
const startServer = async (): Promise<TestServer> => {
  const app = express();

  app.use(express.json());
  app.use(handleResponse);
  app.post(ENDPOINT, validateDTO(ReligiousCommunityCreateDTO), (req, res) => {
    res.status(201).send({ received: req.body });
  });

  const server = await new Promise<Server>((resolve) => {
    const running = app.listen(0, "127.0.0.1", () => resolve(running));
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");

  return { baseUrl: `http://127.0.0.1:${address.port}`, server };
};

const stopServer = async (server: Server) =>
  new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );

const post = (baseUrl: string, body: unknown) =>
  fetch(`${baseUrl}${ENDPOINT}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const errorFields = (body: any): string[] =>
  (body?.data?.errors ?? []).map((error: { field: string }) => error.field);

test("payload válido é aceito pelo middleware", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, validPayload);
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.received.religiousSpaceName, "Ilê Axé Teste");

    for (const field of REQUIRED_FIELDS) {
      assert.ok(
        field in body.received,
        `payload aceito deve preservar ${field}`
      );
    }

    assert.deepEqual(body.received.communityGoogleApiLocalization, {
      lat: -7.115,
      long: -34.864,
    });
    assert.equal(body.received.leaderSufferedRacism, false);
  } finally {
    await stopServer(server);
  }
});

test("payload sem localização é aceito (geocoding fica no servidor)", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const { communityGoogleApiLocalization: _omitted, ...withoutLocation } =
      validPayload;
    const response = await post(baseUrl, withoutLocation);
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.ok(
      !("communityGoogleApiLocalization" in body.received),
      "localização omitida não deve ser exigida"
    );
  } finally {
    await stopServer(server);
  }
});

test("payload vazio retorna 400 com erro para cada campo obrigatório", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, {});
    const body = await response.json();
    const fields = errorFields(body);

    assert.equal(response.status, 400);
    for (const required of REQUIRED_FIELDS) {
      assert.ok(fields.includes(required), `deve apontar erro em ${required}`);
    }
  } finally {
    await stopServer(server);
  }
});

test("payload com tipos e enums inválidos retorna 400 com erros por campo", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, {
      ...validPayload,
      authorization: "sim",
      communityType: "tipo-inexistente",
      religiousSpaceNation: "nação-inexistente",
      religiousSpaceYearFoundation: "mil novecentos e oitenta",
      religiousSpaceLeaderName: 42,
    });
    const body = await response.json();
    const fields = errorFields(body);

    assert.equal(response.status, 400);
    for (const field of [
      "authorization",
      "communityType",
      "religiousSpaceNation",
      "religiousSpaceYearFoundation",
      "religiousSpaceLeaderName",
    ]) {
      assert.ok(fields.includes(field), `deve apontar erro em ${field}`);
    }
    assert.ok(
      body.data.errors.every(
        (error: { messages: string[] }) =>
          Array.isArray(error.messages) && error.messages.length > 0
      ),
      "cada erro deve trazer mensagens de validação"
    );
  } finally {
    await stopServer(server);
  }
});

test("campos novos com tipos e enum inválidos retornam 400 com erros por campo", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, {
      ...validPayload,
      religiousSpacePraticalLanguages: "esperanto",
      religiousSpaceNameDateStartedBy: "data-invalida",
      religiousSpaceLeaderFoundation: "",
      leaderGender: 42,
      leaderSufferedRacism: "não",
      communityGoogleApiLocalization: { lat: "abc", long: null },
    });
    const body = await response.json();
    const fields = errorFields(body);

    assert.equal(response.status, 400);
    for (const field of [
      "religiousSpacePraticalLanguages",
      "religiousSpaceNameDateStartedBy",
      "religiousSpaceLeaderFoundation",
      "leaderGender",
      "leaderSufferedRacism",
      "communityGoogleApiLocalization.lat",
      "communityGoogleApiLocalization.long",
    ]) {
      assert.ok(fields.includes(field), `deve apontar erro em ${field}`);
    }
  } finally {
    await stopServer(server);
  }
});

test("campo obrigatório novo ausente retorna 400", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const { leaderEthnicity: _omitted, ...withoutEthnicity } = validPayload;
    const response = await post(baseUrl, withoutEthnicity);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(
      errorFields(body).includes("leaderEthnicity"),
      "deve apontar leaderEthnicity como obrigatório"
    );
  } finally {
    await stopServer(server);
  }
});

test("endereço incompleto retorna 400 com erro no campo aninhado", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, {
      ...validPayload,
      communityAddress: { ...validPayload.communityAddress, street: "" },
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(
      errorFields(body).includes("communityAddress.street"),
      "deve apontar erro em communityAddress.street"
    );
  } finally {
    await stopServer(server);
  }
});

test("campos não previstos no DTO são descartados (whitelist)", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, {
      ...validPayload,
      campoInventado: "não deve persistir",
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.received.campoInventado, undefined);
  } finally {
    await stopServer(server);
  }
});
