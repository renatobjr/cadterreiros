import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TextInput from "./TextInput";

describe("TextInput", () => {
  it("renders label and input", () => {
    render(<TextInput label="Nome" />);
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders value", () => {
    render(<TextInput label="Nome" value="abc" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("abc");
  });

  it("links error via aria-describedby", () => {
    render(<TextInput label="Nome" error="Campo obrigatório" />);
    const input = screen.getByRole("textbox");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    const errorEl = document.getElementById(errorId!);
    expect(errorEl).toHaveTextContent("Campo obrigatório");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-describedby when no error", () => {
    render(<TextInput label="Nome" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });
});
