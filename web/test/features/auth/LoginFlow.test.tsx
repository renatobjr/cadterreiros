import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginForm from "../../../src/features/auth/components/LoginForm";
import { authApi, type LoginResponse } from "../../../src/api/auth";

vi.mock("../../../src/api/auth", () => ({
  authApi: { login: vi.fn() },
  default: { login: vi.fn() },
}));

/**
 * Reproduz o fluxo real de /entrar: o formulário autentica pela API e, no
 * sucesso, o app navega para a busca.
 */
function LoginRoute() {
  const navigate = useNavigate();
  return <LoginForm onSuccess={() => navigate("/buscar")} />;
}

function renderLoginFlow() {
  return render(
    <MemoryRouter initialEntries={["/entrar"]}>
      <Routes>
        <Route path="/entrar" element={<LoginRoute />} />
        <Route path="/buscar" element={<h1>Busca de terreiros</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillCredentials(email = "admin@example.com", password = "senha-secreta") {
  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/senha/i), {
    target: { value: password },
  });
}

describe("Fluxo de login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authApi.login).mockResolvedValue({ token: "session-token" });
  });

  it("autentica pela API e navega para a busca", async () => {
    renderLoginFlow();

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledTimes(1);
      expect(authApi.login).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "senha-secreta",
      });
    });

    expect(
      await screen.findByRole("heading", { name: /busca de terreiros/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
  });

  it("bloqueia reenvio enquanto a autenticação está em andamento", async () => {
    let resolveLogin: (value: LoginResponse) => void = () => {};
    vi.mocked(authApi.login).mockImplementation(
      () =>
        new Promise<LoginResponse>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    renderLoginFlow();
    fillCredentials("voluntario@example.com", "outra-senha");
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /entrar/i })).toBeDisabled();
    });

    act(() => {
      resolveLogin({ token: "session-token" });
    });

    expect(
      await screen.findByRole("heading", { name: /busca de terreiros/i }),
    ).toBeInTheDocument();
  });
});
