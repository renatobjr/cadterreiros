import { createContext, useContext } from "react";
import type { ConsentPreferences, ConsentState } from "./consent";

export interface ConsentContextValue {
  /** Escolha salva; `null` enquanto o visitante não decidiu. */
  consent: ConsentState | null;
  analyticsEnabled: boolean;
  /** Banner visível (primeira visita ou reabertura pelo rodapé). */
  bannerOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
  openPreferences: () => void;
}

export const ConsentContext = createContext<ConsentContextValue | null>(null);

/**
 * Hook de consentimento — fora do provider para o Fast Refresh continuar
 * funcionando neste módulo (só exporta o hook, não um componente).
 */
export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);

  if (context === null) {
    throw new Error("useConsent deve ser usado dentro de ConsentProvider");
  }

  return context;
}
