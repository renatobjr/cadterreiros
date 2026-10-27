/**
 * A API responde `{ data: { status, data, error }, url, date }` mesmo em
 * recusas (HTTP 200). Estes helpers leem esse envelope de forma tolerante —
 * também aceitam respostas já desembrulhadas (mocks e testes).
 */
export interface ApiEnvelope<T = unknown> {
  status?: boolean;
  data?: T;
  error?: unknown;
}

export function readEnvelope<T = unknown>(
  response: unknown,
): ApiEnvelope<T> | null {
  if (response === null || response === undefined) return null;

  const body = response as { data?: unknown } | null;
  const envelope = body?.data;

  if (envelope === null || envelope === undefined) return null;
  if (typeof envelope !== "object") return null;

  return envelope as ApiEnvelope<T>;
}

/** `true` quando o envelope marca a operação como recusada pelo servidor. */
export function isRefusal(envelope: ApiEnvelope | null): boolean {
  return envelope?.status === false;
}
