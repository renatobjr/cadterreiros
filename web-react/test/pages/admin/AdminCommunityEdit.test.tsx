import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCommunityEdit from "../../../src/pages/admin/AdminCommunityEdit";
import { makeCommunity } from "../../fixtures/community";

const getCommunity = vi.fn();
const updateCommunity = vi.fn();

vi.mock("../../../src/api/admin", () => ({
  getCommunity: (...args: unknown[]) => getCommunity(...args),
  updateCommunity: (...args: unknown[]) => updateCommunity(...args),
}));

vi.mock("../../../src/features/admin/adminDataContext", () => ({
  useAdminData: () => ({
    records: [],
    loading: false,
    error: false,
    counts: { pending: 0, approved: 0, rejected: 0, total: 0, volunteers: 0 },
    reload: vi.fn(),
  }),
}));

vi.mock("../../../src/components/ui/toastContext", () => ({
  useToast: () => ({ show: vi.fn() }),
}));

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={["/admin/cadastros/1/editar"]}>
      <Routes>
        <Route
          path="/admin/cadastros/:id/editar"
          element={<AdminCommunityEdit />}
        />
        <Route path="/admin/cadastros/:id" element={<p>ficha do cadastro</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  getCommunity.mockReset();
  updateCommunity.mockReset();
  getCommunity.mockResolvedValue(makeCommunity());
  updateCommunity.mockResolvedValue(true);
});

describe("AdminCommunityEdit", () => {
  it("carrega o formulário com os dados do cadastro", async () => {
    renderEdit();

    expect(
      await screen.findByDisplayValue("Terreiro Teste"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mãe Ana")).toBeInTheDocument();
    expect(screen.getByDisplayValue("João Pessoa")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Terreiro Teste" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/voltam o registro para a fila/i)).toBeInTheDocument();
  });

  it("salva as alterações e volta para a ficha", async () => {
    renderEdit();
    const name = await screen.findByLabelText("Nome da comunidade");

    fireEvent.change(name, { target: { value: "Terreiro Renomeado" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(updateCommunity).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ religiousSpaceName: "Terreiro Renomeado" }),
      ),
    );
    expect(await screen.findByText("ficha do cadastro")).toBeInTheDocument();
  });

  it("mantém a pessoa na edição quando a API recusa", async () => {
    updateCommunity.mockResolvedValue(false);
    renderEdit();
    await screen.findByLabelText("Nome da comunidade");

    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Não foi possível salvar");
    expect(screen.queryByText("ficha do cadastro")).not.toBeInTheDocument();
  });
});
