import type { ICommunityAddress } from "../schemas/ReligiousCommunity";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
/** Exigido pelos termos de uso do Nominatim (identificação da aplicação). */
const NOMINATIM_USER_AGENT = "Cadterreiros/1.0 (projeto cultural)";

export interface IGeocodedLocation {
  lat: number;
  long: number;
}

interface NominatimResult {
  lat?: string;
  lon?: string;
}

interface NominatimReverseAddress {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
}

interface NominatimReverseResult {
  display_name?: string;
  address?: NominatimReverseAddress;
}

/**
 * Geocodificação direta (endereço → coordenadas) pelo Nominatim (OSM).
 *
 * Gratuito e sem API key; devolve `null` quando o endereço não é encontrado
 * ou a consulta falha (o chamador decide o fallback).
 */
async function geocodeAddress(
  address: string
): Promise<IGeocodedLocation | null> {
  const query = address?.trim();
  if (!query) return null;

  try {
    const url = `${NOMINATIM_SEARCH_URL}?format=json&limit=1&q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const results = (await response.json()) as NominatimResult[];
    const first = Array.isArray(results) ? results[0] : undefined;

    const lat = Number(first?.lat);
    const long = Number(first?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(long)) return null;

    return { lat, long };
  } catch {
    return null;
  }
}

/**
 * Geocodificação reversa (coordenadas → endereço) pelo Nominatim (OSM).
 *
 * Substitui o cliente do Google Maps: sem API key, mesma fonte gratuita dos
 * demais pontos e sem custo por consulta. Devolve `null` quando não encontra
 * o endereço.
 */
async function getAddressFromLatLon(
  lat: number,
  long: number
): Promise<ICommunityAddress | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(long)) return null;

  try {
    const url = `${NOMINATIM_REVERSE_URL}?format=jsonv2&addressdetails=1&lat=${lat}&lon=${long}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
        "Accept-Language": "pt-BR",
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const result = (await response.json()) as NominatimReverseResult;
    const address = result?.address;
    if (!address) return null;

    const street = address.road ?? address.pedestrian ?? "";
    const number = address.house_number ?? "";
    const neighborhood =
      address.suburb ??
      address.neighbourhood ??
      address.city_district ??
      "";
    const city =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      "";
    const state = address.state ?? "";
    const zipcode = address.postcode ?? "";

    return {
      fullAddress: result.display_name ?? [street, neighborhood, city, state]
        .filter(Boolean)
        .join(", "),
      street,
      number,
      neighborhood,
      city,
      state,
      zipcode,
    };
  } catch {
    return null;
  }
}

export { getAddressFromLatLon, geocodeAddress };
