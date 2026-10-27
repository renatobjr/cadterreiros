import client from "./client";
import type { ReligiousCommunity } from "../domain/types";

const URL = "religious-communities";

export interface CommunitySearchParams {
  search?: string;
  [key: string]: unknown;
}

export async function listCommunities(
  options?: CommunitySearchParams,
): Promise<ReligiousCommunity[]> {
  const response = (await client.get(`${URL}/public/list`, {
    params: { search: options, censusStep: "approved" },
  })) as ReligiousCommunity[];
  return Array.isArray(response) ? response : [];
}

export async function getCommunityById(id: string): Promise<ReligiousCommunity | null> {
  const response = (await client.get(`${URL}/public/${id}`)) as ReligiousCommunity | string;
  if (typeof response === "string") return null;
  return (response as ReligiousCommunity) ?? null;
}

export async function searchCommunities(
  options?: CommunitySearchParams,
): Promise<ReligiousCommunity[]> {
  const response = (await client.get(`${URL}/public/list`, {
    params: { search: options, censusStep: "approved" },
  })) as ReligiousCommunity[];
  return Array.isArray(response) ? response : [];
}

export async function getOldestCommunities(): Promise<ReligiousCommunity[]> {
  const response = (await client.get(`${URL}/public/oldest`)) as ReligiousCommunity[];
  return Array.isArray(response) ? response : [];
}

export const communitiesApi = {
  list: listCommunities,
  getById: getCommunityById,
  search: searchCommunities,
  oldest: getOldestCommunities,
};

export default communitiesApi;