import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import Select from "../../../src/components/ui/Select";
import type { SelectOption } from "../../../src/components/ui/Select";

const OPTIONS: SelectOption[] = [
  { value: "ketu", label: "Ketu" },
  { value: "angola", label: "Angola" },
  { value: "nago", label: "Nagô" },
];

function Harness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <Select
      id="campo"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      options={OPTIONS}
      placeholder="Selecione a nação"
    />
  );
}

describe("Select", () => {
  it("renderiza o placeholder como combobox fechado", () => {
    render(<Harness />);
    const button = screen.getByRole("combobox", {
      name: "",
    });

    expect(button).toHaveTextContent("Selecione a nação");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("abre a lista e escolhe uma opção", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);

    fireEvent.mouseDown(screen.getByText("Angola"));

    expect(onChange).toHaveBeenCalledWith("angola");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Angola");
  });

  it("marca a opção escolhida com aria-selected", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.mouseDown(screen.getByText("Ketu"));
    fireEvent.click(screen.getByRole("combobox"));

    const selected = screen
      .getAllByRole("option")
      .filter((option) => option.getAttribute("aria-selected") === "true");

    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent("Ketu");
  });

  it("navega pelo teclado e confirma com Enter", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const button = screen.getByRole("combobox");

    button.focus();
    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(button, { key: "ArrowDown" });
    fireEvent.keyDown(button, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("angola");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("fecha com Escape sem alterar o valor", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const button = screen.getByRole("combobox");

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Escape" });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("fecha ao clicar fora", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
