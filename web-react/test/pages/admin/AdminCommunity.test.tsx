import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCommunity from "../../../src/pages/admin/AdminCommunity";
import { makeCommunity } from "../../fixtures/community";

const getCommunity = vi.fn();
const decide = vi.fn();
const listUsers = vi.fn();
const assignOwner = vi.fn();

vi.mock("../../../src/api/admin", () => ({
  getCommunity: (...args: unknown[]) => getCommunity(...args),
  decide: (...args: unknown[]) => decide(...args),
  listUsers: (...args: unknown[]) => listUsers(...args),
  assignOwner: (...args: unknown[]) => assignOwner(...args),
}));

const TEAM = [
  {
    id: "user-taker",
    fullname: "Ana Recenseadora",
    email: "ana@cciao.org",
    role: "census_taker",
    isEnabled: true,
    isFirstLogin: false,
  },
];

const auth = { role: "admin", id: "user-admin" };

vi.mock("../../../src/features/auth/context", () => ({
  useAuth: () => ({
    user: {
      id: auth.id,
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

vi.mock("../../../src/features/admin/adminDataContext", () => ({
  useAdminData: () => ({
    records: [],
    loading: false,
    error: false,
    counts: { pending: 0, approved: 0, rejected: 0, total: 0, volunteers: 0 },
    reload: vi.fn(),
  }),
}));

vi.mock("../../../src/features/metrics/components/LeafletMap", () => ({
  default: () => <div data-testid="mapa" />,
}));

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={["/admin/cadastros/1"]}>
      <Routes>
        <Route path="/admin/cadastros/:id" element={<AdminCommunity />} />
        <Route path="/admin/cadastros" element={<p>lista de cadastros</p>} />
        <Route
          path="/admin/cadastros/:id/editar"
          element={<p>edição do cadastro</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  auth.role = "admin";
  auth.id = "user-admin";
  getCommunity.mockReset();
  decide.mockReset();
  decide.mockResolvedValue(true);
  listUsers.mockReset();
  listUsers.mockResolvedValue(TEAM);
  assignOwner.mockReset();
  assignOwner.mockResolvedValue(true);
});

describe("AdminCommunity", () => {
  it("mostra a ficha pendente com aprovar, rejeitar e menu de ações", async () => {
    getCommunity.mockResolvedValue(makeCommunity({ censusStep: "pending" }));
    renderDetail();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Terreiro Teste" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Aprovar/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rejeitar/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mais ações" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Comunidade de terreiro de tradição ketu.")).toBeInTheDocument();
  });

  it("aprova o cadastro e recarrega a ficha", async () => {
    getCommunity.mockResolvedValue(makeCommunity({ censusStep: "pending" }));
    renderDetail();

    const approve = await screen.findByRole("button", { name: /Aprovar/ });
    fireEvent.click(approve);

    await waitFor(() =>
      expect(decide).toHaveBeenCalledWith("approve", { communityId: "1" }),
    );
    await waitFor(() => expect(getCommunity).toHaveBeenCalledTimes(2));
  });

  it("abre o diálogo de rejeição a partir do botão", async () => {
    getCommunity.mockResolvedValue(makeCommunity({ censusStep: "pending" }));
    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /Rejeitar/ }));

    // `dialog` fechado não entra na árvore acessível no jsdom; conferimos o
    // conteúdo montado depois do clique.
    await waitFor(() =>
      expect(document.querySelector("dialog.admin-dialog")?.textContent).toContain(
        "Rejeitar cadastro",
      ),
    );
  });

  it("no estado aprovado só oferece correções e edição", async () => {
    getCommunity.mockResolvedValue(makeCommunity({ censusStep: "approved" }));
    renderDetail();

    expect(
      await screen.findByRole("button", { name: /Solicitar correções/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Editar cadastro/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Aprovar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Rejeitar/ })).not.toBeInTheDocument();
  });

  it("no estado rejeitado oferece aprovar e o menu, sem rejeitar de novo", async () => {
    getCommunity.mockResolvedValue(
      makeCommunity({
        censusStep: "rejected",
        rejectedReason: "Falta a fotografia da fachada.",
      }),
    );
    renderDetail();

    expect(await screen.findByRole("button", { name: /Aprovar/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mais ações" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Rejeitar/ })).not.toBeInTheDocument();
    expect(screen.getByText("Motivo da última correção")).toBeInTheDocument();
    expect(
      screen.getAllByText("Falta a fotografia da fachada.").length,
    ).toBeGreaterThan(0);
  });

  it("recenseador dono edita, mas não decide", async () => {
    auth.role = "census_taker";
    auth.id = "user-taker";
    getCommunity.mockResolvedValue(
      makeCommunity({ censusStep: "pending", censusTakerId: "user-taker" }),
    );
    renderDetail();

    expect(
      await screen.findByRole("link", { name: /Editar cadastro/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Aprovar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Rejeitar/ })).not.toBeInTheDocument();
  });

  it("atribui um recenseador pela ficha", async () => {
    getCommunity.mockResolvedValue(makeCommunity({ censusStep: "pending" }));
    renderDetail();

    fireEvent.click(
      await screen.findByRole("button", { name: "Atribuir recenseador" }),
    );

    const combobox = (await screen.findByLabelText(
      "Recenseador",
    )) as HTMLSelectElement;
    fireEvent.change(combobox, { target: { value: "user-taker" } });
    fireEvent.click(screen.getByRole("button", { name: "Atribuir" }));

    await waitFor(() =>
      expect(assignOwner).toHaveBeenCalledWith("1", "user-taker", false),
    );
  });

  it("mostra a mensagem de registro inexistente", async () => {
    getCommunity.mockResolvedValue(null);
    renderDetail();

    expect(
      await screen.findByRole("heading", { name: "Cadastro não encontrado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Voltar para cadastros/ }),
    ).toBeInTheDocument();
  });
});
