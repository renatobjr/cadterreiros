import client from "./client";
import type {
  CityStats,
  DecadeStats,
  EthnicityStats,
  GenderStats,
  LanguageStats,
  NationStats,
  NeighborhoodStats,
  PhotoCoverageStats,
  ReligiousCommunity,
  StatsSummary,
  TypeByNationStats,
  TypeStats,
} from "../domain/types";

const URL = "religious-communities";
const STATS_URL = `${URL}/public/stats`;

export interface CommunitySearchParams {
  search?: string;
  [key: string]: unknown;
}

/**
 * Extrai o payload do envelope da API (`{ data: { status, data } }`).
 *
 * Percorre até três níveis de `data`, valida `status` e rejeita respostas de
 * erro — a API devolve `status: false` com HTTP 200 (ex.: id inexistente),
 * e sem essa checagem o objeto de erro seria tratado como registro.
 * Aceita também o payload direto (mocks e respostas já desembrulhadas).
 */
function unwrapPayload<T>(response: unknown): T | null {
  let current: unknown = response;

  for (let depth = 0; depth < 3; depth += 1) {
    if (current === null || current === undefined) return null;
    if (typeof current !== "object" || Array.isArray(current)) {
      return current as T;
    }

    const record = current as {
      data?: unknown;
      status?: unknown;
      error?: unknown;
    };

    if (record.status === false) {
      throw new Error(
        typeof record.error === "string"
          ? record.error
          : "A API recusou a consulta",
      );
    }

    if (!("data" in record)) return current as T;
    current = record.data;
  }

  return (current as T | undefined) ?? null;
}

async function fetchStats<T>(endpoint: string): Promise<T | null> {
  const response = await client.get(`${STATS_URL}/${endpoint}`);
  return unwrapPayload<T>(response);
}

async function fetchStatsList<T>(endpoint: string): Promise<T[]> {
  const data = await fetchStats<T[]>(endpoint);
  return Array.isArray(data) ? data : [];
}

export async function listCommunities(
  options?: CommunitySearchParams,
): Promise<ReligiousCommunity[]> {
  const response = await client.get(`${URL}/public/list`, {
    params: { search: options, censusStep: "approved" },
  });
  const data = unwrapPayload<ReligiousCommunity[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function getCommunityById(id: string): Promise<ReligiousCommunity | null> {
  const response = await client.get(`${URL}/public/${id}`);
  const data = unwrapPayload<ReligiousCommunity | ReligiousCommunity[] | string>(
    response,
  );
  if (data === null || typeof data === "string") return null;
  // A API já devolve um único registro; listas são aceitas por tolerância.
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

export async function searchCommunities(
  options?: CommunitySearchParams,
): Promise<ReligiousCommunity[]> {
  const response = await client.get(`${URL}/public/list`, {
    params: { search: options, censusStep: "approved" },
  });
  const data = unwrapPayload<ReligiousCommunity[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function getOldestCommunities(): Promise<ReligiousCommunity[]> {
  const response = await client.get(`${URL}/public/oldest`);
  const data = unwrapPayload<ReligiousCommunity[]>(response);
  return Array.isArray(data) ? data : [];
}

/** Totais públicos do mapeamento (apenas censo aprovado). */
export async function getStatsSummary(): Promise<StatsSummary> {
  const data = await fetchStats<StatsSummary>("summary");
  return (
    data ?? {
      totalReligiousCommunities: 0,
      totalCities: 0,
      totalNeighborhoods: 0,
    }
  );
}

export async function getStatsByNation(): Promise<NationStats[]> {
  return fetchStatsList<NationStats>("by-nation");
}

export async function getStatsByCity(): Promise<CityStats[]> {
  return fetchStatsList<CityStats>("by-city");
}

export async function getStatsByDecade(): Promise<DecadeStats[]> {
  return fetchStatsList<DecadeStats>("by-decade");
}

export async function getStatsByTypeAndNation(): Promise<TypeByNationStats[]> {
  return fetchStatsList<TypeByNationStats>("by-type-and-nation");
}

export async function getStatsByType(): Promise<TypeStats[]> {
  return fetchStatsList<TypeStats>("by-type");
}

export async function getStatsByLeaderGender(): Promise<GenderStats[]> {
  return fetchStatsList<GenderStats>("by-leader-gender");
}

export async function getStatsByLeaderEthnicity(): Promise<EthnicityStats[]> {
  return fetchStatsList<EthnicityStats>("by-leader-ethnicity");
}

export async function getStatsByLanguage(): Promise<LanguageStats[]> {
  return fetchStatsList<LanguageStats>("by-language");
}

export async function getStatsByNeighborhood(): Promise<NeighborhoodStats[]> {
  return fetchStatsList<NeighborhoodStats>("by-neighborhood");
}

export async function getStatsByPhotoCoverage(): Promise<PhotoCoverageStats> {
  const data = await fetchStats<PhotoCoverageStats>("photo-coverage");
  return data ?? { withPhoto: 0, withoutPhoto: 0, total: 0 };
}

export const communitiesApi = {
  list: listCommunities,
  getById: getCommunityById,
  search: searchCommunities,
  oldest: getOldestCommunities,
  statsSummary: getStatsSummary,
  statsByNation: getStatsByNation,
  statsByCity: getStatsByCity,
  statsByDecade: getStatsByDecade,
  statsByTypeAndNation: getStatsByTypeAndNation,
  statsByType: getStatsByType,
  statsByLeaderGender: getStatsByLeaderGender,
  statsByLeaderEthnicity: getStatsByLeaderEthnicity,
  statsByLanguage: getStatsByLanguage,
  statsByNeighborhood: getStatsByNeighborhood,
  statsByPhotoCoverage: getStatsByPhotoCoverage,
};

export default communitiesApi;
