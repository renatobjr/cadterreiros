import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MappingCharts from "../../../src/features/metrics/components/MappingCharts";

describe("MappingCharts", () => {
  it("renderiza", () => {
    render(<MappingCharts />);
    expect(screen.getAllByTestId("chart-card")).toHaveLength(10);
  });
});
