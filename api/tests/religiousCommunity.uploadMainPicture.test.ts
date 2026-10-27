import "reflect-metadata";
import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";
import type { Server } from "node:http";
import fs from "node:fs";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import {
  publicCreateRateLimit,
  publicUploadMainPictureRateLimit,
} from "../src/middlewares/rateLimit";
import religiousCommunityRoutes from "../src/routes/religiousCommunity.routes";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";
import fileUtils from "../src/utils/file.utils";

const API_KEY = "chave-de-teste";
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const communityId = "64b7f9c2f1a2b3c4d5e6f7a8";
const uploadEndpoint = `${basePath}/religious-communities/public/upload-main-picture/${communityId}`;
const createEndpoint = `${basePath}/religious-communities/public/create`;

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
const originalUpdateOne = ReligiousCommunity.updateOne.bind(
  ReligiousCommunity
);

let createdPayload: Record<string, unknown> | undefined;
let updatedFilter: Record<string, unknown> | undefined;
let updatedPayload: Record<string, unknown> | undefined;
const uploadedFiles: string[] = [];
let server: Server;
let baseUrl: string;

const resetRateLimits = async () => {
  for (const key of ["127.0.0.1", "::1", "::ffff:127.0.0.1"]) {
    await publicCreateRateLimit.resetKey(key);
    await publicUploadMainPictureRateLimit.resetKey(key);
  }
};

const authorized = { "x-cadterreiros-api": API_KEY };

const postJson = (endpoint: string, body: unknown, headers = {}) =>
  fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

const postPicture = (headers: Record<string, string> = {}) => {
  const form = new FormData();
  form.append(
    "file",
    new Blob([Buffer.from("fake-image")], { type: "image/png" }),
    "terreiro.png"
  );

  return fetch(`${baseUrl}${uploadEndpoint}`, {
    method: "POST",
    headers,
    body: form,
  });
};

const postEmptyPicture = (headers: Record<string, string> = {}) => {
  const form = new FormData();

  return fetch(`${baseUrl}${uploadEndpoint}`, {
    method: "POST",
    headers,
    body: form,
  });
};

before(async () => {
  process.env.CADTERREIROS_API_KEY = API_KEY;

  (ReligiousCommunity as any).create = async (
    payload: Record<string, unknown>
  ) => {
    createdPayload = payload;
    return new ReligiousCommunity(payload);
  };

  (ReligiousCommunity as any).updateOne = async (
    filter: Record<string, unknown>,
    update: Record<string, unknown>
  ) => {
    updatedFilter = filter;
    updatedPayload = update;
    return { acknowledged: true, modifiedCount: 1 };
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
  updatedFilter = undefined;
  updatedPayload = undefined;
  await resetRateLimits();
});

after(async () => {
  (ReligiousCommunity as any).create = originalCreate;
  (ReligiousCommunity as any).updateOne = originalUpdateOne;
  delete process.env.CADTERREIROS_API_KEY;

  for (const filename of uploadedFiles) {
    fs.rmSync(fileUtils.getPublicPath(filename), { force: true });
  }

  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("POST /public/upload-main-picture/:id com header e arquivo retorna 200", async () => {
  const response = await postPicture(authorized);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.status, true);
  assert.match(String(body.data.data), /\.png$/);

  uploadedFiles.push(body.data.data);

  assert.ok(
    fs.existsSync(fileUtils.getPublicPath(body.data.data)),
    "a foto deve ser gravada em uploads/religiousCommunities"
  );
  assert.equal(
    String((updatedFilter as { _id?: unknown })?._id),
    communityId,
    "deve atualizar a comunidade pelo id"
  );
  assert.deepEqual(updatedPayload, {
    $set: { religiousSpaceMainPicture: body.data.data },
  });
});

test("POST /public/upload-main-picture/:id sem header x-cadterreiros-api retorna 403", async () => {
  const response = await postPicture();

  assert.equal(response.status, 403);
  assert.equal(updatedPayload, undefined, "não deve gravar a foto sem api key");
});

test("POST /public/upload-main-picture/:id sem arquivo retorna 400 (foto opcional)", async () => {
  const response = await postEmptyPicture(authorized);

  assert.equal(response.status, 400);
  assert.equal(updatedPayload, undefined, "não deve atualizar sem arquivo");
});

test("POST /public/upload-main-picture/:id 6x em 1 min retorna 429 na sexta requisição", async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await postPicture(authorized);
    const body = await response.json();

    assert.equal(response.status, 200, `requisição ${attempt} deveria passar`);
    uploadedFiles.push(body.data.data);
  }

  const blocked = await postPicture(authorized);

  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get("retry-after"), "deve retornar Retry-After");
});

test("cadastro público pode ser criado sem foto (upload é opcional)", async () => {
  const response = await postJson(createEndpoint, validPayload, authorized);
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.status, true);
  assert.equal(createdPayload?.religiousSpaceMainPicture, undefined);
  assert.equal(updatedPayload, undefined, "cadastro não deve exigir upload");
});
