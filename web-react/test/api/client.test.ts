import { describe, it, expect, beforeEach, afterEach } from "vitest";
import client from "../../src/api/client";

describe("api client", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("is an axios instance", () => {
    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.put).toBe("function");
  });

  it("attaches auth token from localStorage as X-Access-Token", () => {
    localStorage.setItem("SESSION_TOKEN", "tok123");
    const handler = client.interceptors.request.handlers?.[0]?.fulfilled as unknown as (
      c: { headers: Record<string, unknown> },
    ) => { headers: Record<string, unknown> };
    const result = handler({ headers: {} });
    expect(result.headers["X-Access-Token"]).toBe("Bearer tok123");
  });

  it("does not attach header when no token", () => {
    const handler = client.interceptors.request.handlers?.[0]?.fulfilled as unknown as (
      c: { headers: Record<string, unknown> },
    ) => { headers: Record<string, unknown> };
    const result = handler({ headers: {} });
    expect(result.headers["X-Access-Token"]).toBeUndefined();
  });
});
