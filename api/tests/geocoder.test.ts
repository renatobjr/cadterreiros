import assert from "node:assert/strict";
import test from "node:test";
import { geocodeAddress } from "../src/configs/geocoder";

const realFetch = globalThis.fetch;

type FetchCall = { url: string; init?: RequestInit };

const stubFetch = (
  handler: (url: string, init?: RequestInit) => Promise<Response>
): FetchCall[] => {
  const calls: FetchCall[] = [];

  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => {
    const url = String(input);
    calls.push({ url, init });
    return handler(url, init);
  }) as typeof fetch;

  return calls;
};

test.afterEach(() => {
  globalThis.fetch = realFetch;
});

test("geocodeAddress consulta o Nominatim com o endereço codificado", async () => {
  const calls = stubFetch(async () =>
    new Response(JSON.stringify([{ lat: "-7.11532", lon: "-34.861" }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  );

  const result = await geocodeAddress("Rua das Flores, 123 - Centro, João Pessoa");

  assert.deepEqual(result, { lat: -7.11532, long: -34.861 });
  assert.equal(calls.length, 1);

  const url = new URL(calls[0].url);
  assert.equal(url.origin + url.pathname, "https://nominatim.openstreetmap.org/search");
  assert.equal(url.searchParams.get("format"), "json");
  assert.equal(url.searchParams.get("limit"), "1");
  assert.equal(
    url.searchParams.get("q"),
    "Rua das Flores, 123 - Centro, João Pessoa"
  );

  const headers = new Headers(calls[0].init?.headers);
  assert.match(headers.get("user-agent") ?? "", /^Cadterreiros\//);
});

test("geocodeAddress devolve null quando o endereço não é encontrado", async () => {
  stubFetch(async () => new Response("[]", { status: 200 }));

  assert.equal(await geocodeAddress("Endereço inexistente"), null);
});

test("geocodeAddress devolve null em resposta com erro HTTP", async () => {
  stubFetch(async () => new Response("indisponível", { status: 503 }));

  assert.equal(await geocodeAddress("Rua das Flores, 123"), null);
});

test("geocodeAddress devolve null quando a consulta falha", async () => {
  stubFetch(async () => {
    throw new Error("rede indisponível");
  });

  assert.equal(await geocodeAddress("Rua das Flores, 123"), null);
});

test("geocodeAddress não consulta a rede com endereço vazio", async () => {
  const calls = stubFetch(async () => new Response("[]", { status: 200 }));

  assert.equal(await geocodeAddress("   "), null);
  assert.equal(calls.length, 0);
});
