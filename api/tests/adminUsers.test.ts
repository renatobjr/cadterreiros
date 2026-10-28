import "reflect-metadata";
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import type { Server } from "node:http";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import usersRoutes from "../src/routes/users.route";
import { ERole, User } from "../src/schemas/User";
import { usersService } from "../src/services/users.service";
import tokenUtils from "../src/utils/token.utils";

/**
 * Regras de gestão de equipe: ninguém desativa nem rebaixa a própria conta,
 * e o convite leva o nome junto do e-mail (o template usa esse nome).
 */

const basePath = process.env.NODE_BASE_URL || "/api/v1";
const statusPath = `${basePath}/users/set-user-status`;
const rolePath = `${basePath}/users/change-user-role`;
const addPath = `${basePath}/users/add-user`;

const USERS: Record<string, unknown> = {
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
};

const calls: Record<string, unknown[][]> = {
  status: [],
  role: [],
  add: [],
};

const originalVerify = tokenUtils.verify;
const originalFindById = User.findById;
const originalService = {
  setUserStatus: usersService.setUserStatus,
  changeUserRole: usersService.changeUserRole,
  addUser: usersService.addUser,
};

let server: Server;
let baseUrl: string;

const headers = (token: string) => ({
  "Content-Type": "application/json",
  "X-Access-Token": `Bearer ${token}`,
});

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

  (usersService as any).setUserStatus = async (id: string, status: boolean) => {
    calls.status.push([id, status]);
    return { status: true, data: { id, isEnabled: status } };
  };
  (usersService as any).changeUserRole = async (id: string, role: string) => {
    calls.role.push([id, role]);
    return { status: true, data: { id, role } };
  };
  (usersService as any).addUser = async (
    email: string,
    role: string,
    fullname?: string
  ) => {
    calls.add.push([email, role, fullname]);
    return { status: true, data: { email, role, fullname } };
  };

  const app = express();
  app.use(express.json());
  app.use(handleResponse);
  app.use(usersRoutes);

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
  Object.assign(usersService, originalService);

  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("admin não desativa a própria conta", async () => {
  calls.status.length = 0;

  const response = await fetch(`${baseUrl}${statusPath}`, {
    method: "PUT",
    headers: headers("user-admin"),
    body: JSON.stringify({ id: "user-admin", status: false }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(JSON.stringify(body), /não pode desativar a própria conta/);
  assert.equal(calls.status.length, 0, "serviço não deve ser chamado");
});

test("admin desativa outra pessoa", async () => {
  calls.status.length = 0;

  const response = await fetch(`${baseUrl}${statusPath}`, {
    method: "PUT",
    headers: headers("user-admin"),
    body: JSON.stringify({ id: "user-taker", status: false }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls.status, [["user-taker", false]]);
});

test("admin não rebaixa a própria conta", async () => {
  calls.role.length = 0;

  const response = await fetch(`${baseUrl}${rolePath}`, {
    method: "PUT",
    headers: headers("user-admin"),
    body: JSON.stringify({ id: "user-admin", role: "census_taker" }),
  });

  assert.equal(response.status, 400);
  assert.equal(calls.role.length, 0);
});

test("convite leva nome, e-mail e papel", async () => {
  calls.add.length = 0;

  const response = await fetch(`${baseUrl}${addPath}`, {
    method: "POST",
    headers: headers("user-admin"),
    body: JSON.stringify({
      fullname: "Nova Pessoa",
      email: "nova@teste.local",
      role: "census_taker",
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls.add, [
    ["nova@teste.local", "census_taker", "Nova Pessoa"],
  ]);
});

test("recenseador não acessa a gestão de equipe", async () => {
  const response = await fetch(`${baseUrl}${statusPath}`, {
    method: "PUT",
    headers: headers("user-taker"),
    body: JSON.stringify({ id: "user-admin", status: false }),
  });

  assert.equal(response.status, 403);
});
