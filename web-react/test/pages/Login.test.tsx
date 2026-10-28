import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../../src/pages/Login";
import { AuthProvider } from "../../src/features/auth/AuthProvider";
import { authApi } from "../../src/api/auth";

vi.mock("../../src/api/auth", () => ({
  authApi: { login: vi.fn(), validateToken: vi.fn() },
  default: { login: vi.fn(), validateToken: vi.fn() },
}));

const loginMock = authApi.login as unknown as ReturnType<typeof vi.fn>;
const validateMock = authApi.validateToken as unknown as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/entrar"]}>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    validateMock.mockRejectedValue(new Error("sem sessão"));
  });

  it("renderiza a moldura do mock com o cartão de acesso", () => {
    renderPage();

    expect(document.querySelector(".auth-shell")).toBeInTheDocument();
    expect(
      screen.getByText("Um registro vivo das comunidades de matriz africana."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Acesso da curadoria"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Entrar no painel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Acesso restrito à equipe de curadoria e aos recenseadores.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Voltar ao site/ }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Esqueci minha senha" }),
    ).toHaveAttribute("href", "/esqueci-minha-senha");
    expect(screen.getByRole("link", { name: "Primeiro acesso" })).toHaveAttribute(
      "href",
      "/primeiro-acesso",
    );
    expect(
      screen.getByText(
        "Acesso restrito à equipe de curadoria e aos recenseadores do Cadterreiros.",
      ),
    ).toBeInTheDocument();
  });

  it("marca o body com auth-mode enquanto está montado", () => {
    const { unmount } = renderPage();
    expect(document.body).toHaveClass("auth-mode");
    unmount();
    expect(document.body).not.toHaveClass("auth-mode");
  });

  it("valida e-mail e senha antes de chamar a API", async () => {
    renderPage();

    submit();

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "invalido" },
    });
    submit();

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
  });

  it("envia origin web e mostra a recusa da API", async () => {
    loginMock.mockResolvedValue({
      data: { status: false, error: "Email ou senha inválida" },
    });
    renderPage();

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    fireEvent.change(screen.getByLabelText(/Senha/), {
      target: { value: "segredo" },
    });
    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email ou senha inválida",
    );
    expect(loginMock).toHaveBeenCalledWith({
      email: "curadoria@cciao.org",
      password: "segredo",
      origin: "web",
    });
  });

  it("entra e redireciona para o painel da curadoria", async () => {
    loginMock.mockResolvedValue({
      data: {
        status: true,
        data: {
          user: {
            id: "1",
            email: "curadoria@cciao.org",
            fullname: "Ana Curadora",
            role: "admin",
          },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={["/entrar"]}>
        <AuthProvider>
          <Routes>
            <Route path="/entrar" element={<Login />} />
            <Route path="/admin" element={<div>painel da curadoria</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: "curadoria@cciao.org" },
    });
    fireEvent.change(screen.getByLabelText(/Senha/), {
      target: { value: "segredo" },
    });
    submit();

    expect(await screen.findByText("painel da curadoria")).toBeInTheDocument();
    // Sessão por cookie: nada de token no localStorage.
    expect(localStorage.getItem("SESSION_TOKEN")).toBeNull();
  });

  it("alterna a visibilidade da senha", () => {
    renderPage();
    const password = screen.getByLabelText(/Senha/);

    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(password).toHaveAttribute("type", "password");
  });
});
