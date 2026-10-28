import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchFilters from "../../../src/features/communities/components/SearchFilters";

describe("SearchFilters", () => {
  it("renderiza filtros", () => {
    render(<SearchFilters />);
    expect(screen.getByLabelText(/busca/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nação/i)).toBeInTheDocument();
  });

  it("filtra sem reload (emite onChange)", () => {
    const onChange = vi.fn();
    render(<SearchFilters onChange={onChange} />);
    const input = screen.getByLabelText(/busca/i);
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalled();
  });
});
