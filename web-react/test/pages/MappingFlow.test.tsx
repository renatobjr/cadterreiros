import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import client from "../../src/api/client";
import Mapping from "../../src/pages/Mapping";
import { sampleCommunities } from "../fixtures/communities";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const getMock = client.get as unknown as ReturnType<typeof vi.fn>;

/** Responde `/public/list` como a API real: envelope `{ data: { status, data } }`. */
const mockList = (payload: unknown = sampleCommunities) => {
  getMock.mockImplementation((url: string) =>
    url.includes("/public/list")
      ? Promise.resolve({ data: { status: true, data: payload } })
      : Promise.reject(new Error(`endpoint inesperado: ${url}`)),
  );
};

const CHART_TITLES = [
  "Por nação",
  "Por cidade",
  "Década de fundação",
  "Tipo por nação",
  "Comunidades por tipo",
  "Lideranças por gênero",
  "Lideranças por etnia",
  "Comunidades por idioma ritual",
  "Comunidades por bairro (top 10)",
  "Cobertura fotográfica",
];

describe("Fluxo de mapeamento", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("mostra o estado de carregamento enquanto a API responde", () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    render(<Mapping />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando dados do mapeamento…",
    );
  });

  it("renderiza page-head, filtros, resumo, mapa, legenda e gráficos", async () => {
    mockList();

    render(<Mapping />);

    expect(screen.getByText("Território e censo")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Mapeamento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Uma leitura do recenseamento por território/),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("4 terreiros")).toBeInTheDocument(),
    );

    expect(
      screen.getByText("2 cidades · 3 bairros · acervo completo"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Mapa dos terreiros" }),
    ).toBeInTheDocument();
    // A legenda de nações foi removida do mapeamento (decisão de produto).
    expect(screen.queryByLabelText("Legenda das nações")).not.toBeInTheDocument();

    expect(screen.getAllByTestId("chart-card")).toHaveLength(10);
    CHART_TITLES.forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });

    const nationChart = screen
      .getByRole("heading", { name: "Por nação" })
      .closest("article") as HTMLElement;
    expect(within(nationChart).getByText("Ketu")).toBeInTheDocument();
    expect(within(nationChart).getByText("2")).toBeInTheDocument();

    const cityChart = screen
      .getByRole("heading", { name: "Por cidade" })
      .closest("article") as HTMLElement;
    expect(within(cityChart).getByText("João Pessoa")).toBeInTheDocument();
    expect(within(cityChart).getByText("3")).toBeInTheDocument();
  });

  it("carrega a lista completa uma única vez, sem endpoints agregados", async () => {
    mockList();

    render(<Mapping />);

    await waitFor(() =>
      expect(screen.getAllByTestId("chart-card")).toHaveLength(10),
    );

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(String(getMock.mock.calls[0]?.[0])).toContain(
      "religious-communities/public/list",
    );
  });

  it("filtra localmente mapa, resumo e gráficos e limpa os filtros", async () => {
    mockList();

    render(<Mapping />);

    await waitFor(() =>
      expect(screen.getByText("4 terreiros")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "Bayeux" },
    });

    expect(screen.getByText("1 terreiro")).toBeInTheDocument();
    expect(
      screen.getByText("1 cidades · 1 bairros · filtros ativos"),
    ).toBeInTheDocument();

    const cityChart = screen
      .getByRole("heading", { name: "Por cidade" })
      .closest("article") as HTMLElement;
    expect(within(cityChart).getByText("Bayeux")).toBeInTheDocument();
    expect(within(cityChart).queryByText("João Pessoa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    expect(screen.getByText("4 terreiros")).toBeInTheDocument();
    expect(
      screen.getByText("2 cidades · 3 bairros · acervo completo"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Limpar" }),
    ).not.toBeInTheDocument();
  });

  it("mostra mapa vazio quando o filtro não encontra terreiros", async () => {
    mockList();

    render(<Mapping />);

    await waitFor(() =>
      expect(screen.getByText("4 terreiros")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "cidade inexistente" },
    });

    expect(screen.getByText("0 terreiros")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhum terreiro com os filtros atuais."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Mapa dos terreiros" }),
    ).not.toBeInTheDocument();
  });

  it("desenha a maior barra de cada gráfico ocupando 100%", async () => {
    mockList();

    render(<Mapping />);

    await screen.findByText("4 terreiros");
    const nationChart = screen
      .getByRole("heading", { name: "Por nação" })
      .closest("article") as HTMLElement;
    const bars = within(nationChart).getAllByTestId("chart-bar");

    expect(bars[0]?.style.width).toBe("100%");
    expect(parseFloat(bars[1]?.style.width ?? "0")).toBeCloseTo(50);
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

    mockList();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() =>
      expect(screen.getByText("4 terreiros")).toBeInTheDocument(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("exibe estado vazio quando não há comunidades aprovadas", async () => {
    mockList([]);

    render(<Mapping />);

    expect(
      await screen.findByText("Nenhum terreiro aprovado"),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId("chart-card")).toHaveLength(0);
  });
});
