/* Eventos de produto do GA4 — cada um com o mínimo de parâmetros possível.
 *
 * Nada de PII: o sanitizador em `ga.ts` é a última barreira, mas aqui já
 * escolhemos o que enviar (slug, nação, cidade, contagens).
 */

import { trackEvent } from "./ga";

export type CommunityOrigin = "home" | "search" | "related";

export interface TrackableCommunity {
  id?: string;
  slugify?: string | null;
  religiousSpaceNation?: string | null;
}

function communitySlug(community: TrackableCommunity): string {
  return community.slugify ?? community.id ?? "desconhecido";
}

export function trackSearch(params: {
  term: string;
  results: number;
  nation?: string;
  city?: string;
  type?: string;
}): void {
  trackEvent("search", {
    search_term: params.term,
    results: params.results,
    nation: params.nation,
    city: params.city,
    type: params.type,
  });
}

export function trackCommunityView(community: TrackableCommunity): void {
  const slug = communitySlug(community);
  trackEvent("view_item", {
    item_id: slug,
    nation: community.religiousSpaceNation ?? "nao_informada",
    items: [{ item_id: slug, item_category: "terreiro" }],
  });
}

export function trackCommunitySelect(
  community: TrackableCommunity,
  origin: CommunityOrigin,
): void {
  trackEvent("select_content", {
    content_type: "terreiro",
    item_id: communitySlug(community),
    origin,
  });
}

/** Cadastro voluntário enviado — só a cidade, nunca nome/contato. */
export function trackRegistrationLead(city?: string): void {
  trackEvent("generate_lead", { city });
}

export function trackFilterApply(params: {
  nation?: string;
  city?: string;
  type?: string;
  hasQuery?: boolean;
  cleared?: boolean;
}): void {
  trackEvent("filter_apply", {
    nation: params.nation,
    city: params.city,
    type: params.type,
    has_query: params.hasQuery === true,
    cleared: params.cleared === true,
  });
}
