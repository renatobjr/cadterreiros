import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SetPassword from "../../src/pages/SetPassword";

describe("SetPassword", () => {
  it("renderiza", () => {
    render(<SetPassword />);
    expect(screen.getByRole("heading", { name: /Definir senha/i })).toBeInTheDocument();
  });
});