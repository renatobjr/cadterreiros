import assert from "node:assert/strict";
import type { Server } from "node:http";
import test from "node:test";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import requireApiKey from "../src/middlewares/requireApiKey";
import { createRateLimit } from "../src/middlewares/rateLimit";

const API_KEY = "chave-de-teste";
const ENDPOINT = "/public/create";

type TestServer = {
  baseUrl: string;
  server: Server;
};

/**
 * Cada teste sobe sua própria instância (rate-limit com store limpo),
 * na ordem usada pelo /public/create: rate-limit -> header obrigatório.
 */
const startServer = async (): Promise<TestServer> => {
  const app = express();

  app.use(handleResponse);
  app.post(ENDPOINT, createRateLimit(), requireApiKey, (_req, res) => {
    res.status(201).send({ created: true });
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

const post = (baseUrl: string, headers: Record<string, string> = {}) =>
  fetch(`${baseUrl}${ENDPOINT}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ religiousSpaceName: "Ilê Teste" }),
  });

test("POST /public/create sem header x-cadterreiros-api retorna 403", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl);

    assert.equal(response.status, 403);
  } finally {
    await stopServer(server);
  }
});

test("POST /public/create com header x-cadterreiros-api inválido retorna 403", async () => {
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, { "x-cadterreiros-api": "valor-errado" });

    assert.equal(response.status, 403);
  } finally {
    await stopServer(server);
  }
});

test("POST /public/create com header válido é autorizado", async () => {
  process.env.CADTERREIROS_API_KEY = API_KEY;
  const { baseUrl, server } = await startServer();

  try {
    const response = await post(baseUrl, { "x-cadterreiros-api": API_KEY });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.created, true);
  } finally {
    await stopServer(server);
    delete process.env.CADTERREIROS_API_KEY;
  }
});

test("POST /public/create 6x em 1 min retorna 429 com Retry-After", async () => {
  process.env.CADTERREIROS_API_KEY = API_KEY;
  const { baseUrl, server } = await startServer();

  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await post(baseUrl, { "x-cadterreiros-api": API_KEY });
      assert.equal(response.status, 201, `requisição ${attempt} deveria passar`);
    }

    const blocked = await post(baseUrl, { "x-cadterreiros-api": API_KEY });

    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers.get("retry-after"), "deve retornar Retry-After");
  } finally {
    await stopServer(server);
    delete process.env.CADTERREIROS_API_KEY;
  }
});
