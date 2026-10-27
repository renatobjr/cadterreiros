import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MappingCharts from "../../../src/features/metrics/components/MappingCharts";
import type { MappingStats } from "../../../src/domain/types";

const stats: MappingStats = {
  summary: {
    totalReligiousCommunities: 214,
    totalCities: 5,
    totalNeighborhoods: 90,
  },
  byNation: [
    { nation: "Umbanda", count: 56 },
    { nation: "Nagô", count: 47 },
  ],
  byCity: [{ city: "João Pessoa", count: 144 }],
  byDecade: [{ decade: "1950s", count: 2 }],
  byTypeAndNation: [{ nation: "Umbanda", african: 20, traditional: 36 }],
  byType: [{ type: "matriz africana", count: 77 }],
  byLeaderGender: [{ gender: "feminino", count: 100 }],
  byLeaderEthnicity: [{ ethnicity: "parda", count: 80 }],
  byLanguage: [{ language: "yoruba", count: 60 }],
  byNeighborhood: [{ neighborhood: "Centro", count: 30 }],
  byPhotoCoverage: { withPhoto: 199, withoutPhoto: 15, total: 214 },
};

describe("MappingCharts", () => {
  it("renderiza os dez gráficos com os dados recebidos por props", () => {
    render(<MappingCharts stats={stats} />);

    const charts = screen.getAllByTestId("chart-card");
    expect(charts).toHaveLength(10);

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

    expect(screen.getByText("Umbanda")).toBeInTheDocument();
    expect(screen.getByText("144")).toBeInTheDocument();
    expect(screen.getByText("parda")).toBeInTheDocument();
    expect(screen.getByText("Total de comunidades: 214")).toBeInTheDocument();
  });

  it("normaliza as barras pelo maior valor do gráfico", () => {
    render(<MappingCharts stats={stats} />);

    const nationChart = screen
      .getByRole("heading", { name: "Comunidades por nação" })
      .closest("article") as HTMLElement;
    const bars = within(nationChart).getAllByTestId("chart-bar");

    expect(bars[0]?.style.width).toBe("100%");
    expect(parseFloat(bars[1]?.style.width ?? "0")).toBeCloseTo((47 / 56) * 100);
  });

  it("mostra 'Sem dados' nos gráficos sem registros", () => {
    render(
      <MappingCharts
        stats={{ ...stats, byLeaderGender: [], byLeaderEthnicity: [] }}
      />,
    );

    expect(screen.getAllByText("Sem dados")).toHaveLength(2);
  });
});
