import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommunityRegister from "../../src/pages/CommunityRegister";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const postMock = client.post as unknown as ReturnType<typeof vi.fn>;
const currentYear = new Date().getFullYear();

function renderPage() {
  return render(
    <MemoryRouter>
      <CommunityRegister />
    </MemoryRouter>,
  );
}

function field(label: string) {
  return screen.getByLabelText(label, { exact: false });
}

/**
 * Preenche um campo. Textos usam `change`; selects usam o combobox do projeto
 * (abre a lista e escolhe a opção pelo rótulo).
 */
function change(label: string, value: string) {
  const control = field(label);

  // Só o combobox customizado abre lista; inputs/textarea recebem `change`.
  if (control.getAttribute("role") !== "combobox") {
    fireEvent.change(control, { target: { value } });
    return;
  }

  fireEvent.click(control);
  const option = screen
    .getAllByRole("option")
    .find((item) => item.getAttribute("data-value") === value);

  if (!option) {
    throw new Error(`Opção "${value}" não encontrada no campo "${label}"`);
  }
  fireEvent.mouseDown(option);
}

const requiredValues: Record<string, string> = {
  "Nome da comunidade": "Terreiro Ilê Axé",
  "Nome da liderança": "Mãe Ana de Oxum",
  "Tipo de comunidade": "comunidade de terreiro",
  Nação: "ketu",
  "Idioma ritual": "yoruba",
  "Ano de fundação": "1950",
  "Cargo ou função": "Ialorixá",
  "Fundador da liderança": "Pai Joaquim",
  "Quem iniciou a comunidade": "Pai Joaquim de Xangô",
  "Data de início": "1970-05-12",
  Gênero: "feminino",
  "Etnia / raça-cor": "preta",
  Escolaridade: "Superior Completo",
  "Já sofreu racismo?": "nao",
  "E-mail de contato": "lideranca@teste.local",
  Cidade: "João Pessoa",
  Bairro: "Centro",
  Endereço: "Rua das Flores",
  Número: "123",
  CEP: "58000-000",
  "História da comunidade":
    "Comunidade fundada em 1950 por Pai Joaquim, dedicada a Xangô.",
};

function fillRequiredFields(overrides: Record<string, string> = {}) {
  const values = { ...requiredValues, ...overrides };
  Object.entries(values).forEach(([label, value]) => {
    change(label, value);
  });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: /ciente de que este cadastro será avaliado/i,
    }),
  );
}

describe("Fluxo de cadastro voluntário", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue({ id: "PROT-2026-001" });
  });

  it("renderiza o cabeçalho, todos os grupos e os campos obrigatórios", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Cadastro voluntário" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Participação")).toBeInTheDocument();
    expect(
      screen.getByText(/avaliado antes de entrar no acervo público/i),
    ).toBeInTheDocument();
    expect(document.querySelector(".page-head__meta")).not.toBeInTheDocument();

    [
      "A comunidade",
      "Tradição e história",
      "Liderança",
      "Território",
      "Fotografia e autorização",
    ].forEach((group) => {
      expect(
        screen.getByRole("heading", { name: group }),
      ).toBeInTheDocument();
    });

    Object.keys(requiredValues).forEach((label) => {
      expect(field(label)).toBeInTheDocument();
    });

    expect(field("Estado")).toHaveTextContent("PB");
    expect(screen.getByText("Como funciona")).toBeInTheDocument();
    expect(screen.getByText("Privacidade")).toBeInTheDocument();
    expect(screen.getByText(/Campos com/i)).toBeInTheDocument();
  });

  it("bloqueia o envio e lista os erros quando os obrigatórios estão vazios", async () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    );

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("Revise os campos abaixo");
    expect(summary).toHaveTextContent(
      /Informe o nome da comunidade \(mínimo 3 caracteres\)/i,
    );
    expect(summary).toHaveTextContent(/Informe a cidade/i);
    expect(summary).toHaveTextContent(
      /É necessário autorizar a avaliação pela curadoria/i,
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it("valida o ano de fundação e a história obrigatória", async () => {
    renderPage();
    fillRequiredFields({
      "Ano de fundação": "1400",
      "História da comunidade": "curta",
    });

    fireEvent.click(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    );

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(
      new RegExp(`Informe um ano entre 1500 e ${currentYear}`),
    );
    expect(summary).toHaveTextContent(
      /Conte a história da comunidade \(mínimo 10 caracteres\)/i,
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it("envia o payload completo e exibe o protocolo com o resumo", async () => {
    renderPage();
    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    );

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(1);
    });

    expect(postMock).toHaveBeenCalledWith(
      "religious-communities/public/create",
      {
        religiousSpaceName: "Terreiro Ilê Axé",
        communityType: "comunidade de terreiro",
        religiousSpaceNation: "ketu",
        religiousSpacePraticalLanguages: "yoruba",
        religiousSpaceYearFoundation: 1950,
        religiousSpaceLeaderName: "Mãe Ana de Oxum",
        religiousSpaceLeaderFoundation: "Pai Joaquim",
        religiousSpacePositionName: "Ialorixá",
        religiousSpaceStartedBy: "Pai Joaquim de Xangô",
        religiousSpaceNameDateStartedBy: "1970-05-12",
        leaderEthnicity: "preta",
        leaderGender: "feminino",
        leaderEducationalLevel: "Superior Completo",
        leaderSufferedRacism: false,
        leaderContacts: { email: "lideranca@teste.local" },
        communityAddress: {
          fullAddress:
            "Rua das Flores, 123 - Centro, João Pessoa - PB, 58000-000",
          street: "Rua das Flores",
          number: "123",
          neighborhood: "Centro",
          city: "João Pessoa",
          state: "PB",
          zipcode: "58000-000",
        },
        authorization: true,
        bio: "Comunidade fundada em 1950 por Pai Joaquim, dedicada a Xangô.",
      },
    );

    expect(
      await screen.findByRole("heading", {
        name: "Obrigado pela contribuição",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("PROT-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Em avaliação")).toBeInTheDocument();
    expect(screen.getByText("Comunidade de terreiro")).toBeInTheDocument();
    expect(screen.getByText("Ketu")).toBeInTheDocument();
    expect(screen.getByText("João Pessoa")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("1950")).toBeInTheDocument();
    expect(screen.getByText("Yoruba")).toBeInTheDocument();
    expect(screen.getByText("O que acontece agora")).toBeInTheDocument();
  });

  it("mantém o envio bloqueado e o status visível enquanto aguarda a API", async () => {
    let resolveCreate: (value: { id: string }) => void = () => {};
    postMock.mockImplementation(
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    renderPage();
    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /enviando/i }),
      ).toBeDisabled();
    });
    expect(
      screen.getByText("Enviando cadastro para avaliação..."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("PROT-2026-002"),
    ).not.toBeInTheDocument();

    act(() => {
      resolveCreate({ id: "PROT-2026-002" });
    });

    expect(await screen.findByText("PROT-2026-002")).toBeInTheDocument();
  });

  it("exibe o erro da API e permite tentar novamente", async () => {
    postMock.mockRejectedValue({ response: { status: 403 } });

    renderPage();
    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    );

    expect(
      await screen.findByText(/envio foi recusado pela API \(403\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    ).not.toBeDisabled();
  });
});
