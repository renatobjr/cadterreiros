import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Login from "../../src/pages/Login";

describe("Login", () => {
  it("renderiza", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();
  });
});