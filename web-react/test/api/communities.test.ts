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

const getMock = client.get as unknown as ReturnType<typeof vi.fn>;

const envelope = (payload: unknown, status = true) => ({
  data: { status, data: payload },
  url: "/api/v1/religious-communities/public/stats",
  date: new Date().toISOString(),
});

describe("communities api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("list returns array", async () => {
    getMock.mockResolvedValue([{ id: "1" }]);
    const res = await communitiesApi.list();
    expect(res).toHaveLength(1);
    expect(client.get).toHaveBeenCalled();
  });

  it("getById returns community", async () => {
    getMock.mockResolvedValue({ id: "2" });
    const res = await communitiesApi.getById("2");
    expect(res?.id).toBe("2");
  });

  it("search returns array", async () => {
    getMock.mockResolvedValue([]);
    const res = await communitiesApi.search({ search: "x" });
    expect(res).toEqual([]);
  });

  it("oldest returns array", async () => {
    getMock.mockResolvedValue([{ id: "3" }, { id: "4" }]);
    const res = await communitiesApi.oldest();
    expect(res).toHaveLength(2);
  });
});

describe("communities api · public stats", () => {
  it("getStatsSummary desembrulha o envelope da API", async () => {
    getMock.mockResolvedValue(
      envelope({
        totalReligiousCommunities: 214,
        totalCities: 5,
        totalNeighborhoods: 90,
      }),
    );

    const res = await communitiesApi.statsSummary();

    expect(res).toEqual({
      totalReligiousCommunities: 214,
      totalCities: 5,
      totalNeighborhoods: 90,
    });
    expect(getMock).toHaveBeenCalledWith(
      "religious-communities/public/stats/summary",
    );
  });

  it("getStatsSummary devolve zeros quando a API não retorna payload", async () => {
    getMock.mockResolvedValue(envelope(null));

    await expect(communitiesApi.statsSummary()).resolves.toEqual({
      totalReligiousCommunities: 0,
      totalCities: 0,
      totalNeighborhoods: 0,
    });
  });

  it("chama cada endpoint by-* e devolve as listas tipadas", async () => {
    const payloads: Record<string, unknown> = {
      "religious-communities/public/stats/by-nation": [
        { nation: "ketu", count: 3 },
      ],
      "religious-communities/public/stats/by-city": [
        { city: "João Pessoa", count: 4 },
      ],
      "religious-communities/public/stats/by-decade": [
        { decade: "1950s", count: 2 },
      ],
      "religious-communities/public/stats/by-type-and-nation": [
        { nation: "ketu", african: 2, traditional: 1 },
      ],
      "religious-communities/public/stats/by-type": [
        { type: "matriz africana", count: 2 },
      ],
      "religious-communities/public/stats/by-leader-gender": [
        { gender: "feminino", count: 2 },
      ],
      "religious-communities/public/stats/by-leader-ethnicity": [
        { ethnicity: "parda", count: 2 },
      ],
      "religious-communities/public/stats/by-language": [
        { language: "yoruba", count: 2 },
      ],
      "religious-communities/public/stats/by-neighborhood": [
        { neighborhood: "Centro", count: 2 },
      ],
      "religious-communities/public/stats/photo-coverage": {
        withPhoto: 3,
        withoutPhoto: 1,
        total: 4,
      },
    };

    getMock.mockImplementation((url: string) =>
      Promise.resolve(envelope(payloads[url])),
    );

    await expect(communitiesApi.statsByNation()).resolves.toEqual([
      { nation: "ketu", count: 3 },
    ]);
    await expect(communitiesApi.statsByCity()).resolves.toEqual([
      { city: "João Pessoa", count: 4 },
    ]);
    await expect(communitiesApi.statsByDecade()).resolves.toEqual([
      { decade: "1950s", count: 2 },
    ]);
    await expect(communitiesApi.statsByTypeAndNation()).resolves.toEqual([
      { nation: "ketu", african: 2, traditional: 1 },
    ]);
    await expect(communitiesApi.statsByType()).resolves.toEqual([
      { type: "matriz africana", count: 2 },
    ]);
    await expect(communitiesApi.statsByLeaderGender()).resolves.toEqual([
      { gender: "feminino", count: 2 },
    ]);
    await expect(communitiesApi.statsByLeaderEthnicity()).resolves.toEqual([
      { ethnicity: "parda", count: 2 },
    ]);
    await expect(communitiesApi.statsByLanguage()).resolves.toEqual([
      { language: "yoruba", count: 2 },
    ]);
    await expect(communitiesApi.statsByNeighborhood()).resolves.toEqual([
      { neighborhood: "Centro", count: 2 },
    ]);
    await expect(communitiesApi.statsByPhotoCoverage()).resolves.toEqual({
      withPhoto: 3,
      withoutPhoto: 1,
      total: 4,
    });
  });

  it("devolve lista vazia quando o endpoint by-* falha em formato", async () => {
    getMock.mockResolvedValue(envelope(undefined));

    await expect(communitiesApi.statsByNation()).resolves.toEqual([]);
    await expect(communitiesApi.statsByNeighborhood()).resolves.toEqual([]);
  });

  it("rejeita quando a API responde status false", async () => {
    getMock.mockResolvedValue(envelope([], false));

    await expect(communitiesApi.statsByNation()).rejects.toThrow(
      "A API recusou a consulta de estatísticas",
    );
  });

  it("propaga erro de rede", async () => {
    getMock.mockImplementation(async () => {
      throw new Error("network down");
    });

    await expect(communitiesApi.statsByCity()).rejects.toThrow("network down");
  });
});
