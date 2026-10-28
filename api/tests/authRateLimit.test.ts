import assert from "node:assert/strict";
import type { Server } from "node:http";
import test from "node:test";
import express from "express";
import handleResponse from "../src/middlewares/handleResponse";
import {
  authGenerateTokenRateLimit,
  authLoginRateLimit,
  authVerifyOtpRateLimit,
} from "../src/middlewares/rateLimit";

/**
 * Rotas de autenticação precisam de limite próprio: senha e código de seis
 * dígitos são alvos de força bruta, e a geração de token dispara e-mail.
 */

const startServer = async (): Promise<{ server: Server; baseUrl: string }> => {
  const app = express();
  app.use(express.json());
  app.use(handleResponse);

  app.post("/login", authLoginRateLimit, (_req, res) => {
    res.status(200).send({ ok: true });
  });
  app.post("/verify-otp", authVerifyOtpRateLimit, (_req, res) => {
    res.status(200).send({ ok: true });
  });
  app.get("/token", authGenerateTokenRateLimit, (_req, res) => {
    res.status(200).send({ ok: true });
  });

  const server = await new Promise<Server>((resolve) => {
    const running = app.listen(0, "127.0.0.1", () => resolve(running));
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");

  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
};

const stop = (server: Server) =>
  new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );

test("login bloqueia depois de 10 tentativas no minuto", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const response = await fetch(`${baseUrl}/login`, { method: "POST" });
      statuses.push(response.status);
    }

    assert.deepEqual(statuses.slice(0, 10), Array(10).fill(200));
    assert.equal(statuses[10], 429);
  } finally {
    await stop(server);
  }
});

test("verify-otp bloqueia depois de 10 tentativas no minuto", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const response = await fetch(`${baseUrl}/verify-otp`, {
        method: "POST",
      });
      statuses.push(response.status);
    }

    assert.equal(statuses[10], 429);
  } finally {
    await stop(server);
  }
});

test("geração de token bloqueia depois de 3 pedidos no minuto", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetch(`${baseUrl}/token`);
      statuses.push(response.status);
    }

    assert.deepEqual(statuses.slice(0, 3), [200, 200, 200]);
    assert.deepEqual(statuses.slice(3), [429, 429]);
  } finally {
    await stop(server);
  }
});
