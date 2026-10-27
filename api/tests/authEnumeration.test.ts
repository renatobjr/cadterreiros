import "reflect-metadata";
import assert from "node:assert/strict";
import test, { afterEach, mock } from "node:test";
import { User } from "../src/schemas/User";
import mailUtils from "../src/utils/mail.utils";
import tokenUtils from "../src/utils/token.utils";
import { authService } from "../src/services/auth.service";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "segredo-de-teste";

/**
 * Guard de enumeração: a recuperação de senha precisa responder igual para
 * e-mail cadastrado e não cadastrado.
 */

const findOne = () => mock.method(User, "findOne", async () => null);
const sendMail = () => mock.method(mailUtils, "sendMail", async () => undefined);
const template = () =>
  mock.method(mailUtils, "template", async () => "<html>código</html>");
const updateOne = () =>
  mock.method(User, "updateOne", async () => ({ acknowledged: true }));

const restoreAll = () => mock.restoreAll();

test("generateUserToken responde sucesso para e-mail não cadastrado", async () => {
  const userLookup = findOne();
  const mail = sendMail();
  const tpl = template();
  const update = updateOne();

  try {
    const response = await authService.generateUserToken(
      "ninguem@exemplo.com",
      true
    );

    assert.equal(response.status, true);
    assert.equal(typeof response.data, "string");
    assert.ok((response.data as string).length > 20);
    assert.equal(userLookup.mock.callCount(), 1);
    // Nenhum e-mail é enviado e nenhum token é persistido.
    assert.equal(mail.mock.callCount(), 0);
    assert.equal(tpl.mock.callCount(), 0);
    assert.equal(update.mock.callCount(), 0);
  } finally {
    restoreAll();
  }
});

test("generateUserToken devolve token válido para e-mail não cadastrado", async () => {
  findOne();

  try {
    const response = await authService.generateUserToken(
      "ninguem@exemplo.com",
      false
    );

    const decoded: any = tokenUtils.verify(response.data as string);
    assert.ok(decoded);
    assert.equal(decoded.email, "ninguem@exemplo.com");
    // O `id` do token descartável não corresponde a um usuário real.
    assert.ok(decoded.id);
  } finally {
    restoreAll();
  }
});

test("generateUserToken envia e-mail e persiste token para cadastro existente", async () => {
  const user: any = {
    _id: "6ae0ef9d48741c2d20cb9a4b",
    email: "curadoria@cciao.org",
    fullname: "Curadoria",
  };
  mock.method(User, "findOne", async () => user);
  const mail = sendMail();
  template();
  const update = updateOne();

  try {
    const response = await authService.generateUserToken(
      "curadoria@cciao.org",
      true
    );

    assert.equal(response.status, true);
    assert.equal(typeof response.data, "string");
    assert.equal(mail.mock.callCount(), 1);
    assert.equal(update.mock.callCount(), 1);
  } finally {
    restoreAll();
  }
});

test("respostas para e-mail existente e inexistente têm o mesmo formato", async () => {
  mock.method(User, "findOne", async () => null);
  sendMail();
  template();
  updateOne();
  const missing = await authService.generateUserToken("ninguem@exemplo.com", true);
  restoreAll();

  mock.method(User, "findOne", async () => ({
    _id: "6ae0ef9d48741c2d20cb9a4b",
    email: "curadoria@cciao.org",
    fullname: "Curadoria",
  }));
  sendMail();
  template();
  updateOne();
  const existing = await authService.generateUserToken(
    "curadoria@cciao.org",
    true
  );
  restoreAll();

  assert.equal(missing.status, existing.status);
  assert.equal(typeof missing.data, typeof existing.data);
  assert.equal(String(missing.data).split(".").length, String(existing.data).split(".").length);
  assert.equal("error" in missing, "error" in existing);
});

afterEach(() => restoreAll());
