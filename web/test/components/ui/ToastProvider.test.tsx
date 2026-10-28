import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ToastProvider from "../../../src/components/ui/ToastProvider";
import { useToast } from "../../../src/components/ui/toastContext";

function Trigger({ message }: { message: string }) {
  const { show } = useToast();
  return (
    <button type="button" onClick={() => show(message)}>
      disparar
    </button>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra a mensagem e some depois de alguns segundos", () => {
    render(
      <ToastProvider>
        <Trigger message="Cadastro salvo e aguardando na fila para aprovação." />
      </ToastProvider>,
    );

    const toast = document.querySelector(".toast") as HTMLElement;
    expect(toast.hidden).toBe(true);

    act(() => {
      screen.getByRole("button", { name: "disparar" }).click();
    });

    expect(toast.hidden).toBe(false);
    expect(toast).toHaveTextContent(
      "Cadastro salvo e aguardando na fila para aprovação.",
    );
    expect(toast).toHaveAttribute("role", "status");

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(toast.hidden).toBe(true);
  });
});
