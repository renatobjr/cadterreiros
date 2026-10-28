/* Consentimento de cookies e rastreamento — funções puras.
 *
 * O GA4 só entra na área pública e somente depois de um aceite explícito.
 * A escolha fica em `localStorage` (chave versionada) e pode ser revista
 * pelo link "Preferências de cookies" no rodapé.
 */

export const CONSENT_STORAGE_KEY = "cadterreiros.consent";

/** Sobe só se o formato guardado mudar (permite migrar escolhas antigas). */
export const CONSENT_VERSION = 1;

export interface ConsentState {
  version: number;
  analytics: boolean;
  updatedAt: string;
}

export type ConsentPreferences = Pick<ConsentState, "analytics">;

/** Recorte de `Storage` — permite testar sem o `localStorage` do navegador. */
export type ConsentStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/* Rotas que nunca são medidas: painel, autenticação e o showcase interno.
   O prefixo só casa em fronteira de segmento (`/admin` bloqueia `/admin/x`,
   mas não `/administracao`). */
const PRIVATE_PATHS = [
  "/admin",
  "/entrar",
  "/login",
  "/esqueci-minha-senha",
  "/primeiro-acesso",
  "/otp",
  "/set-password",
  "/design-system",
] as const;

function normalizePath(pathname: string): string {
  const withoutQuery = (pathname.split(/[?#]/)[0] ?? "").trim();
  const withSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  const withoutTrailing = withSlash.replace(/\/+$/, "");
  return (withoutTrailing || "/").toLowerCase();
}

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** `true` quando a rota pode gerar eventos de analytics. */
export function isTrackablePath(pathname: string): boolean {
  if (!pathname) return false;
  const path = normalizePath(pathname);
  return !PRIVATE_PATHS.some((prefix) => matchesPrefix(path, prefix));
}

/** Lê e valida o consentimento guardado; formato inválido é ignorado. */
export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<ConsentState>;
    if (typeof candidate.analytics !== "boolean") return null;
    return {
      version:
        typeof candidate.version === "number"
          ? candidate.version
          : CONSENT_VERSION,
      analytics: candidate.analytics,
      updatedAt:
        typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function readConsent(
  storage: ConsentStorage | null = defaultStorage(),
): ConsentState | null {
  if (!storage) return null;
  try {
    return parseConsent(storage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    // Modo privado ou storage bloqueado: trata como "sem escolha ainda".
    return null;
  }
}

export function writeConsent(
  preferences: ConsentPreferences,
  storage: ConsentStorage | null = defaultStorage(),
  now: Date = new Date(),
): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    analytics: preferences.analytics === true,
    updatedAt: now.toISOString(),
  };
  try {
    storage?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sem persistência o banner volta na próxima visita — degradação aceitável.
  }
  return state;
}

export function clearConsent(
  storage: ConsentStorage | null = defaultStorage(),
): void {
  try {
    storage?.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // nada a fazer
  }
}

function defaultStorage(): ConsentStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
