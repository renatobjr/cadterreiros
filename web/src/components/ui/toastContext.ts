import { createContext, useContext } from "react";

export interface ToastContextValue {
  /** Exibe uma mensagem flutuante por alguns segundos. */
  show: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
}
