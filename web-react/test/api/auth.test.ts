import { describe, it, expect, vi, beforeEach } from "vitest";
import client from "../../src/api/client";
import { authApi } from "../../src/api/auth";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("auth api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("login calls post and returns data", async () => {
    (client.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ token: "t" });
    const res = await authApi.login({ email: "a@b.com", password: "p" });
    expect(res).toEqual({ token: "t" });
    expect(client.post).toHaveBeenCalledWith("auth/login", { email: "a@b.com", password: "p" });
  });

  it("generateUserToken calls get", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const res = await authApi.generateUserToken("a@b.com", false);
    expect(res).toEqual({ ok: true });
    expect(client.get).toHaveBeenCalledWith("auth/generate-user-token/a@b.com/false");
  });

  it("verifyOtp calls post", async () => {
    (client.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const res = await authApi.verifyOtp("tok", "1234");
    expect(res).toEqual({ ok: true });
    expect(client.post).toHaveBeenCalledWith("auth/verify-otp", { token: "tok", otp: "1234" });
  });

  it("validateToken calls post with header", async () => {
    (client.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const res = await authApi.validateToken("tok");
    expect(res).toEqual({ ok: true });
    expect(client.post).toHaveBeenCalledWith("auth/validate-token", null, {
      headers: { "X-Access-Token": "Bearer tok" },
    });
  });

  it("setPassword calls post", async () => {
    (client.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const res = await authApi.setPassword("tok", "pass", "Full Name");
    expect(res).toEqual({ ok: true });
    expect(client.post).toHaveBeenCalledWith("auth/set-password", {
      token: "tok",
      password: "pass",
      fullname: "Full Name",
    });
  });
});