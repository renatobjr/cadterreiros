import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "../../../src/features/auth/AuthProvider";
import { useAuth } from "../../../src/features/auth/context";
import { authApi } from "../../../src/api/auth";

vi.mock("../../../src/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    validateToken: vi.fn(),
    logout: vi.fn(),
  },
}));

const loginMock = authApi.login as unknown as ReturnType<typeof vi.fn>;
const validateMock = authApi.validateToken as unknown as ReturnType<typeof vi.fn>;
const logoutMock = authApi.logout as unknown as ReturnType<typeof vi.fn>;

const sessionEnvelope = (user: Record<string, unknown>) => ({
  data: { status: true, data: { user } },
});

function Consumer() {
  const { user, isAuth, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="status">{isAuth ? "autenticado" : "anônimo"}</p>
      <p data-testid="email">{user?.email ?? "sem usuário"}</p>
      <p data-testid="role">{user?.role ?? "sem papel"}</p>
      <button
        type="button"
        onClick={() => login({ email: "ana@example.com", password: "segredo" })}
      >
        Entrar
      </button>
      <button type="button" onClick={() => void logout()}>
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

describe("AuthContext (sessão por cookie)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    validateMock.mockRejectedValue(new Error("sem sessão"));
    logoutMock.mockResolvedValue({ data: { status: true } });
  });

  it("inicia anônimo quando não há sessão no cookie", async () => {
    renderConsumer();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anônimo"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("sem usuário");
    expect(validateMock).toHaveBeenCalled();
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });

  it("login define usuário e papel a partir da resposta da API", async () => {
    loginMock.mockResolvedValue(
      sessionEnvelope({
        id: "1",
        email: "ana@example.com",
        fullname: "Ana",
        role: "admin",
      }),
    );

    renderConsumer();
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("autenticado"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("ana@example.com");
    expect(screen.getByTestId("role")).toHaveTextContent("admin");
    expect(loginMock).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "segredo",
    });
    // Nenhum token é persistido no navegador.
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });

  it("restaura a sessão a partir do cookie (validate-token)", async () => {
    validateMock.mockResolvedValue(
      sessionEnvelope({
        id: "3",
        email: "carla@example.com",
        fullname: "Carla",
        role: "census_taker",
      }),
    );

    renderConsumer();

    await waitFor(() =>
      expect(screen.getByTestId("email")).toHaveTextContent("carla@example.com"),
    );
    expect(screen.getByTestId("status")).toHaveTextContent("autenticado");
    expect(screen.getByTestId("role")).toHaveTextContent("census_taker");
  });

  it("descarta a sessão quando a API recusa o cookie", async () => {
    validateMock.mockResolvedValue({ data: { status: false, error: "Invalid token" } });

    renderConsumer();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anônimo"),
    );
  });

  it("logout encerra a sessão no servidor e no estado", async () => {
    validateMock.mockResolvedValue(
      sessionEnvelope({ id: "1", email: "ana@example.com", role: "admin" }),
    );

    renderConsumer();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("autenticado"),
    );

    fireEvent.click(screen.getByRole("button", { name: /sair/i }));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anônimo"),
    );
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
