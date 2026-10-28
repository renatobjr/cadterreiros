import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EmptyState from "../../../src/components/composed/EmptyState";
import Button from "../../../src/components/ui/Button";

describe("EmptyState", () => {
  it("renders", () => {
    render(<EmptyState title="Nada aqui" description="Sem resultados" />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Sem resultados")).toBeInTheDocument();
  });

  it("renders action", () => {
    render(<EmptyState title="Vazio" action={<Button>Criar</Button>} />);
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });

  it("applies page class when page prop", () => {
    const { container } = render(<EmptyState page title="x" />);
    expect(container.firstChild).toHaveClass("empty--page");
  });
});