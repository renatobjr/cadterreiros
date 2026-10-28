import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { getMetadataStorage } from "class-validator";
import { ReligiousCommunity } from "../src/schemas/ReligiousCommunity";
import { ReligiousCommunityCreateDTO } from "../src/dtos/religiousCommunitiesDTOS/religiousCommunitiesCreate.DTO";

/**
 * Campos `required: true` do schema que são preenchidos pelo servidor
 * (defaults/estado interno), portanto não fazem parte do payload público.
 */
const SERVER_MANAGED_FIELDS = new Set([
  "religiousSpaceStatus",
  "censusStep",
  "createdAt",
  "updatedAt",
]);

const dtoValidationFields = (): Set<string> =>
  new Set(
    getMetadataStorage()
      .getTargetValidationMetadatas(
        ReligiousCommunityCreateDTO,
        "",
        false,
        false
      )
      .map((metadata) => metadata.propertyName)
  );

const requiredSchemaFields = (): string[] =>
  Object.entries(ReligiousCommunity.schema.paths)
    .filter(
      ([name, path]) =>
        (path as { options?: { required?: boolean } }).options?.required ===
          true && !SERVER_MANAGED_FIELDS.has(name)
    )
    .map(([name]) => name);

test("DTO declara todos os campos required do schema enviados pelo cliente", () => {
  const fields = dtoValidationFields();
  const required = requiredSchemaFields();

  assert.ok(required.length > 0, "schema deve ter campos required");

  for (const field of required) {
    assert.ok(fields.has(field), `DTO deve declarar campo required: ${field}`);
  }
});

test("DTO declara os campos obrigatórios adicionados na T52", () => {
  const fields = dtoValidationFields();

  for (const field of [
    "communityGoogleApiLocalization",
    "religiousSpaceLeaderFoundation",
    "religiousSpacePraticalLanguages",
    "religiousSpacePositionName",
    "religiousSpaceStartedBy",
    "religiousSpaceNameDateStartedBy",
    "leaderEthnicity",
    "leaderGender",
    "leaderEducationalLevel",
    "leaderSufferedRacism",
  ]) {
    assert.ok(fields.has(field), `DTO deve declarar ${field}`);
  }
});
