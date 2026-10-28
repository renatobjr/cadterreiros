import { useState } from "react";
import { useConsent } from "../../features/analytics/context";

/**
 * Banner de consentimento (opção B do GA4).
 *
 * Bloqueia qualquer terceiro até a decisão: aceitar libera o Google Analytics,
 * rejeitar mantém só os cookies essenciais (sessão do painel) e personalizar
 * permite escolher apenas o que se quer. A escolha fica em `localStorage` e
 * pode ser revista pelo rodapé.
 */
export function CookieBanner() {
  const { bannerOpen } = useConsent();

  if (!bannerOpen) return null;

  return <CookiePanel />;
}

/**
 * Conteúdo do banner. Só existe enquanto ele está aberto, para que ao reabrir
 * as preferências o formulário nasça do consentimento salvo — e não do
 * rascunho da visita anterior.
 */
function CookiePanel() {
  const { consent, acceptAll, rejectAll, savePreferences } = useConsent();
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? true);

  return (
    <aside
      className="cookie"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
    >
      <div className="shell cookie__in">
        <div className="cookie__text">
          <h2 className="cookie__title" id="cookie-title">
            Cookies e privacidade
          </h2>
          <p id="cookie-text">
            Usamos cookies essenciais para o site funcionar. Com a sua permissão,
            também medimos a navegação com o Google Analytics para melhorar o
            acervo. Nenhum dado pessoal do censo é enviado.
          </p>
        </div>

        {customizing ? (
          <div className="cookie__prefs">
            <label className="cookie__check">
              <input type="checkbox" checked readOnly disabled />
              <span>
                Essenciais <span className="cookie__tag">sempre ativos</span>
              </span>
            </label>
            <label className="cookie__check">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>Análises (Google Analytics)</span>
            </label>
            <div className="cookie__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => savePreferences({ analytics })}
              >
                Salvar preferências
              </button>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => setCustomizing(false)}
              >
                Voltar
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie__actions">
            <button type="button" className="btn btn--primary" onClick={acceptAll}>
              Aceitar
            </button>
            <button type="button" className="btn btn--ghost" onClick={rejectAll}>
              Rejeitar
            </button>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => setCustomizing(true)}
            >
              Personalizar
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default CookieBanner;
