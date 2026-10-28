import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminRecords from "../../../src/pages/admin/AdminRecords";
import { AdminDataProvider } from "../../../src/features/admin/AdminDataProvider";
import type { ReligiousCommunity } from "../../../src/domain/types";

const listAllCommunities = vi.fn();
const decide = vi.fn();

vi.mock("../../../src/api/admin", () => ({
  listAllCommunities: () => listAllCommunities(),
  decide: (...args: unknown[]) => decide(...args),
}));

vi.mock("../../../src/features/auth/context", () => ({
  useAuth: () => ({
    user: { id: "user-admin", email: "a@b.c", fullname: "Ana", role: "admin" },
    isAuth: true,
    restoring: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function record(overrides: Partial<ReligiousCommunity>): ReligiousCommunity {
  return {
    id: "1",
    authorization: true,
    communityGoogleApiLocalization: { lat: -7.12, long: -34.88 },
    communityType: "comunidade de terreiro",
    religiousSpaceYearFoundation: 1990,
    religiousSpaceLeaderFoundation: "Pai",
    religiousSpaceNation: "ketu",
    religiousSpacePraticalLanguages: "yoruba",
    religiousSpaceName: "Terreiro Teste",
    religiousSpaceLeaderName: "Mãe",
    religiousSpacePositionName: "Ialorixá",
    religiousSpaceStartedBy: "Pai",
    religiousSpaceNameDateStartedBy: "1990-01-01",
    leaderEthnicity: "preta",
    leaderGender: "feminino",
    leaderEducationalLevel: "superior",
    leaderSufferedRacism: false,
    religiousSpaceStatus: "active",
    censusStep: "pending",
    registeredVoluntarily: false,
    censusTakerId: "user-admin",
    censusTakerFullname: "Ana",
    createdAt: "2020-01-01",
    updatedAt: "2020-01-02",
    ...overrides,
  } as ReligiousCommunity;
}

const RECORDS = [
  record({ id: "1", religiousSpaceName: "Pendente Um", censusStep: "pending" }),
  record({
    id: "2",
    religiousSpaceName: "Aprovado Dois",
    censusStep: "approved",
    registeredVoluntarily: true,
  }),
  record({
    id: "3",
    religiousSpaceName: "Rejeitado Três",
    censusStep: "rejected",
    religiousSpaceNation: "angola",
  }),
];

function renderPage(initial = "/admin/cadastros") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <AdminDataProvider>
        <AdminRecords />
      </AdminDataProvider>
    </MemoryRouter>,
  );
}

describe("AdminRecords", () => {
  beforeEach(() => {
    listAllCommunities.mockReset();
    listAllCommunities.mockResolvedValue(RECORDS);
    decide.mockReset();
    decide.mockResolvedValue(true);
  });

  it("mostra os contadores por estágio do censo", async () => {
    renderPage();

    expect(await screen.findByText("Pendente Um")).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent?.replace(/\s+/g, ""))).toEqual([
      "Todos3",
      "Pendentes1",
      "Aprovados1",
      "Rejeitados1",
    ]);
  });

  it("filtra pela aba de status vinda da URL", async () => {
    renderPage("/admin/cadastros?status=rejected");

    expect(await screen.findByText("Rejeitado Três")).toBeInTheDocument();
    expect(screen.queryByText("Pendente Um")).not.toBeInTheDocument();
  });

  it("busca por nome e limpa os filtros", async () => {
    renderPage();
    await screen.findByText("Pendente Um");

    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "aprovado" },
    });
    expect(screen.getByText("Aprovado Dois")).toBeInTheDocument();
    expect(screen.queryByText("Pendente Um")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /limpar filtros/i }));
    expect(screen.getByText("Pendente Um")).toBeInTheDocument();
  });

  it("oferece ações conforme o estágio (pendente tem aprovar e rejeitar)", async () => {
    renderPage("/admin/cadastros?status=pending");
    const row = (await screen.findByText("Pendente Um")).closest("tr") as HTMLElement;

    const labels = within(row)
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"));
    expect(labels).toEqual(
      expect.arrayContaining(["Aprovar cadastro", "Rejeitar cadastro", "Solicitar correções"]),
    );
    expect(within(row).getByRole("link", { name: "Editar cadastro" })).toBeInTheDocument();
  });

  it("aprova em lote os pendentes selecionados", async () => {
    renderPage("/admin/cadastros?status=pending");
    await screen.findByText("Pendente Um");

    fireEvent.click(screen.getByLabelText("Selecionar Pendente Um"));

    expect(
      screen.getByRole("region", { name: "Ações em lote" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aprovar selecionados" }));

    await waitFor(() =>
      expect(decide).toHaveBeenCalledWith("approve", { communityId: "1" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "1 cadastro(s) aprovado(s).",
    );
  });

  it("rejeita em lote com um motivo compartilhado", async () => {
    renderPage("/admin/cadastros?status=pending");
    await screen.findByText("Pendente Um");

    fireEvent.click(screen.getByLabelText("Selecionar Pendente Um"));
    fireEvent.click(
      screen.getByRole("button", { name: "Rejeitar selecionados" }),
    );
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Falta a fotografia da fachada." },
    });
    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() =>
      expect(decide).toHaveBeenCalledWith("reject", {
        communityId: "1",
        rejectedReason: "Falta a fotografia da fachada.",
      }),
    );
  });

  it("não deixa selecionar registros fora da fila", async () => {
    renderPage("/admin/cadastros?status=approved");
    await screen.findByText("Aprovado Dois");

    expect(
      screen.getByLabelText("Selecionar Aprovado Dois"),
    ).toBeDisabled();
  });

  it("registro aprovado não oferece aprovar nem rejeitar", async () => {
    renderPage("/admin/cadastros?status=approved");
    const row = (await screen.findByText("Aprovado Dois")).closest("tr") as HTMLElement;

    expect(within(row).queryByLabelText("Aprovar cadastro")).not.toBeInTheDocument();
    expect(within(row).queryByLabelText("Rejeitar cadastro")).not.toBeInTheDocument();
    expect(within(row).getByLabelText("Solicitar correções")).toBeInTheDocument();
  });
});
