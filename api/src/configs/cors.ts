/**
 * Origens autorizadas a chamar a API com credenciais (cookie de sessão).
 *
 * - Produção: apenas o que estiver em `WEB_ORIGIN` (lista separada por vírgula).
 * - Desenvolvimento: além da lista, qualquer `localhost`/`127.0.0.1` — o Vite
 *   troca de porta (5173, 5174…) e bloquear o dev por causa disso não ajuda.
 */
const isProduction = process.env.NODE_ENV === "production";

const configuredOrigins = (process.env.WEB_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true; // curl/serviços não enviam Origin
  if (configuredOrigins.includes(origin)) return true;
  if (!isProduction && LOCAL_ORIGIN.test(origin)) return true;
  return false;
}

/** Lista usada pelo `cors` (inclui as locais em desenvolvimento). */
export function corsOrigins(): string[] {
  return configuredOrigins;
}

export default isAllowedOrigin;
