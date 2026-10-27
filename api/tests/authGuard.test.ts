import "reflect-metadata";
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import type { Server } from "node:http";
import express from "express";
import { plainToInstance } from "class-transformer";
import handleResponse from "../src/middlewares/handleResponse";
import religiousCommunityRoutes from "../src/routes/religiousCommunity.routes";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";
import { ERole, User } from "../src/schemas/User";
import tokenUtils from "../src/utils/token.utils";
import { ReligiousCommunitiesGetByIdDTO } from "../src/dtos/religiousCommunitiesDTOS/religiousCommunitiesGetById.DTO";

/**
 * Guarda de autenticação/autorização: token inválido nunca pode chegar ao
 * controller e recenseador não pode executar ação de curadoria.
 */

const basePath = process.env.NODE_BASE_URL || "/api/v1";
const listPath = `${basePath}/religious-communities/list`;
const approvePath = `${basePath}/religious-communities/approve-census`;

const originalVerify = tokenUtils.verify;
const originalFindById = User.findById;
const originalAggregate = ReligiousCommunity.aggregate;

const USERS: Record<string, any> = {
  "user-admin": {
    _id: "user-admin",
    email: "admin@teste.local",
    fullname: "Admin",
    role: ERole.ADMIN,
    isEnabled: true,
  },
  "user-taker": {
    _id: "user-taker",
    email: "taker@teste.local",
    fullname: "Recenseador",
    role: ERole.CENSUS_TAKER,
    isEnabled: true,
  },
  "user-disabled": {
    _id: "user-disabled",
    email: "off@teste.local",
    fullname: "Desativado",
    role: ERole.ADMIN,
    isEnabled: false,
  },
};

let server: Server;
let baseUrl: string;

const authHeaders = (token: string) => ({ "X-Access-Token": `Bearer ${token}` });

before(async () => {
  (tokenUtils as any).verify = (token: string) =>
    USERS[token] ? { id: token } : null;

  (User as any).findById = (id: string) => {
    const query = {
      select: () => query,
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(USERS[id] ?? null).then(resolve),
    };
    return query;
  };

  (ReligiousCommunity as any).aggregate = async () => [];

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

after(async () => {
  (tokenUtils as any).verify = originalVerify;
  (User as any).findById = originalFindById;
  (ReligiousCommunity as any).aggregate = originalAggregate;

  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("rota privada sem token responde 401", async () => {
  const response = await fetch(`${baseUrl}${listPath}`);

  assert.equal(response.status, 401);
});

test("token inválido responde 401 e não chega ao controller", async () => {
  for (const token of ["lixo", "abc.def.ghi", ""]) {
    const response = await fetch(`${baseUrl}${listPath}`, {
      headers: token ? authHeaders(token) : {},
    });

    assert.equal(response.status, 401, `token "${token}" deveria ser recusado`);
  }
});

test("token de usuário desativado responde 401", async () => {
  const response = await fetch(`${baseUrl}${listPath}`, {
    headers: authHeaders("user-disabled"),
  });

  assert.equal(response.status, 401);
});

test("recenseador pode listar todos os cadastros", async () => {
  const response = await fetch(`${baseUrl}${listPath}`, {
    headers: authHeaders("user-taker"),
  });

  assert.equal(response.status, 200);
});

test("recenseador não pode aprovar censo (403)", async () => {
  const response = await fetch(`${baseUrl}${approvePath}`, {
    method: "PUT",
    headers: { ...authHeaders("user-taker"), "content-type": "application/json" },
    body: JSON.stringify({ communityId: "x" }),
  });

  assert.equal(response.status, 403);
});

test("admin passa pela checagem de papel", async () => {
  const response = await fetch(`${baseUrl}${approvePath}`, {
    method: "PUT",
    headers: { ...authHeaders("user-admin"), "content-type": "application/json" },
    body: JSON.stringify({ communityId: "x" }),
  });

  assert.notEqual(response.status, 403);
  assert.notEqual(response.status, 401);
});

test("ficha pública não expõe contatos da liderança", () => {
  const dto = plainToInstance(
    ReligiousCommunitiesGetByIdDTO,
    {
      _id: "1",
      religiousSpaceName: "Terreiro Teste",
      religiousSpaceNation: "ketu",
      communityType: "comunidade de terreiro",
      religiousSpaceYearFoundation: 1990,
      communityAddress: { neighborhood: "Centro", city: "João Pessoa" },
      communityGoogleApiLocalization: { lat: -7.12, long: -34.88 },
      leaderContacts: { mobile: "83999999999", email: "lideranca@teste.local" },
    },
    { excludeExtraneousValues: true }
  ) as unknown as Record<string, unknown>;

  const serialized = JSON.stringify(dto);
  assert.equal(dto.leaderContacts, undefined);
  assert.ok(!serialized.includes("83999999999"));
  assert.ok(!serialized.includes("lideranca@teste.local"));
});
