import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import client from "../../src/api/client";
import Mapping from "../../src/pages/Mapping";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const getMock = client.get as unknown as ReturnType<typeof vi.fn>;

const statsPayloads: Record<string, unknown> = {
  summary: {
    totalReligiousCommunities: 214,
    totalCities: 5,
    totalNeighborhoods: 90,
  },
  "by-nation": [
    { nation: "Umbanda", count: 56 },
    { nation: "Nagô", count: 47 },
  ],
  "by-city": [
    { city: "João Pessoa", count: 144 },
    { city: "Bayeux", count: 29 },
  ],
  "by-decade": [
    { decade: "1950s", count: 2 },
    { decade: "2020s", count: 5 },
  ],
  "by-type-and-nation": [
    { nation: "Umbanda", african: 20, traditional: 36 },
  ],
  "by-type": [{ type: "matriz africana", count: 77 }],
  "by-leader-gender": [{ gender: "feminino", count: 100 }],
  "by-leader-ethnicity": [{ ethnicity: "parda", count: 80 }],
  "by-language": [{ language: "yoruba", count: 60 }],
  "by-neighborhood": [{ neighborhood: "Centro", count: 30 }],
  "photo-coverage": { withPhoto: 199, withoutPhoto: 15, total: 214 },
};

const envelope = (payload: unknown) => ({
  data: { status: true, data: payload },
  url: "/api/v1/religious-communities/public/stats",
  date: new Date().toISOString(),
});

/** Responde cada endpoint como a API real: envelope `{ data: { status, data } }`. */
const mockStatsApi = () => {
  getMock.mockImplementation((url: string) => {
    const endpoint = url.split("/").pop() ?? "";
    return Promise.resolve(envelope(statsPayloads[endpoint]));
  });
};

const emptyPayloads: Record<string, unknown> = {
  summary: {
    totalReligiousCommunities: 0,
    totalCities: 0,
    totalNeighborhoods: 0,
  },
  "by-nation": [],
  "by-city": [],
  "by-decade": [],
  "by-type-and-nation": [],
  "by-type": [],
  "by-leader-gender": [],
  "by-leader-ethnicity": [],
  "by-language": [],
  "by-neighborhood": [],
  "photo-coverage": { withPhoto: 0, withoutPhoto: 0, total: 0 },
};

describe("Fluxo de mapeamento", () => {
  it("mostra o estado de carregamento enquanto a API responde", () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    render(<Mapping />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando dados do mapeamento…",
    );
  });

  it("renderiza o mapa, o resumo e os dez gráficos com dados da API", async () => {
    mockStatsApi();

    render(<Mapping />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Mapeamento" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mapa" })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getAllByTestId("chart-card")).toHaveLength(10),
    );

    expect(
      screen.getByText("214 terreiros · 5 cidades · 90 bairros"),
    ).toBeInTheDocument();

    [
      "Comunidades por nação",
      "Comunidades por cidade",
      "Comunidades por década de fundação",
      "Comunidades por tipo e nação",
      "Comunidades por tipo",
      "Lideranças por gênero",
      "Lideranças por etnia",
      "Comunidades por idioma ritual",
      "Comunidades por bairro (top 10)",
      "Cobertura fotográfica",
    ].forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });

    const nationChart = screen
      .getByRole("heading", { name: "Comunidades por nação" })
      .closest("article");
    expect(nationChart).not.toBeNull();
    expect(within(nationChart as HTMLElement).getByText("Umbanda")).toBeInTheDocument();
    expect(within(nationChart as HTMLElement).getByText("56")).toBeInTheDocument();
  });

  it("consome cada endpoint /public/stats/* exatamente uma vez", async () => {
    mockStatsApi();
    const firstCall = getMock.mock.calls.length;

    render(<Mapping />);

    await waitFor(() =>
      expect(screen.getAllByTestId("chart-card")).toHaveLength(10),
    );

    const requested = getMock.mock.calls
      .slice(firstCall)
      .map(([url]) =>
        String(url).replace("religious-communities/public/stats/", ""),
      );
    expect(requested.sort()).toEqual(
      [
        "summary",
        "by-nation",
        "by-city",
        "by-decade",
        "by-type-and-nation",
        "by-type",
        "by-leader-gender",
        "by-leader-ethnicity",
        "by-language",
        "by-neighborhood",
        "photo-coverage",
      ].sort(),
    );
  });

  it("desenha a maior barra de cada gráfico ocupando 100%", async () => {
    mockStatsApi();

    render(<Mapping />);

    const charts = await screen.findAllByTestId("chart-card");
    const nationChart = charts[0] as HTMLElement;
    const bars = within(nationChart).getAllByTestId("chart-bar");

    expect(bars[0]?.style.width).toBe("100%");
    expect(parseFloat(bars[1]?.style.width ?? "0")).toBeLessThan(100);
  });

  it("exibe erro visível e permite tentar novamente", async () => {
    getMock.mockImplementation(async () => {
      throw new Error("falha de rede");
    });

    render(<Mapping />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os dados do mapeamento.",
    );
    expect(screen.queryAllByTestId("chart-card")).toHaveLength(0);

    mockStatsApi();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() =>
      expect(screen.getAllByTestId("chart-card")).toHaveLength(10),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("exibe estado vazio quando não há comunidades aprovadas", async () => {
    getMock.mockImplementation((url: string) => {
      const endpoint = url.split("/").pop() ?? "";
      return Promise.resolve(envelope(emptyPayloads[endpoint]));
    });

    render(<Mapping />);

    expect(
      await screen.findByText("Nenhum terreiro aprovado"),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId("chart-card")).toHaveLength(0);
  });
});
