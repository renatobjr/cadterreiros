import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPassword from "../../src/pages/ForgotPassword";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const getMock = client.get as unknown as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

describe("ForgotPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza a tela fiel ao mock", () => {
    renderPage();

    expect(document.querySelector(".auth-shell")).toBeInTheDocument();
    expect(screen.getByText("Recuperação")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Recuperar senha" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Informe seu e-mail para receber um código de verificação e criar uma nova senha.",
      ),
    ).toBeInTheDocument();
    const steps = screen.getByRole("list", { name: "Etapas do acesso" });
    expect(steps).toBeInTheDocument();
    expect(within(steps).getByText("E-mail")).toBeInTheDocument();
    expect(within(steps).getByText("Código")).toBeInTheDocument();
    expect(within(steps).getByText("Senha")).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar código" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".auth-note")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao login" })).toHaveAttribute(
      "href",
      "/entrar",
    );
  });

  it("marca a primeira etapa como atual", () => {
    renderPage();
    const steps = screen.getAllByRole("listitem");

    expect(steps[0]).toHaveClass("is-active");
    expect(steps[0]).toHaveAttribute("aria-current", "step");
    expect(steps[1]).not.toHaveClass("is-active");
  });

  it("valida o e-mail antes de chamar a API", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));
    expect(await screen.findByText("Informe o e-mail cadastrado.")).toBeInTheDocument();
    expect(getMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "sem-arroba" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));
    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(getMock).not.toHaveBeenCalled();
  });

  it("solicita o token de recuperação e navega para o OTP", async () => {
    getMock.mockResolvedValue({ data: { status: true, data: "tok-123" } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    await waitFor(() =>
      expect(getMock).toHaveBeenCalledWith(
        "auth/generate-user-token/curadoria@cciao.org/true",
      ),
    );
  });

  it("usa mensagem genérica na recusa (não revela se o e-mail existe)", async () => {
    getMock.mockResolvedValue({
      data: { status: false, error: "Email inválido" },
    });
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Não foi possível enviar o código agora. Tente novamente em instantes.",
    );
    expect(alert).not.toHaveTextContent(/inválido|não cadastrado|não existe/i);
  });

  it("avança para o OTP mesmo quando a API não revela o cadastro", async () => {
    getMock.mockResolvedValue({ data: { status: true, data: "token-opaco" } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "nao-cadastrado@exemplo.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    await waitFor(() =>
      expect(getMock).toHaveBeenCalledWith(
        "auth/generate-user-token/nao-cadastrado@exemplo.com/true",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("exibe erro quando a API falha", async () => {
    getMock.mockRejectedValue(new Error("falha de rede"));
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /não foi possível enviar/i,
    );
  });
});
