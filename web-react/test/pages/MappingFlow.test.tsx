import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Mapping from "../../src/pages/Mapping";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      summary: { total: 214, cities: 5, neighborhoods: 90 },
      byNation: [
        { nation: "Umbanda", count: 56 },
        { nation: "Nagô", count: 47 },
      ],
    }),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("Fluxo de mapeamento", () => {
  it("renderiza o mapa e os dez gráficos agregados", () => {
    render(<Mapping />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Mapeamento" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mapa" })).toBeInTheDocument();

    const charts = screen.getAllByTestId("chart-card");
    expect(charts).toHaveLength(10);

    charts.forEach((chart, index) => {
      expect(
        within(chart).getByRole("heading", { name: `Gráfico ${index + 1}` }),
      ).toBeInTheDocument();
    });
  });

  it("desenha uma barra proporcional em cada gráfico", () => {
    const { container } = render(<Mapping />);

    const bars = container.querySelectorAll<HTMLElement>(".chart-bar");
    expect(bars).toHaveLength(10);
    expect(bars[0]?.style.width).toBe("10%");
    expect(bars[9]?.style.width).toBe("100%");
  });
});
