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
 * Extrai o payload do envelope da API (`{ data: { status, data } }`) e
 * valida o status. Aceita também o payload direto (mocks e respostas já
 * desembrulhadas) para manter o contrato tolerante.
 */
function unwrapPayload<T>(response: unknown): T | null {
  if (response === null || response === undefined) return null;

  if (typeof response !== "object" || Array.isArray(response)) {
    return response as T;
  }

  if (!("data" in response)) return response as T;

  const inner = (response as { data?: unknown }).data;
  if (
    inner !== null &&
    typeof inner === "object" &&
    !Array.isArray(inner) &&
    "data" in inner
  ) {
    const wrapped = inner as { status?: boolean; data?: T };
    if (wrapped.status === false) {
      throw new Error("A API recusou a consulta de estatísticas");
    }
    return wrapped.data ?? null;
  }

  return (inner as T | undefined) ?? null;
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
  const data = unwrapPayload<ReligiousCommunity | string>(response);
  if (data === null || typeof data === "string") return null;
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
