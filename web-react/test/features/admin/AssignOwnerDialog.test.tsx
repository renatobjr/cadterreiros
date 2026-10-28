import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AssignOwnerDialog from "../../../src/features/admin/components/AssignOwnerDialog";

const listUsers = vi.fn();
const assignOwner = vi.fn();

vi.mock("../../../src/api/admin", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
  assignOwner: (...args: unknown[]) => assignOwner(...args),
}));

const USERS = [
  {
    id: "u2",
    fullname: "Ana Recenseadora",
    email: "ana@cciao.org",
    role: "census_taker",
    isEnabled: true,
    isFirstLogin: false,
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

const TARGET = { id: "c1", name: "Terreiro Teste" };

function renderDialog() {
  const onClose = vi.fn();
  const onAssigned = vi.fn();
  render(
    <AssignOwnerDialog
      community={TARGET}
      onClose={onClose}
      onAssigned={onAssigned}
    />,
  );
  return { onClose, onAssigned };
}

async function choose(value: string) {
  const select = (await screen.findByLabelText(
    "Recenseador",
  )) as HTMLSelectElement;
  fireEvent.change(select, { target: { value } });
}

beforeEach(() => {
  listUsers.mockReset();
  assignOwner.mockReset();
  listUsers.mockResolvedValue(USERS);
  assignOwner.mockResolvedValue(true);
});

describe("AssignOwnerDialog", () => {
  it("lista apenas pessoas ativas da equipe", async () => {
    renderDialog();
    const select = (await screen.findByLabelText(
      "Recenseador",
    )) as HTMLSelectElement;

    const labels = Array.from(select.options).map((option) => option.textContent);
    expect(labels).toContain("Ana Recenseadora");
    expect(labels).not.toContain("Bruno Desligado");
  });

  it("atribui mantendo o status quando marcado", async () => {
    const { onClose, onAssigned } = renderDialog();

    await choose("u2");
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Manter o status/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Atribuir" }));

    await waitFor(() =>
      expect(assignOwner).toHaveBeenCalledWith("c1", "u2", true),
    );
    await waitFor(() => expect(onAssigned).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("exige a escolha antes de habilitar o envio", async () => {
    renderDialog();

    expect(
      await screen.findByRole("button", { name: "Atribuir" }),
    ).toBeDisabled();
    expect(assignOwner).not.toHaveBeenCalled();
  });

  it("mostra o erro da API e mantém o diálogo aberto", async () => {
    assignOwner.mockResolvedValue(false);
    const { onClose } = renderDialog();

    await choose("u2");
    fireEvent.click(screen.getByRole("button", { name: "Atribuir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível atribuir",
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
