import { Client } from "@googlemaps/google-maps-services-js";
import type { ICommunityAddress } from "../schemas/ReligiousCommunity";

const client = new Client({});

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
/** Exigido pelos termos de uso do Nominatim (identificação da aplicação). */
const NOMINATIM_USER_AGENT = "Cadterreiros/1.0 (projeto cultural)";

async function getAddressFromLatLon(lat: number, long: number) {
  try {
    const response = await client.reverseGeocode({
      params: {
        key: process.env.GOOGLE_MAPS_API as string,
        latlng: [lat, long],
      },
    });

    return {
      fullAddress: response.data.results[0]?.formatted_address,
      number: response.data.results[0].address_components[0]?.long_name,
      street: response.data.results[0].address_components[1]?.long_name,
      neighborhood: response.data.results[0].address_components[2]?.long_name,
      city: response.data.results[0].address_components[3]?.long_name,
      state: response.data.results[0].address_components[4]?.long_name,
      zipcode:
        response.data.results[0].address_components[6]?.long_name ??
        "58000-000",
    } as ICommunityAddress;
  } catch (error) {
    throw new Error(error as string);
  }
}

export interface IGeocodedLocation {
  lat: number;
  long: number;
}

interface NominatimResult {
  lat?: string;
  lon?: string;
}

/**
 * Geocodifica um endereço livre pelo Nominatim (OpenStreetMap).
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

export { getAddressFromLatLon, geocodeAddress };
