/* Seed rápido para o sandbox: importa os 214 terreiros do
 * .artifacts/data/communities.json para o Mongo local.
 * Uso: npx ts-node --files scripts/seed-sandbox.ts
 * Não é usado em produção. */
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import {
  ECensusStep,
  EReligiousSpaceStatus,
  ReligiousCommunity,
} from "../src/schemas/ReligiousCommunity";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB = process.env.MONGO_INITDB_DATABASE || "cadterreiros_stg";

const jsonPath = path.resolve(
  __dirname,
  "../../.artifacts/data/communities.json",
);

type RawCommunity = {
  id: string;
  slug: string;
  name: string;
  nation: string;
  nationKey: string;
  type: string;
  typeKey: string;
  founded: number;
  languages: string;
  neighborhood: string;
  city: string;
  place: string;
  lat: number;
  lng: number;
  bio?: string;
  censusTaker?: string;
  surveyedAt?: string;
  photo?: string;
};

async function main() {
  const raw: RawCommunity[] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`[seed] ${raw.length} terreiros encontrados em ${jsonPath}`);

  await mongoose.connect(MONGO_URL, { dbName: DB });
  console.log(`[seed] conectado em ${MONGO_URL}/${DB}`);

  await ReligiousCommunity.deleteMany({ registeredVoluntarily: false });
  console.log("[seed] registros anteriores removidos");

  console.log(`[seed] raw is array: ${Array.isArray(raw)}, length: ${raw.length}`);
  const docs = raw.map((c) => {
    const founded = Number(c.founded);
    const validYear =
      Number.isFinite(founded) && founded > 1000 && founded < 2100
        ? founded
        : null;
    return {
      authorization: true,
      communityGoogleApiLocalization: { lat: c.lat, long: c.lng },
      communityAddress: {
        fullAddress: c.place || "",
        street: "",
        number: "",
        neighborhood: c.neighborhood || "",
        city: c.city || "",
        state: "PB",
        zipcode: "",
      },
      communityType: (c.type || "matriz africana").toLowerCase(),
      religiousSpaceYearFoundation: validYear,
      religiousSpaceLeaderFoundation: "não informado",
      religiousSpaceNation: (c.nation || "outros").toLowerCase(),
      religiousSpacePraticalLanguages: (c.languages || "outros").toLowerCase(),
      religiousSpaceName: c.name,
      religiousSpaceLeaderName: "não informado",
      religiousSpacePositionName: "não informado",
      religiousSpaceStartedBy: "não informado",
      religiousSpaceNameDateStartedBy: validYear ? new Date(`${validYear}-01-01`) : new Date("1900-01-01"),
      leaderContacts: {},
      leaderEthnicity: "não informado",
      leaderGender: "não informado",
      leaderEducationalLevel: "não informado",
      leaderSocialProgram: null,
      leaderSufferedRacism: false,
      religiousSpaceMainPicture: c.photo ? `/religiousCommunities/${c.photo.split("/").pop()}` : undefined,
      religiousSpaceStatus: EReligiousSpaceStatus.ACTIVE,
      bio: c.bio,
      censusStep: ECensusStep.APPROVED,
      censusTaker: null,
      registeredVoluntarily: false,
      rejectedReason: undefined,
    };
  });

  console.log(`[seed] docs prepared: ${docs.length}`);
  console.log(`[seed] sample:`, JSON.stringify(docs[0]).slice(0, 300));
  try {
    const result: any = await ReligiousCommunity.insertMany(docs, { ordered: false, rawResult: true });
    console.log(`[seed] insertedCount: ${result.insertedCount}`);
    console.log(`[seed] count after: ${await ReligiousCommunity.countDocuments()}`);
    if (result.writeErrors?.length) {
      console.error(`[seed] writeErrors: ${result.writeErrors.length}`);
      console.error(`[seed] primeiro: ${JSON.stringify(result.writeErrors[0]?.err).slice(0, 600)}`);
    }
  } catch (e: any) {
    console.error("[seed] insertMany error:", e?.message?.slice(0, 800));
    if (e?.writeErrors) {
      console.error("[seed] writeErrors:", e.writeErrors.length);
      console.error("[seed] primeiro erro:", JSON.stringify(e.writeErrors[0]?.err).slice(0, 800));
    }
    throw e;
  }

  await mongoose.disconnect();
  console.log("[seed] concluído");
}

main().catch((err) => {
  console.error("[seed] erro:", err);
  process.exit(1);
});
