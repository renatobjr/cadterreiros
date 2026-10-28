import "reflect-metadata";
import assert from "node:assert/strict";
import test, { afterEach, mock } from "node:test";
import { User } from "../src/schemas/User";
import mailUtils from "../src/utils/mail.utils";
import tokenUtils from "../src/utils/token.utils";
import { authService } from "../src/services/auth.service";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "segredo-de-teste";

/**
 * O token de recuperação viaja na URL. Ele NÃO pode trocar a senha: para isso
 * existe o token de reset emitido só depois do OTP verificado.
 */

const USER_ID = "6ae0ef9d48741c2d20cb9a4b";

const user: any = {
  _id: USER_ID,
  email: "curadoria@cciao.org",
  fullname: "Curadoria",
  password: "$2b$10$hash-secreto",
  isFirstLogin: true,
  toJSON() {
    return {
      _id: USER_ID,
      email: this.email,
      fullname: this.fullname,
      password: this.password,
    };
  },
};

let sentCode = "";
let updated: Record<string, unknown> | undefined;

const stubFlow = () => {
  updated = undefined;
  sentCode = "";
  mock.method(User, "findOne", async () => user);
  mock.method(User, "findById", async () => user);
  mock.method(User, "updateOne", async (_query: any, update: any) => {
    updated = update;
    return { acknowledged: true };
  });
  mock.method(mailUtils, "sendMail", async () => undefined);
  mock.method(mailUtils, "template", async (options: any) => {
    sentCode = options?.data?.code ?? "";
    return "<html>código</html>";
  });
};

const recoveryToken = async () => {
  const response = await authService.generateUserToken(user.email, true);
  return response.data as string;
};

test("verifyOTP emite token de reset com escopo próprio", async () => {
  stubFlow();

  try {
    const token = await recoveryToken();
    const verified = await authService.verifyOTP(token, sentCode);
    const decoded: any = tokenUtils.verify(
      (verified.data as any).token as string
    );

    assert.equal(verified.status, true);
    assert.equal(decoded.scope, "password-reset");
    assert.equal(String(decoded.id), USER_ID);
    assert.equal(decoded.codeHash, undefined);
  } finally {
    mock.restoreAll();
  }
});

test("setPassword recusa o token de recuperação (sem OTP verificado)", async () => {
  stubFlow();

  try {
    const token = await recoveryToken();
    const response = await authService.setPassword(token, "senha-nova-123", "");

    assert.equal(response.status, false);
    // Nenhuma atualização de senha (o token só persistido é o de recuperação).
    assert.equal(updated?.password, undefined);
  } finally {
    mock.restoreAll();
  }
});

test("setPassword aceita o token emitido pelo verifyOTP", async () => {
  stubFlow();

  try {
    const token = await recoveryToken();
    const verified = await authService.verifyOTP(token, sentCode);
    const resetToken = (verified.data as any).token as string;

    const response = await authService.setPassword(
      resetToken,
      "senha-nova-123",
      ""
    );

    assert.equal(response.status, true);
    assert.deepEqual(response.data, { id: USER_ID });
    assert.ok(updated?.password);
    assert.equal(updated?.isFirstLogin, false);
    assert.equal(updated?.token, undefined);
  } finally {
    mock.restoreAll();
  }
});

test("setPassword recusa senha menor que oito caracteres", async () => {
  stubFlow();

  try {
    const token = await recoveryToken();
    const verified = await authService.verifyOTP(token, sentCode);
    const resetToken = (verified.data as any).token as string;

    const response = await authService.setPassword(resetToken, "1234567", "");

    assert.equal(response.status, false);
    assert.match(String(response.error), /pelo menos 8 caracteres/);
    assert.equal(updated?.password, undefined);
  } finally {
    mock.restoreAll();
  }
});

test("setPassword não devolve o hash da senha", async () => {
  stubFlow();

  try {
    const token = await recoveryToken();
    const verified = await authService.verifyOTP(token, sentCode);
    const resetToken = (verified.data as any).token as string;

    const response = await authService.setPassword(
      resetToken,
      "senha-nova-123",
      ""
    );
    const serialized = JSON.stringify(response.data);

    assert.ok(!serialized.includes("hash-secreto"));
    assert.ok(!serialized.includes("password"));
  } finally {
    mock.restoreAll();
  }
});

test("verifyOTP não expõe o hash da senha no payload", async () => {
  stubFlow();

  try {
    const token = await recoveryToken();
    const verified = await authService.verifyOTP(token, sentCode);

    assert.ok(!JSON.stringify(verified.data).includes("hash-secreto"));
  } finally {
    mock.restoreAll();
  }
});

afterEach(() => mock.restoreAll());
