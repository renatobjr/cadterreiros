import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommunityRegister from "../../src/pages/CommunityRegister";
import client from "../../src/api/client";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const postMock = client.post as unknown as ReturnType<typeof vi.fn>;

describe("Fluxo de cadastro voluntário", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue({ id: "PROT-2026-001" });
  });

  it("envia o cadastro e exibe o protocolo retornado pela API", async () => {
    render(<CommunityRegister />);

    expect(screen.queryByText(/protocolo:/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nome do terreiro/i), {
      target: { value: "Terreiro Ilê Axé" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(
      await screen.findByText(/Protocolo:\s*PROT-2026-001/),
    ).toBeInTheDocument();
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith(
      "religious-communities/public/create",
      { religiousSpaceName: "Terreiro Ilê Axé" },
    );
  });

  it("mantém o protocolo oculto e o botão bloqueado durante o envio", async () => {
    let resolveCreate: (value: { id: string }) => void = () => {};
    postMock.mockImplementation(
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    render(<CommunityRegister />);
    fireEvent.change(screen.getByLabelText(/nome do terreiro/i), {
      target: { value: "Casa de Nagô" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cadastrar/i })).toBeDisabled();
    });
    expect(screen.queryByText(/protocolo:/i)).not.toBeInTheDocument();

    act(() => {
      resolveCreate({ id: "PROT-2026-002" });
    });

    expect(
      await screen.findByText(/Protocolo:\s*PROT-2026-002/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cadastrar/i })).not.toBeDisabled();
  });
});
