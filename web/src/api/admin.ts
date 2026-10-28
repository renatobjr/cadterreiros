import { communitiesApi } from "./communities";
import client from "./client";
import type {
  AdminUser,
  BioCoverageStats,
  CensusStepStats,
  ReligiousCommunity,
  StatusStats,
  VoluntaryRegistrationStats,
} from "../domain/types";

const URL = "religious-communities";
const USERS_URL = "users";

/**
 * Envelope da API para rotas administrativas (`{ data: { status, data } }`).
 * Aceita também respostas já desembrulhadas.
 */
function unwrap<T>(response: unknown): T | null {
  const body = response as { data?: unknown } | null;
  const envelope = body?.data as
    | { status?: boolean; data?: T }
    | undefined;
  if (!envelope) return null;
  if (envelope.status === false) return null;
  return envelope.data ?? null;
}

/** Lista administrativa: todos os estágios do censo, sem filtro. */
export async function listAllCommunities(): Promise<ReligiousCommunity[]> {
  const response = await client.get(`${URL}/list`);
  const data = unwrap<ReligiousCommunity[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function getCommunity(id: string): Promise<ReligiousCommunity | null> {
  const response = await client.get(`${URL}/${id}`);
  const data = unwrap<ReligiousCommunity>(response);
  return data ?? null;
}

export async function updateCommunity(
  id: string,
  payload: Partial<ReligiousCommunity>,
): Promise<boolean> {
  const response = await client.put(`${URL}/update-religious-community/${id}`, payload);
  return unwrap<unknown>(response) !== null;
}

/** Atribui (ou troca) o recenseador responsável pelo cadastro. */
export async function assignOwner(
  communityId: string,
  userId: string,
  keepStatus: boolean,
): Promise<boolean> {
  const response = await client.put(`${URL}/assign-owner`, {
    communityId,
    userId,
    keepStatus,
  });
  return unwrap<unknown>(response) !== null;
}

/** Envia a foto principal do cadastro (multipart, campo `file`). */
export async function uploadMainPicture(id: string, file: File): Promise<boolean> {
  const body = new FormData();
  body.append("file", file);
  const response = await client.post(`${URL}/upload-main-picture/${id}`, body);
  return unwrap<unknown>(response) !== null;
}

type Decision = "approve" | "reject" | "corrections" | "censusStep";

export async function decide(
  action: Decision,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const endpoint =
    action === "approve"
      ? "approve-census"
      : action === "reject"
        ? "reject-census"
        : action === "corrections"
          ? "request-corrections"
          : "set-census-step";

  const response = await client.put(`${URL}/${endpoint}`, payload);
  return unwrap<unknown>(response) !== null;
}

/* ---------- estatísticas administrativas ---------- */

export async function statsByCensusStep(): Promise<CensusStepStats | null> {
  return unwrap<CensusStepStats>(await client.get(`${URL}/stats/by-census-step`));
}

export async function statsByStatus(): Promise<StatusStats | null> {
  return unwrap<StatusStats>(await client.get(`${URL}/stats/by-status`));
}

export async function statsVoluntaryRegistrations(): Promise<VoluntaryRegistrationStats | null> {
  return unwrap<VoluntaryRegistrationStats>(
    await client.get(`${URL}/stats/voluntary-registrations`),
  );
}

export async function statsBioCoverage(): Promise<BioCoverageStats | null> {
  return unwrap<BioCoverageStats>(await client.get(`${URL}/stats/bio-coverage`));
}

export async function statsPhotoCoverage() {
  return communitiesApi.statsByPhotoCoverage();
}

/* ---------- usuários ---------- */

export async function listUsers(): Promise<AdminUser[]> {
  const data = unwrap<AdminUser[]>(await client.get(`${USERS_URL}/list-all`));
  return Array.isArray(data) ? data : [];
}

export async function setUserStatus(id: string, isEnabled: boolean) {
  // A API espera `{ id, status }` (contrato herdado do app Vue).
  return unwrap<unknown>(
    await client.put(`${USERS_URL}/set-user-status`, { id, status: isEnabled }),
  );
}

export async function changeUserRole(id: string, role: string) {
  return unwrap<unknown>(
    await client.put(`${USERS_URL}/change-user-role`, { id, role }),
  );
}

export async function addUser(payload: {
  fullname: string;
  email: string;
  role: string;
}) {
  return unwrap<unknown>(await client.post(`${USERS_URL}/add-user`, payload));
}
