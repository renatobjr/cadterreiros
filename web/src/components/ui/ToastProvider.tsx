import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toastContext";

const TOAST_DURATION_MS = 4000;

/**
 * Aviso flutuante global (mock: `#toast`). Fica acima do roteador, então a
 * mensagem sobrevive à navegação — útil depois de salvar um cadastro.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const show = useCallback((next: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setMessage(next);
    timerRef.current = window.setTimeout(() => {
      setMessage("");
      timerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="toast"
        role="status"
        aria-live="polite"
        hidden={!message}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
