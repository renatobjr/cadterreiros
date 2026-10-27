import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../../src/pages/ForgotPassword";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("ForgotPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza o formulário de recuperação de senha", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /recuperar senha/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /recuperar senha/i }),
    ).toBeInTheDocument();
  });

  it("submit solicita o token de recuperação de senha", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: true,
      data: "tok",
    });
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /recuperar senha/i }));

    await waitFor(() => {
      expect(client.get).toHaveBeenCalledWith(
        "auth/generate-user-token/a@b.com/true",
      );
    });
  });

  it("exibe erro quando a API falha", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("falha de rede"),
    );
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /recuperar senha/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /não foi possível enviar/i,
    );
  });
});
