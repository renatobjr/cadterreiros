import { useCallback, useMemo, useState, type ReactNode } from "react";
import { bootstrapAnalytics } from "./ga";
import {
  readConsent,
  writeConsent,
  type ConsentPreferences,
  type ConsentState,
  type ConsentStorage,
} from "./consent";
import { ConsentContext, type ConsentContextValue } from "./context";

export interface ConsentProviderProps {
  children: ReactNode;
  /** Injeção de storage para testes; o padrão é o `localStorage` do navegador. */
  storage?: ConsentStorage | null;
}

/**
 * Dono da escolha de cookies.
 *
 * O GA é preparado já no primeiro render (com `analytics_storage: denied`),
 * para que o Consent Mode v2 exista antes de qualquer navegação. Se há uma
 * escolha salva com aceite, o `gtag.js` é carregado imediatamente — o
 * `bootstrapAnalytics` é idempotente e não injeta o script duas vezes.
 */
export function ConsentProvider({ children, storage }: ConsentProviderProps) {
  const [consent, setConsent] = useState<ConsentState | null>(() => {
    const stored =
      storage === undefined ? readConsent() : readConsent(storage);
    bootstrapAnalytics(stored?.analytics === true);
    return stored;
  });
  const [bannerOpen, setBannerOpen] = useState(() => consent === null);

  const apply = useCallback(
    (analytics: boolean) => {
      const next =
        storage === undefined
          ? writeConsent({ analytics })
          : writeConsent({ analytics }, storage);
      // Atualiza o módulo do GA antes do render para o page_view da rota
      // atual sair junto com o aceite (efeitos dos filhos rodam primeiro).
      bootstrapAnalytics(next.analytics);
      setConsent(next);
      setBannerOpen(false);
    },
    [storage],
  );

  const acceptAll = useCallback(() => apply(true), [apply]);
  const rejectAll = useCallback(() => apply(false), [apply]);
  const savePreferences = useCallback(
    (preferences: ConsentPreferences) => apply(preferences.analytics),
    [apply],
  );
  const openPreferences = useCallback(() => setBannerOpen(true), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      analyticsEnabled: consent?.analytics === true,
      bannerOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
    }),
    [
      acceptAll,
      bannerOpen,
      consent,
      openPreferences,
      rejectAll,
      savePreferences,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export default ConsentProvider;
