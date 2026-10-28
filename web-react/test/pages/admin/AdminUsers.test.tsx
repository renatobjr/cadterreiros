import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsers from "../../../src/pages/admin/AdminUsers";
import type { AdminUser } from "../../../src/domain/types";

const listUsers = vi.fn();
const setUserStatus = vi.fn();
const changeUserRole = vi.fn();
const addUser = vi.fn();

vi.mock("../../../src/api/admin", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
  setUserStatus: (...args: unknown[]) => setUserStatus(...args),
  changeUserRole: (...args: unknown[]) => changeUserRole(...args),
  addUser: (...args: unknown[]) => addUser(...args),
}));

const auth = { role: "admin" };

vi.mock("../../../src/features/auth/context", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      email: "curadoria@cciao.org",
      fullname: "Renato Jr.",
      role: auth.role,
    },
    isAuth: true,
    restoring: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const USERS: AdminUser[] = [
  {
    id: "u1",
    fullname: "Renato Jr.",
    email: "curadoria@cciao.org",
    role: "admin",
    isEnabled: true,
    isFirstLogin: false,
    lastLogin: "2026-10-20T10:00:00.000Z",
  },
  {
    id: "u2",
    fullname: "Ana Recenseadora",
    email: "ana@cciao.org",
    role: "census_taker",
    isEnabled: true,
    isFirstLogin: true,
  },
  {
    id: "u3",
    fullname: "Bruno Desligado",
    email: "bruno@cciao.org",
    role: "census_taker",
    isEnabled: false,
    isFirstLogin: false,
  },
];

beforeEach(() => {
  auth.role = "admin";
  listUsers.mockReset();
  setUserStatus.mockReset();
  changeUserRole.mockReset();
  addUser.mockReset();
  listUsers.mockResolvedValue(USERS);
  setUserStatus.mockResolvedValue(true);
  addUser.mockResolvedValue(true);
});

describe("AdminUsers", () => {
  it("lista os usuários ativos e os contadores por situação", async () => {
    render(<AdminUsers />);

    expect(await screen.findByText("Renato Jr.")).toBeInTheDocument();
    expect(screen.getByText("Ana Recenseadora")).toBeInTheDocument();
    expect(screen.queryByText("Bruno Desligado")).not.toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent?.replace(/\s+/g, ""))).toEqual([
      "Ativos2",
      "Desativados1",
    ]);
    expect(screen.getByText("3 perfis")).toBeInTheDocument();
  });

  it("alterna para a aba de desativados", async () => {
    render(<AdminUsers />);
    await screen.findByText("Renato Jr.");

    fireEvent.click(screen.getByRole("tab", { name: /Desativados/ }));

    expect(screen.getByText("Bruno Desligado")).toBeInTheDocument();
    expect(screen.queryByText("Renato Jr.")).not.toBeInTheDocument();
    expect(screen.getByText("Desativado")).toBeInTheDocument();
  });

  it("desativa um usuário e recarrega a lista", async () => {
    render(<AdminUsers />);
    const row = (await screen.findByText("Ana Recenseadora")).closest(
      "tr",
    ) as HTMLElement;

    fireEvent.click(within(row).getByRole("button", { name: "Desativar" }));

    await waitFor(() =>
      expect(setUserStatus).toHaveBeenCalledWith("u2", false),
    );
    await waitFor(() => expect(listUsers).toHaveBeenCalledTimes(2));
  });

  it("marca a própria conta e bloqueia desativá-la ou rebaixá-la", async () => {
    render(<AdminUsers />);
    const row = (await screen.findByText("Renato Jr.")).closest(
      "tr",
    ) as HTMLElement;

    expect(within(row).getByText("você")).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Desativar" })).toBeDisabled();
    expect(within(row).getByRole("combobox")).toBeDisabled();
  });

  it("busca por nome ou e-mail dentro da aba", async () => {
    render(<AdminUsers />);
    await screen.findByText("Renato Jr.");

    fireEvent.change(screen.getByLabelText("Buscar pessoa"), {
      target: { value: "ana@" },
    });

    expect(screen.getByText("Ana Recenseadora")).toBeInTheDocument();
    expect(screen.queryByText("Renato Jr.")).not.toBeInTheDocument();
    expect(screen.getByText("1 perfil nesta aba")).toBeInTheDocument();
  });

  it("pagina a lista de dez em dez", async () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      id: `u-${index + 1}`,
      fullname: `Pessoa ${String(index + 1).padStart(2, "0")}`,
      email: `pessoa${index + 1}@cciao.org`,
      role: "census_taker",
      isEnabled: true,
      isFirstLogin: false,
    }));
    listUsers.mockResolvedValue(many);
    render(<AdminUsers />);

    expect(await screen.findByText("Pessoa 01")).toBeInTheDocument();
    expect(screen.queryByText("Pessoa 11")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByText("Pessoa 11")).toBeInTheDocument();
    expect(screen.getByText("Pessoa 12")).toBeInTheDocument();
    expect(screen.queryByText("Pessoa 01")).not.toBeInTheDocument();
  });

  it("convida uma pessoa nova só com nome e e-mail", async () => {
    render(<AdminUsers />);
    await screen.findByText("Renato Jr.");

    const invite = screen.getByRole("button", { name: "Enviar convite" });
    expect(invite).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Nova Pessoa" },
    });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "nova@cciao.org" },
    });
    expect(invite).toBeEnabled();

    fireEvent.click(invite);

    await waitFor(() =>
      expect(addUser).toHaveBeenCalledWith({
        fullname: "Nova Pessoa",
        email: "nova@cciao.org",
        role: "census_taker",
      }),
    );
  });

  it("bloqueia a tela para quem não é curador", async () => {
    auth.role = "census_taker";
    render(<AdminUsers />);

    expect(
      screen.getByText("Área restrita à equipe de curadoria."),
    ).toBeInTheDocument();
    expect(listUsers).not.toHaveBeenCalled();
  });
});
