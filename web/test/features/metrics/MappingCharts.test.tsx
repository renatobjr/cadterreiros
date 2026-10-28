import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MappingCharts from "../../../src/features/metrics/components/MappingCharts";
import { sampleCommunities } from "../../fixtures/communities";

describe("MappingCharts", () => {
  it("deriva os dez gráficos da lista recebida", () => {
    render(<MappingCharts communities={sampleCommunities} />);

    expect(screen.getAllByTestId("chart-card")).toHaveLength(10);

    [
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
    ].forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });

    expect(screen.getAllByText("Ketu").length).toBeGreaterThan(0);
    expect(screen.getByText("João Pessoa")).toBeInTheDocument();
    expect(screen.getByText("Total de comunidades: 4")).toBeInTheDocument();
  });

  it("normaliza as barras pelo maior valor do gráfico", () => {
    render(<MappingCharts communities={sampleCommunities} />);

    const nationChart = screen
      .getByRole("heading", { name: "Por nação" })
      .closest("article") as HTMLElement;
    const bars = within(nationChart).getAllByTestId("chart-bar");

    expect(bars[0]?.style.width).toBe("100%");
    expect(parseFloat(bars[1]?.style.width ?? "0")).toBeCloseTo(50);
  });

  it("renderiza o histograma de décadas e a barra empilhada por nação", () => {
    render(<MappingCharts communities={sampleCommunities} />);

    const decadeChart = screen
      .getByRole("heading", { name: "Década de fundação" })
      .closest("article") as HTMLElement;
    expect(within(decadeChart).getAllByTestId("histo-bar")).toHaveLength(8);
    expect(within(decadeChart).getByText("1950")).toBeInTheDocument();
    expect(within(decadeChart).getByText("2020")).toBeInTheDocument();

    const typeChart = screen
      .getByRole("heading", { name: "Tipo por nação" })
      .closest("article") as HTMLElement;
    expect(within(typeChart).getByText("Ketu")).toBeInTheDocument();
    expect(within(typeChart).getByText("Matriz africana")).toBeInTheDocument();
  });

  it("mostra 'Sem dados' nos gráficos sem registros", () => {
    render(<MappingCharts communities={[]} />);

    expect(screen.getAllByTestId("chart-card")).toHaveLength(10);
    expect(screen.getAllByText("Sem dados")).toHaveLength(9);
    expect(screen.getByText("Total de comunidades: 0")).toBeInTheDocument();
  });
});
