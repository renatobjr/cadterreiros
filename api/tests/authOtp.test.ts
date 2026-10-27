import "reflect-metadata";
import assert from "node:assert/strict";
import test, { afterEach, mock } from "node:test";
import { User } from "../src/schemas/User";
import mailUtils from "../src/utils/mail.utils";
import tokenUtils from "../src/utils/token.utils";
import { authService } from "../src/services/auth.service";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "segredo-de-teste";

/**
 * O token do fluxo de recuperação trafega na URL. Ele não pode conter o código
 * OTP em claro, senão qualquer um que veja o link conclui a troca de senha.
 */

const USER_ID = "6ae0ef9d48741c2d20cb9a4b";

const user: any = {
  _id: USER_ID,
  email: "curadoria@cciao.org",
  fullname: "Curadoria",
  toJSON() {
    return { _id: USER_ID, email: this.email, fullname: this.fullname };
  },
};

let sentCode = "";

const stubFlow = () => {
  mock.method(User, "findOne", async () => user);
  mock.method(User, "findById", async () => user);
  mock.method(User, "updateOne", async () => ({ acknowledged: true }));
  mock.method(mailUtils, "sendMail", async () => undefined);
  mock.method(
    mailUtils,
    "template",
    async (options: any) => {
      sentCode = options?.data?.code ?? "";
      return "<html>código</html>";
    }
  );
};

const decodePayload = (token: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));

test("token de recuperação não expõe o código em claro", async () => {
  stubFlow();

  try {
    const response = await authService.generateUserToken(user.email, true);
    const token = response.data as string;
    const payload = decodePayload(token);

    assert.ok(sentCode.length === 6, "o e-mail deve receber seis dígitos");
    assert.equal(payload.code, undefined);
    assert.equal(typeof payload.codeHash, "string");
    assert.ok(!token.includes(sentCode), "o código não pode estar no token");
    assert.ok(!JSON.stringify(payload).includes(sentCode));
  } finally {
    mock.restoreAll();
  }
});

test("verifyOTP aceita o código enviado por e-mail", async () => {
  stubFlow();

  try {
    const response = await authService.generateUserToken(user.email, true);
    const token = response.data as string;

    const verified = await authService.verifyOTP(token, sentCode);

    assert.equal(verified.status, true);
  } finally {
    mock.restoreAll();
  }
});

test("verifyOTP recusa código diferente do enviado", async () => {
  stubFlow();

  try {
    const response = await authService.generateUserToken(user.email, true);
    const token = response.data as string;
    const wrong = sentCode === "000000" ? "111111" : "000000";

    const verified = await authService.verifyOTP(token, wrong);

    assert.equal(verified.status, false);
  } finally {
    mock.restoreAll();
  }
});

test("verifyOTP recusa token sem codeHash", async () => {
  const legacyToken = tokenUtils.generate(
    { id: USER_ID, email: user.email, code: "123456" },
    { expiresIn: "15m" }
  );

  const verified = await authService.verifyOTP(legacyToken, "123456");

  assert.equal(verified.status, false);
});

afterEach(() => mock.restoreAll());
