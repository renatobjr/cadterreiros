import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import client from "../../src/api/client";

type RequestConfig = { headers: Record<string, unknown> };

function requestHandler() {
  return client.interceptors.request.handlers?.[0]?.fulfilled as unknown as (
    c: RequestConfig,
  ) => RequestConfig;
}

describe("api client", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("is an axios instance", () => {
    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.put).toBe("function");
  });

  it("envia cookies de sessão e não lê token do localStorage", () => {
    localStorage.setItem("SESSION_TOKEN", "tok123");
    const result = requestHandler()({ headers: {} });
    expect(result.headers["X-Access-Token"]).toBeUndefined();
    expect(client.defaults.withCredentials).toBe(true);
  });

  it("attaches the public API key as x-cadterreiros-api", () => {
    vi.stubEnv("VITE_CADTERREIROS_API_KEY", "test-api-key");
    const result = requestHandler()({ headers: {} });
    expect(result.headers["x-cadterreiros-api"]).toBe("test-api-key");
  });

  it("does not attach header when no token", () => {
    const result = requestHandler()({ headers: {} });
    expect(result.headers["X-Access-Token"]).toBeUndefined();
  });
});
