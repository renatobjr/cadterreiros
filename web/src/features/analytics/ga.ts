/* Ponte com o Google Analytics 4 (Consent Mode v2).
 *
 * Regras:
 *  · nada de terceiros antes do aceite — o `gtag.js` é injetado sob demanda;
 *  · `analytics_storage` nasce "denied" e só muda com consentimento;
 *  · `send_page_view: false` e page_view manual por rota (sem dupla contagem);
 *  · área privada (painel, auth, design system) nunca é medida;
 *  · parâmetros passam por um sanitizador que remove chaves e valores com
 *    cara de dado pessoal.
 */

import { isTrackablePath } from "./consent";

const DEFAULT_GA_ID = "G-CCSQS7ZTT2";

/** Eventos permitidos — nomes fora desta lista são descartados. */
export const ALLOWED_EVENTS = [
  "search",
  "view_item",
  "select_content",
  "generate_lead",
  "filter_apply",
] as const;

export type AnalyticsEvent = (typeof ALLOWED_EVENTS)[number];

export type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

let defaultsApplied = false;
let scriptRequested = false;
let configRequested = false;
let analyticsActive = false;
/* Último estado enviado — evita `consent update` repetido (StrictMode
   executa o inicializador do provider duas vezes em desenvolvimento). */
let lastConsent: boolean | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/** ID configurável por ambiente; o fallback preserva o GA do app antigo. */
export function getGaId(): string {
  const configured = import.meta.env.VITE_GA_ID as string | undefined;
  return configured?.trim() || DEFAULT_GA_ID;
}

function ensureGtag(): void {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag !== "function") {
    /* Igual ao snippet oficial: o gtag.js espera o objeto `arguments`,
       não um array. Com array, o script carrega mas ignora os comandos. */
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    } as (...args: unknown[]) => void;
  }
}

function loadGtagScript(): void {
  if (!isBrowser() || scriptRequested) return;
  scriptRequested = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(getGaId())}`;
  script.dataset.cadterreirosGa = "true";
  document.head.appendChild(script);
}

/**
 * Prepara o GA para o estado de consentimento informado.
 *
 * Pode ser chamada quantas vezes for preciso (é idempotente): configura o
 * consentimento padrão uma única vez, atualiza o estado atual e só carrega o
 * script quando há aceite.
 */
export function bootstrapAnalytics(granted: boolean): void {
  if (!isBrowser()) return;
  ensureGtag();

  if (!defaultsApplied) {
    window.gtag?.("consent", "default", CONSENT_DENIED);
    window.gtag?.("js", new Date());
    defaultsApplied = true;
  }

  if (lastConsent !== granted) {
    window.gtag?.("consent", "update", {
      ...CONSENT_DENIED,
      analytics_storage: granted ? "granted" : "denied",
    });
    lastConsent = granted;
  }

  analyticsActive = granted;
  if (!granted) return;

  /* Configura antes de injetar o script: as instruções já ficam na fila do
     dataLayer quando o gtag.js começar a processar. */
  if (!configRequested) {
    window.gtag?.("config", getGaId(), {
      send_page_view: false,
      // Sem sinais de publicidade: o site não faz remarketing.
      allow_google_signals: false,
    });
    configRequested = true;
  }

  loadGtagScript();
}

export function isAnalyticsActive(): boolean {
  return analyticsActive;
}

/* ---------- sanitização ----------
   O censo tem nome de liderança, endereço e contato: nada disso pode sair.
   Além de bloquear chaves sensíveis, descartamos valores que *parecem*
   e-mail ou telefone (alguém pode digitar um contato no campo de busca). */

const PII_KEY =
  /(e-?mail|phone|telefone|celular|whatsapp|address|endere[cç]o|full_?name|leader|lider|cpf|cnpj|password|senha|token|birth|nascimento)/i;
/* Sem âncoras: um e-mail no meio de um texto livre também é PII. */
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const MAX_TEXT = 120;
const MAX_DEPTH = 3;

function looksLikePhone(text: string): boolean {
  const digits = text.replace(/\D/g, "");
  return digits.length >= 8 && digits.length / text.length >= 0.3;
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text || text.length > MAX_TEXT) return undefined;
    if (EMAIL.test(text) || looksLikePhone(text)) return undefined;
    return text;
  }
  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) return undefined;
    return value
      .map((item) => sanitizeValue(item, depth + 1))
      .filter((item) => item !== undefined);
  }
  if (typeof value === "object" && value !== null) {
    if (depth >= MAX_DEPTH) return undefined;
    return sanitizeParams(value as AnalyticsParams, depth + 1);
  }
  return undefined;
}

/** Remove chaves/valores com dado pessoal e normaliza o restante. */
export function sanitizeParams(
  params: AnalyticsParams,
  depth = 0,
): AnalyticsParams {
  const clean: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEY.test(key)) continue;
    const sanitized = sanitizeValue(value, depth);
    if (sanitized !== undefined) clean[key] = sanitized;
  }
  return clean;
}

/* ---------- envio ---------- */

/**
 * page_view manual (o config usa `send_page_view: false`).
 * Rotas privadas e ausência de aceite são filtradas aqui também, para o
 * chamador não precisar repetir a regra.
 */
export function trackPageView(pathname: string): void {
  if (!isBrowser() || !analyticsActive || !isTrackablePath(pathname)) return;
  ensureGtag();
  window.gtag?.("event", "page_view", {
    send_to: getGaId(),
    page_path: pathname,
    page_location: `${window.location.origin}${pathname}`,
    page_title: document.title,
  });
}

export function trackEvent(
  name: AnalyticsEvent,
  params: AnalyticsParams = {},
): void {
  if (!isBrowser() || !analyticsActive) return;
  if (!ALLOWED_EVENTS.includes(name)) return;
  if (!isTrackablePath(window.location.pathname)) return;
  ensureGtag();
  window.gtag?.("event", name, sanitizeParams(params));
}
