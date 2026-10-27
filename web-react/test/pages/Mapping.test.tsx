import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Mapping from "../../src/pages/Mapping";

describe("Mapping", () => {
  it("renderiza 10 gráficos", () => {
    render(<Mapping />);
    expect(screen.getAllByTestId("chart-card")).toHaveLength(10);
  });
});
