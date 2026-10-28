import assert from "node:assert/strict";
import test from "node:test";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";

const schema = ReligiousCommunity.schema;

const minimalCommunity = {
  authorization: true,
  communityGoogleApiLocalization: { lat: -7.115, long: -34.864 },
  communityAddress: {
    fullAddress: "Rua Exemplo, 1",
    street: "Rua Exemplo",
    number: "1",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
  communityType: "matriz africana",
  religiousSpaceYearFoundation: 1980,
  religiousSpaceLeaderFoundation: "Mãe Exemplo",
  religiousSpaceNation: "ketu",
  religiousSpacePraticalLanguages: "yoruba",
  religiousSpaceName: "Ilê Exemplo",
  religiousSpaceLeaderName: "Mãe Exemplo",
  religiousSpacePositionName: "Ialorixá",
  religiousSpaceStartedBy: "Mãe Exemplo",
  religiousSpaceNameDateStartedBy: "1980-01-01",
  leaderEthnicity: "negra",
  leaderGender: "feminino",
  leaderEducationalLevel: "ensino médio",
  leaderSufferedRacism: false,
};

test("registeredVoluntarily: boolean com default false", () => {
  const path = schema.path("registeredVoluntarily");
  assert.ok(path, "campo registeredVoluntarily deve existir");
  assert.equal(path.instance, "Boolean");
  assert.equal(path.options.required, false);
  assert.equal(path.options.default, false);
});

test("censusTaker: opcional com default null", () => {
  const path = schema.path("censusTaker");
  assert.ok(path, "campo censusTaker deve existir");
  assert.equal(path.instance, "ObjectId");
  assert.equal(path.options.required, false);
  assert.equal(path.options.default, null);
});

test("comunidade sem censusTaker é válida e assume defaults", () => {
  const doc = new ReligiousCommunity({ ...minimalCommunity });

  assert.equal(doc.validateSync(), undefined);
  assert.equal(doc.registeredVoluntarily, false);
  assert.equal(doc.censusTaker ?? null, null);
});
