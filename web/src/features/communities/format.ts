import type { ReligiousCommunity } from "../../domain/types";

/** URL base do CDN de fotografias das comunidades (VITE_IMG_RELIGIOUS_COMMUNITY_URL). */
const CDN_BASE = import.meta.env.VITE_IMG_RELIGIOUS_COMMUNITY_URL ?? "";

/**
 * Monta a URL absoluta da fotografia principal. O DTO público devolve um
 * caminho relativo (ex.: `/religiousCommunities/xxx.jpg`) ou uma URL completa.
 */
export function communityPhotoUrl(
  community: ReligiousCommunity,
): string | null {
  const picture = community.religiousSpaceMainPicture;
  if (!picture) return null;
  if (/^https?:\/\//i.test(picture) || !CDN_BASE) return picture;
  const base = CDN_BASE.replace(/\/+$/, "");
  // O caminho pode repetir o sufixo do CDN (`/religiousCommunities/x.jpg`) — evita duplicar.
  const suffix = base.replace(/^https?:\/\/[^/]+/i, "");
  const path =
    suffix && picture.startsWith(suffix) ? picture.slice(suffix.length) : picture;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** Converte a nação na chave do token de cor `--n-*` (sem acentos, kebab-case). */
export function nationKey(nation?: string | null): string {
  if (!nation) return "outros";
  return nation
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extrai bairro e cidade, tolerando o DTO achatado (apenas `fullAddress`). */
export function communityPlace(community: ReligiousCommunity): {
  neighborhood: string;
  city: string;
  label: string;
} {
  const address = community.communityAddress;
  const neighborhood = address?.neighborhood ?? community.neighborhood ?? "";
  const city = address?.city ?? community.city ?? "";
  if (!neighborhood && !city) {
    const parts = (community.fullAddress ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const n = parts.length >= 2 ? parts[0] : "";
    const c = parts.length >= 2 ? parts[1] : (parts[0] ?? "");
    return { neighborhood: n, city: c, label: [n, c].filter(Boolean).join(", ") };
  }
  return { neighborhood, city, label: [neighborhood, city].filter(Boolean).join(", ") };
}

/** "Bairro, Cidade" — ou "não informado" quando o endereço não foi recenseado. */
export function placeLabel(community: ReligiousCommunity): string {
  return communityPlace(community).label || "não informado";
}

export const capitalize = (value?: string | null): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

/** Rótulo humano do tipo de comunidade (o schema usa minúsculas). */
export function typeLabel(value?: string | null): string {
  return value ? capitalize(value) : "Comunidade de terreiro";
}

/** Ano de fundação válido (descarta 0/null herdados do censo). */
export function validYear(value?: number | string | null): boolean {
  const year = Number(value);
  return Number.isFinite(year) && year > 1000 && year <= 2100;
}

export function yearLabel(value?: number | string | null): string {
  return validYear(value) ? String(Number(value)) : "não informado";
}

/** Data em `dd/mm/aaaa` para timestamps ISO; "não informado" quando inválida. */
export function formatDate(value?: string | Date | null): string {
  if (!value) return "não informado";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Coordenadas no formato do mock: `-7,1202, -34,8845`. */
export function coordinatesLabel(
  lat?: number | null,
  long?: number | null,
): string {
  const format = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value)
      ? value.toFixed(4).replace(".", ",")
      : "não informado";
  return `${format(lat)}, ${format(long)}`;
}
