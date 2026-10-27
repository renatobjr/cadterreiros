/* Seed do sandbox: usa os dados reais de produção (`initialData.ts`), que
 * incluem leaderGender / leaderEthnicity / leaderEducationalLevel e as fotos
 * originais. Copia as fotos de `mapped_files/` para `uploads/` e insere.
 * Uso: npx ts-node --files scripts/seed-sandbox.ts */
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  ECensusStep,
  EReligiousSpaceStatus,
  ReligiousCommunity,
} from "../src/schemas/ReligiousCommunity";
import { ReligiousCommunityInitialData } from "../src/db/data/initialData";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB = process.env.MONGO_INITDB_DATABASE || "cadterreiros_stg";

const MAPPED_FILES = path.resolve(__dirname, "../src/db/mapped_files");
const UPLOADS = path.resolve(__dirname, "../uploads/religiousCommunities");
const COMMUNITIES_JSON = path.resolve(__dirname, "../../.artifacts/data/communities.json");

type Snapshot = {
  name: string;
  neighborhood?: string;
  city?: string;
  place?: string;
};

function loadSnapshot(): Map<string, Snapshot> {
  const raw = JSON.parse(fs.readFileSync(COMMUNITIES_JSON, "utf8")) as Snapshot[];
  return new Map(raw.map((c) => [c.name.trim().toLowerCase(), c]));
}

async function main() {
  console.log(`[seed] ${ReligiousCommunityInitialData.length} registros reais`);

  await mongoose.connect(MONGO_URL, { dbName: DB });
  console.log(`[seed] conectado em ${MONGO_URL}/${DB}`);

  fs.mkdirSync(UPLOADS, { recursive: true });
  const snapshot = loadSnapshot();

  await ReligiousCommunity.deleteMany({});
  console.log("[seed] registros anteriores removidos");

  const docs = ReligiousCommunityInitialData.map((c) => {
    // Foto: copia de mapped_files e guarda apenas o nome do arquivo.
    let filename: string | undefined;
    const source = c.religiousSpaceMainPicture
      ? path.join(MAPPED_FILES, String(c.religiousSpaceMainPicture))
      : null;
    if (source && fs.existsSync(source)) {
      const extension = path.extname(source);
      filename = `${randomUUID()}${extension}`;
      fs.copyFileSync(source, path.join(UPLOADS, filename));
    }

    return {
      ...c,
      authorization: Boolean(c.authorization),
      communityAddress: (() => {
        const snap = snapshot.get(String(c.religiousSpaceName ?? "").trim().toLowerCase());
        return {
          fullAddress: snap?.place ?? "não informado",
          street: "",
          number: "",
          neighborhood: snap?.neighborhood ?? "",
          city: snap?.city ?? "",
          state: "PB",
          zipcode: "",
        };
      })(),
      religiousSpaceMainPicture: filename,
      censusStep: ECensusStep.APPROVED,
      censusTaker: null,
      registeredVoluntarily: false,
      religiousSpaceStatus: EReligiousSpaceStatus.ACTIVE,
    };
  });

  const stats = {
    gender: docs.reduce<Record<string, number>>((acc, d) => {
      const k = (d as { leaderGender?: string }).leaderGender ?? "não informado";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
    ethnicity: docs.reduce<Record<string, number>>((acc, d) => {
      const k = (d as { leaderEthnicity?: string }).leaderEthnicity ?? "não informado";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  };

  const result = await ReligiousCommunity.insertMany(docs, { ordered: false });
  console.log(`[seed] ${result.length} registros inseridos`);
  console.log("[seed] gênero:", stats.gender);
  console.log("[seed] etnia:", stats.ethnicity);

  await mongoose.disconnect();
  console.log("[seed] concluído");
}

main().catch((err) => {
  console.error("[seed] erro:", err);
  process.exit(1);
});
