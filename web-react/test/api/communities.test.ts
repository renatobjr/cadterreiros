import { describe, it, expect, vi, beforeEach } from "vitest";
import client from "../../src/api/client";
import { communitiesApi } from "../../src/api/communities";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("communities api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("list returns array", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "1" }]);
    const res = await communitiesApi.list();
    expect(res).toHaveLength(1);
    expect(client.get).toHaveBeenCalled();
  });

  it("getById returns community", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "2" });
    const res = await communitiesApi.getById("2");
    expect(res?.id).toBe("2");
  });

  it("search returns array", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const res = await communitiesApi.search({ search: "x" });
    expect(res).toEqual([]);
  });

  it("oldest returns array", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "3" }, { id: "4" }]);
    const res = await communitiesApi.oldest();
    expect(res).toHaveLength(2);
  });
});