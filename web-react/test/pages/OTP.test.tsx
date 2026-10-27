import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import OTP from "../../src/pages/OTP";

describe("OTP", () => {
  it("renderiza", () => {
    render(<OTP />);
    expect(screen.getByRole("heading", { name: /Verifique seu email/i })).toBeInTheDocument();
  });
});