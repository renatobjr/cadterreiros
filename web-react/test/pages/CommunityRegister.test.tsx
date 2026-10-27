import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

describe("CommunityRegister", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza", () => {
    render(<CommunityRegister />);
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("submit chama /public/create", async () => {
    (client.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proto-1" });
    render(<CommunityRegister />);
    fireEvent.change(screen.getByLabelText(/nome do terreiro/i), { target: { value: "Terreiro X" } });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));
    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith(
        "religious-communities/public/create",
        expect.objectContaining({ religiousSpaceName: "Terreiro X" })
      );
    });
  });
});
