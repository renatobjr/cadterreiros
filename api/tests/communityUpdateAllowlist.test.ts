import "reflect-metadata";
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";
import { User } from "../src/schemas/User";
import { religiousCommunityService } from "../src/services/religiousCommunity.service";
import mailUtils from "../src/utils/mail.utils";

/**
 * Edição do cadastro aceita apenas os campos do formulário: nada de trocar o
 * dono, forjar auditoria ou sair da etapa pendente pelo corpo da requisição.
 */

const captured: { update?: Record<string, unknown> } = {};

const originalFindById = ReligiousCommunity.findById;
const originalUserFindById = User.findById;
const originalUserFind = User.find;
const originalTemplate = mailUtils.template;
const originalSendMail = mailUtils.sendMail;

before(() => {
  (ReligiousCommunity as any).findById = async (id: string) => ({
    _id: id,
    religiousSpaceName: "Nome antigo",
    communityAddress: {
      street: "Rua A",
      number: "1",
      neighborhood: "Centro",
      city: "João Pessoa",
      state: "PB",
      zipcode: "58000-000",
      fullAddress: "Rua A - 1 - Centro - João Pessoa - PB - 58000-000",
    },
    censusTaker: "dono-atual",
    updateOne: async (update: Record<string, unknown>) => {
      captured.update = update;
      return { acknowledged: true };
    },
  });
  (User as any).findById = async () => ({
    fullname: "Ana",
    email: "ana@teste.local",
  });
  (User as any).find = async () => [];
  (mailUtils as any).template = async () => "<p>ok</p>";
  (mailUtils as any).sendMail = async () => undefined;
});

after(() => {
  (ReligiousCommunity as any).findById = originalFindById;
  (User as any).findById = originalUserFindById;
  (User as any).find = originalUserFind;
  (mailUtils as any).template = originalTemplate;
  (mailUtils as any).sendMail = originalSendMail;
});

test("update ignora dono, etapa, auditoria e origem", async () => {
  captured.update = undefined;

  const result = await religiousCommunityService.updateReligiousCommunity(
    "c1",
    {
      religiousSpaceName: "Nome novo",
      censusTaker: "outro-usuario",
      censusStep: "approved",
      decisionLog: [{ action: "approved", byName: "invasor" }],
      registeredVoluntarily: true,
      communityAddress: { street: "Rua B", city: "João Pessoa" },
    } as any
  );

  assert.equal(result.status, true);
  const update = (captured.update ?? {}) as Record<string, unknown>;
  assert.equal(update.religiousSpaceName, "Nome novo");
  assert.equal(update.censusStep, "pending");
  assert.equal(update.censusTaker, undefined);
  assert.equal(update.decisionLog, undefined);
  assert.equal(update.registeredVoluntarily, undefined);

  const address = update.communityAddress as Record<string, string>;
  assert.equal(address.street, "Rua B");
  assert.equal(address.neighborhood, "Centro", "campos não enviados são mantidos");
  assert.match(address.fullAddress, /Rua B/);
});

test("set-census-step recusa etapa fora do enum", async () => {
  const result = await religiousCommunityService.setCensusStep(
    "c1",
    "publicado" as any
  );

  assert.equal(result.status, false);
  assert.match(String(result.error), /Invalid census step/);
});
