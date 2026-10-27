import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FirstAccess from "../../src/pages/FirstAccess";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("FirstAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza o formulário de primeiro acesso", () => {
    render(
      <MemoryRouter>
        <FirstAccess />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /primeiro acesso/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: /etapas do primeiro acesso/i }),
    ).toBeInTheDocument();
  });

  it("submit solicita o token de primeiro acesso", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: true,
      data: "tok",
    });
    render(
      <MemoryRouter>
        <FirstAccess />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(client.get).toHaveBeenCalledWith(
        "auth/generate-user-token/a@b.com/false",
      );
    });
  });

  it("exibe erro quando a API falha", async () => {
    (client.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("falha de rede"),
    );
    render(
      <MemoryRouter>
        <FirstAccess />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /não foi possível iniciar o primeiro acesso/i,
    );
  });
});
