import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "../../../src/features/auth/AuthProvider";
import { useAuth } from "../../../src/features/auth/context";
import { authApi } from "../../../src/api/auth";

vi.mock("../../../src/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    validateToken: vi.fn(),
  },
}));

const loginMock = authApi.login as unknown as ReturnType<typeof vi.fn>;
const validateMock = authApi.validateToken as unknown as ReturnType<typeof vi.fn>;

function Consumer() {
  const { user, isAuth, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="status">{isAuth ? "autenticado" : "anônimo"}</p>
      <p data-testid="email">{user.email ?? "sem usuário"}</p>
      <p data-testid="fullname">{user.fullname ?? "sem nome"}</p>
      <button type="button" onClick={() => login({ email: "ana@example.com", password: "segredo" })}>
        Entrar
      </button>
      <button type="button" onClick={logout}>
        Sair
      </button>
    </div>
  );
}

function renderConsumer() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    validateMock.mockRejectedValue(new Error("sem sessão"));
  });

  it("inicia anônimo, sem usuário e sem token persistido", () => {
    renderConsumer();

    expect(screen.getByTestId("status")).toHaveTextContent("anônimo");
    expect(screen.getByTestId("email")).toHaveTextContent("sem usuário");
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });

  it("login define usuário, ativa sessão e persiste token", async () => {
    loginMock.mockResolvedValue({
      user: { id: "1", email: "ana@example.com", fullname: "Ana" },
      token: "tok-123",
    });

    renderConsumer();
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("autenticado");
    });
    expect(screen.getByTestId("email")).toHaveTextContent("ana@example.com");
    expect(screen.getByTestId("fullname")).toHaveTextContent("Ana");
    expect(localStorage.getItem("SESSION_TOKEN")).toBe("tok-123");
    expect(loginMock).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "segredo",
    });
  });

  it("login aceita resposta envelopada da API", async () => {
    loginMock.mockResolvedValue({
      status: true,
      data: {
        user: { id: "2", email: "bia@example.com", fullname: "Bia" },
        token: "tok-456",
      },
    });

    renderConsumer();
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("autenticado");
    });
    expect(screen.getByTestId("email")).toHaveTextContent("bia@example.com");
    expect(localStorage.getItem("SESSION_TOKEN")).toBe("tok-456");
  });

  it("logout limpa usuário, sessão e token persistido", async () => {
    loginMock.mockResolvedValue({
      user: { id: "1", email: "ana@example.com", fullname: "Ana" },
      token: "tok-123",
    });

    renderConsumer();
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("autenticado");
    });

    fireEvent.click(screen.getByRole("button", { name: /sair/i }));

    expect(screen.getByTestId("status")).toHaveTextContent("anônimo");
    expect(screen.getByTestId("email")).toHaveTextContent("sem usuário");
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });

  it("login sem token mantém sessão anônima", async () => {
    loginMock.mockResolvedValue({ status: false, error: "E-mail ou senha inválidos" });

    renderConsumer();
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId("status")).toHaveTextContent("anônimo");
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });

  it("restaura sessão e identidade a partir do token persistido", async () => {
    localStorage.setItem("SESSION_TOKEN", "tok-existente");
    validateMock.mockResolvedValue({
      data: {
        status: true,
        data: {
          user: { id: "3", email: "carla@example.com", fullname: "Carla" },
          token: "tok-existente",
        },
      },
    });

    renderConsumer();

    expect(screen.getByTestId("status")).toHaveTextContent("autenticado");
    await waitFor(() =>
      expect(screen.getByTestId("email")).toHaveTextContent("carla@example.com"),
    );
    expect(validateMock).toHaveBeenCalledWith("tok-existente");
  });

  it("descarta a sessão quando o token persistido é inválido", async () => {
    localStorage.setItem("SESSION_TOKEN", "tok-vencido");
    validateMock.mockResolvedValue({ data: { status: false, error: "Invalid token" } });

    renderConsumer();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anônimo"),
    );
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });
});
