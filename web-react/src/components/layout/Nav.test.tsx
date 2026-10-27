import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Nav from "./Nav";

describe("Nav", () => {
  it("renders brand and links", () => {
    render(<Nav />);
    expect(screen.getByText("Cadterreiros")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /início/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /buscar um terreiro/i })).toBeInTheDocument();
  });

  it("toggles drawer on burger click", () => {
    render(<Nav />);
    const burger = screen.getByRole("button", { name: /abrir menu/i });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: /início/i }).length).toBeGreaterThan(1);
  });
});