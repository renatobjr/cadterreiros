import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RequireAdmin from "../../../src/features/admin/components/RequireAdmin";

const authState = {
  isAuth: false,
  restoring: false,
};

vi.mock("../../../src/features/auth/context", () => ({
  useAuth: () => ({
    user: authState.isAuth
      ? { id: "1", email: "a@b.c", fullname: "Ana", role: "admin" }
      : null,
    isAuth: authState.isAuth,
    restoring: authState.restoring,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function renderGuard(initial = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<p>conteúdo do painel</p>} />
        </Route>
        <Route path="/entrar" element={<p>tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAdmin", () => {
  beforeEach(() => {
    authState.isAuth = false;
    authState.restoring = false;
  });

  it("mostra o loader enquanto a sessão é validada", () => {
    authState.restoring = true;
    renderGuard();

    expect(screen.getByRole("status", { name: "Verificando sessão" })).toBeInTheDocument();
    expect(screen.queryByText("tela de login")).not.toBeInTheDocument();
  });

  it("redireciona para o login quando não há sessão", async () => {
    renderGuard();

    await waitFor(() =>
      expect(screen.getByText("tela de login")).toBeInTheDocument(),
    );
    expect(screen.queryByText("conteúdo do painel")).not.toBeInTheDocument();
  });

  it("libera o painel com sessão ativa", () => {
    authState.isAuth = true;
    renderGuard();

    expect(screen.getByText("conteúdo do painel")).toBeInTheDocument();
  });
});
