import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

describe("CommunityRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renderiza o formulário completo do cadastro voluntário", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Cadastro voluntário" }),
    ).toBeInTheDocument();
    expect(field("Nome da comunidade")).toBeInTheDocument();
    expect(field("Nome da liderança")).toBeInTheDocument();
    expect(field("Tipo de comunidade")).toBeInTheDocument();
    expect(field("Nação")).toBeInTheDocument();
    expect(field("Idioma ritual")).toBeInTheDocument();
    expect(field("Ano de fundação")).toBeInTheDocument();
    expect(field("Cargo ou função")).toBeInTheDocument();
    expect(field("Data de início")).toBeInTheDocument();
    expect(field("História da comunidade")).toBeInTheDocument();
    expect(field("História da comunidade")).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.queryByLabelText(/Latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Longitude/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    ).toBeInTheDocument();
  });

  it("não chama a API quando o formulário está incompleto", async () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /enviar para curadoria/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Revise os campos abaixo",
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it("aplica a máscara 00000-000 no CEP", () => {
    renderPage();
    const cep = field("CEP");

    fireEvent.change(cep, { target: { value: "58030" } });
    expect(cep).toHaveValue("58030");

    fireEvent.change(cep, { target: { value: "58030000" } });
    expect(cep).toHaveValue("58030-000");

    fireEvent.change(cep, { target: { value: "58030-0009" } });
    expect(cep).toHaveValue("58030-000");
  });

  it("preenche endereço, estado e cidade a partir do ViaCEP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              logradouro: "Avenida Presidente Epitácio Pessoa",
              bairro: "Estados",
              localidade: "João Pessoa",
              uf: "PB",
            }),
        }),
      ),
    );
    renderPage();

    fireEvent.change(field("CEP"), { target: { value: "58030000" } });

    await waitFor(() => {
      expect(field("Endereço")).toHaveValue(
        "Avenida Presidente Epitácio Pessoa",
      );
    });
    expect(field("Bairro")).toHaveValue("Estados");
    expect(field("Estado")).toHaveTextContent("PB");
    expect(field("Cidade")).toHaveValue("João Pessoa");
  });

  it("preenche a cidade quando ela não está na lista da RMR", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              logradouro: "Travessa Almirante Alexandrino",
              bairro: "Centro",
              localidade: "Campina Grande",
              uf: "PB",
            }),
        }),
      ),
    );
    renderPage();

    fireEvent.change(field("CEP"), { target: { value: "58400265" } });

    await waitFor(() => {
      expect(field("Cidade")).toHaveValue("Campina Grande");
    });
    expect(screen.queryByLabelText(/Qual cidade/i)).not.toBeInTheDocument();
  });

  it("permite digitar a cidade manualmente", () => {
    renderPage();
    const city = field("Cidade");

    expect(city.tagName).toBe("INPUT");
    fireEvent.change(city, { target: { value: "Itabaiana" } });
    expect(city).toHaveValue("Itabaiana");
  });
});
