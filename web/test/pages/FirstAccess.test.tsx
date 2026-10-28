import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FirstAccess from "../../src/pages/FirstAccess";
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
    <MemoryRouter initialEntries={["/primeiro-acesso"]}>
      <Routes>
        <Route path="/primeiro-acesso" element={<FirstAccess />} />
        <Route path="/otp/:token/:email" element={<div>verificar código</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
}

describe("FirstAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza a tela fiel ao mock", () => {
    renderPage();

    expect(document.querySelector(".auth-shell")).toBeInTheDocument();
    expect(screen.getByText("Primeiro acesso")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Configurar acesso" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Informe o e-mail de cadastro para receber um código de verificação e criar sua senha.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Etapas do acesso" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao login" })).toHaveAttribute(
      "href",
      "/entrar",
    );
    expect(document.querySelector(".auth-note")).not.toBeInTheDocument();
  });

  it("valida o e-mail antes de chamar a API", async () => {
    renderPage();

    submit();
    expect(
      await screen.findByText("Informe o e-mail de cadastro."),
    ).toBeInTheDocument();
    expect(getMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "sem-arroba" },
    });
    submit();
    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(getMock).not.toHaveBeenCalled();
  });

  it("solicita o token e avança para a verificação", async () => {
    getMock.mockResolvedValue({ data: { status: true, data: "tok-1" } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    submit();

    expect(await screen.findByText("verificar código")).toBeInTheDocument();
    expect(getMock).toHaveBeenCalledWith(
      "auth/generate-user-token/curadoria@cciao.org/false",
    );
  });

  it("exibe erro genérico quando a API falha", async () => {
    getMock.mockRejectedValue(new Error("falha de rede"));
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    submit();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/não foi possível iniciar o primeiro acesso/i);
    expect(alert).not.toHaveTextContent(/não cadastrado|inválido/i);
  });
});
