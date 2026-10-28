import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginForm from "../../../src/features/auth/components/LoginForm";
import client from "../../../src/api/client";

vi.mock("../../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza campos", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("submit chama API", async () => {
    (client.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ token: "t" });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: "p" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith("auth/login", { email: "a@b.com", password: "p" });
    });
  });
});
