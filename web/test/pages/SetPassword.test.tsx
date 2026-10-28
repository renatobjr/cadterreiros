import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SetPassword from "../../src/pages/SetPassword";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const postMock = client.post as unknown as ReturnType<typeof vi.fn>;

function renderPage(state?: { isFromForget: boolean }) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: "/set-password/token-123", state }]}
    >
      <Routes>
        <Route path="/set-password/:token" element={<SetPassword />} />
      </Routes>
    </MemoryRouter>,
  );
}

function fill(password: string, confirm = password) {
  fireEvent.change(screen.getByLabelText(/Nova senha/), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/Confirme a nova senha/), {
    target: { value: confirm },
  });
}

describe("SetPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza a etapa final fiel ao mock", () => {
    renderPage();

    expect(document.querySelector(".auth-shell")).toBeInTheDocument();
    expect(screen.getByText("Etapa final")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Criar nova senha" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Defina uma nova senha para voltar a acessar o painel."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mínimo de 8 caracteres."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar nova senha" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao login" })).toHaveAttribute(
      "href",
      "/entrar",
    );

    const steps = screen.getAllByRole("listitem");
    expect(steps[2]).toHaveClass("is-active");
    expect(steps[0]).toHaveClass("is-done");
  });

  it("alterna a visibilidade das senhas", () => {
    renderPage();
    const password = screen.getByLabelText(/Nova senha/);

    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getAllByRole("button", { name: "Mostrar senha" })[0]);
    expect(password).toHaveAttribute("type", "text");
  });

  it("valida tamanho mínimo e confirmação", async () => {
    renderPage();

    fill("123", "321");
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(
      await screen.findByText("Use pelo menos 8 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByText("As senhas não conferem.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("envia a nova senha e confirma a redefinição", async () => {
    postMock.mockResolvedValue({ data: { status: true, data: { id: "1" } } });
    renderPage();

    fill("senha-segura");
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(
      await screen.findByText(
        "Senha redefinida. Você já pode entrar com a nova senha.",
      ),
    ).toBeInTheDocument();
    expect(postMock).toHaveBeenCalledWith("auth/set-password", {
      token: "token-123",
      password: "senha-segura",
      fullname: "",
    });
  });

  it("mostra a recusa da API com mensagem genérica", async () => {
    postMock.mockResolvedValue({
      data: { status: false, error: "Aconteceu um erro ao atualizar a senha" },
    });
    renderPage();

    fill("senha-segura");
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /não foi possível salvar a nova senha/i,
    );
  });

  it("no primeiro acesso pede o nome completo", async () => {
    postMock.mockResolvedValue({ data: { status: true, data: { id: "1" } } });
    renderPage({ isFromForget: false });

    expect(
      screen.getByRole("heading", { level: 1, name: "Concluir primeiro acesso" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Nome completo/),
    ).toBeInTheDocument();

    fill("senha-segura");
    fireEvent.click(screen.getByRole("button", { name: "Concluir acesso" }));

    expect(await screen.findByText("Informe seu nome completo.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Maria da Curadoria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Concluir acesso" }));

    await waitFor(() =>
      expect(postMock).toHaveBeenCalledWith("auth/set-password", {
        token: "token-123",
        password: "senha-segura",
        fullname: "Maria da Curadoria",
      }),
    );
  });
});
