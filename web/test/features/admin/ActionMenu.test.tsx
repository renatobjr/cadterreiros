import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActionMenu from "../../../src/features/admin/components/ActionMenu";

function setup(onSelect = vi.fn()) {
  render(
    <ActionMenu
      label="Mais ações"
      items={[
        { id: "corrections", label: "Solicitar correções", icon: "corrections", onSelect },
        { id: "edit", label: "Editar cadastro", icon: "edit", onSelect: vi.fn() },
      ]}
    />,
  );

  return { onSelect, trigger: screen.getByRole("button", { name: "Mais ações" }) };
}

describe("ActionMenu", () => {
  it("começa fechado e anuncia o estado", () => {
    const { trigger } = setup();

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("abre no clique com os itens rotulados", () => {
    const { trigger } = setup();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Mais ações" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent?.trim()),
    ).toEqual(["Solicitar correções", "Editar cadastro"]);
  });

  it("aciona o item escolhido e fecha", () => {
    const { onSelect, trigger } = setup();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Solicitar correções" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("abre pelo teclado e fecha com Esc devolvendo o foco", () => {
    const { trigger } = setup();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Solicitar correções" }),
    );

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("navega entre os itens com as setas", () => {
    const { trigger } = setup();

    fireEvent.click(trigger);
    const menu = screen.getByRole("menu");

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Editar cadastro" }),
    );

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Solicitar correções" }),
    );
  });

  it("fecha ao clicar fora", () => {
    const { trigger } = setup();

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
