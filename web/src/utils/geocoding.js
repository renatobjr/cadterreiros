const PHOTON_API_URL = "https://photon.komoot.io";
const CACHE_PREFIX = "cadterreiros:photon:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_QUERY_LENGTH = 3;

const STATE_ABBREVIATIONS = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO",
};

const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const { timestamp, value } = JSON.parse(raw);

    if (Date.now() - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return value;
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ timestamp: Date.now(), value })
    );
  } catch {
    // sessionStorage indisponível (modo privado/cheio) — segue sem cache
  }
};

const featureToAddress = (feature) => {
  const properties = feature.properties || {};
  const [lng, lat] = feature.geometry?.coordinates || [];

  const street = properties.street || properties.name || "";
  const number = properties.housenumber || "";
  const neighborhood = properties.district || properties.locality || "";
  const city = properties.city || properties.county || "";
  const stateName = properties.state || "";
  const state = STATE_ABBREVIATIONS[stateName] || stateName;
  const zipcode = properties.postcode || "";

  const fullAddress = [
    [street, number].filter(Boolean).join(", "),
    neighborhood,
    [city, state].filter(Boolean).join(" - "),
    zipcode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    fullAddress,
    street,
    number,
    neighborhood,
    city,
    state,
    zipcode,
    lat,
    lng,
  };
};

const searchAddresses = async (query, { lat, lng } = {}) => {
  const params = new URLSearchParams({ q: query, lang: "pt", limit: "6" });

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    params.set("lat", String(lat));
    params.set("lon", String(lng));
  }

  const cacheKey = `search:${params.toString()}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${PHOTON_API_URL}/api/?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Falha na busca de endereço (${response.status})`);
  }

  const data = await response.json();

  const addresses = (data.features || [])
    .filter((feature) => feature.properties?.countrycode === "BR")
    .map(featureToAddress)
    .filter((address) => address.lat != null && address.lng != null);

  writeCache(cacheKey, addresses);

  return addresses;
};

const searchAddress = async (query, options = {}) => {
  const normalized = (query || "").trim();

  if (normalized.length < MIN_QUERY_LENGTH) return [];

  return searchAddresses(normalized, options);
};

const reverseGeocode = async (lat, lng) => {
  const cacheKey = `reverse:${lat}:${lng}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    lang: "pt",
  });

  const response = await fetch(`${PHOTON_API_URL}/reverse?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Falha na reverse geocode (${response.status})`);
  }

  const data = await response.json();

  const feature =
    data?.type === "Feature" ? data : data?.features?.[0] || null;

  if (!feature?.geometry?.coordinates?.length) return null;

  const address = featureToAddress(feature);

  writeCache(cacheKey, address);

  return address;
};

export { searchAddress, reverseGeocode };
