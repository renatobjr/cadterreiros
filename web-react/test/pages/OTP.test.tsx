import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OTP from "../../src/pages/OTP";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const postMock = client.post as unknown as ReturnType<typeof vi.fn>;
const getMock = client.get as unknown as ReturnType<typeof vi.fn>;

function renderPage(state?: { isFromForget: boolean }) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/otp/token-123/email%40teste.com", state },
      ]}
    >
      <Routes>
        <Route path="/otp/:token/:email" element={<OTP />} />
        <Route path="/set-password/:token" element={<div>definir senha</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function typeCode(value: string) {
  fireEvent.change(screen.getByLabelText(/Código de verificação/), {
    target: { value },
  });
}

describe("OTP", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza a etapa de verificação fiel ao mock", () => {
    renderPage();

    expect(document.querySelector(".auth-shell")).toBeInTheDocument();
    expect(screen.getByText("Verificação")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Confira seu e-mail" }),
    ).toBeInTheDocument();
    expect(screen.getByText("email@teste.com")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Etapas do acesso" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Confira seu e-mail" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verificar código" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reenviar código" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar e corrigir e-mail" }),
    ).toHaveAttribute("href", "/esqueci-minha-senha");
    expect(document.querySelector(".auth-demo")).not.toBeInTheDocument();
  });

  it("marca a segunda etapa como atual", () => {
    renderPage();
    const steps = screen.getAllByRole("listitem");

    expect(steps[1]).toHaveClass("is-active");
    expect(steps[1]).toHaveAttribute("aria-current", "step");
    expect(steps[0]).toHaveClass("is-done");
  });

  it("aceita apenas dígitos e no máximo seis", () => {
    renderPage();
    const input = screen.getByLabelText(/Código de verificação/);

    fireEvent.change(input, { target: { value: "a1b2c3d4e5f6g7" } });
    expect(input).toHaveValue("123456");
  });

  it("valida o código antes de chamar a API", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Verificar código" }));

    expect(
      await screen.findByText("Informe os seis dígitos do código."),
    ).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("avança para a definição de senha quando o código é aceito", async () => {
    postMock.mockResolvedValue({ data: { status: true, data: { id: "1" } } });
    renderPage();

    typeCode("123456");
    fireEvent.click(screen.getByRole("button", { name: "Verificar código" }));

    expect(await screen.findByText("definir senha")).toBeInTheDocument();
    expect(postMock).toHaveBeenCalledWith("auth/verify-otp", {
      token: "token-123",
      otp: "123456",
    });
  });

  it("usa a mesma mensagem genérica para código recusado", async () => {
    postMock.mockResolvedValue({
      data: { status: false, error: "Código inválido" },
    });
    renderPage();

    typeCode("000000");
    fireEvent.click(screen.getByRole("button", { name: "Verificar código" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Código inválido ou expirado.");
  });

  it("reenvia o código e renova o token da rota", async () => {
    getMock.mockResolvedValue({ data: { status: true, data: "novo-token" } });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Reenviar código" }));

    expect(
      await screen.findByText("Enviamos um novo código."),
    ).toBeInTheDocument();
    expect(getMock).toHaveBeenCalledWith(
      "auth/generate-user-token/email@teste.com/true",
    );
  });
});
