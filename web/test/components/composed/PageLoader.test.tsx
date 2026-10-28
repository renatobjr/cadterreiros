import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageLoader from "../../../src/components/composed/PageLoader";

describe("PageLoader", () => {
  it("expõe um status acessível com o nome informado", () => {
    render(<PageLoader label="Carregando ficha" />);

    const status = screen.getByRole("status", { name: "Carregando ficha" });
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Carregando ficha");
  });

  it("mostra a marca e um spinner sem texto visível duplicado", () => {
    render(<PageLoader />);

    expect(document.querySelector(".page-loader__mark")).toBeInTheDocument();
    expect(document.querySelector(".page-loader__spinner")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    // O texto do rótulo fica apenas para leitores de tela (classe skip-vis).
    expect(screen.getByText("Carregando")).toHaveClass("skip-vis");
  });

  it("aceita a variante compacta para carregamentos dentro da página", () => {
    render(<PageLoader compact />);

    expect(document.querySelector(".page-loader")).toHaveClass(
      "page-loader--compact",
    );
  });
});
