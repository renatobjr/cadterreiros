import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutProject from "../../src/pages/AboutProject";

describe("AboutProject", () => {
  it("renderiza", () => {
    render(<AboutProject />);
    expect(
      screen.getByRole("heading", { name: /Uma Visão Sobre a Cultura Afro Brasileira/i })
    ).toBeInTheDocument();
  });
});
