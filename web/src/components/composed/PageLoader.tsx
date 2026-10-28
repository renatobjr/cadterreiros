import cadLogo from "../../assets/img/logos/cad.logo.svg";

export interface PageLoaderProps {
  /** Texto para leitores de tela (o spinner é visual). */
  label?: string;
  /** Versão menor, para carregamentos dentro de uma seção. */
  compact?: boolean;
  className?: string;
}

/**
 * Estado de carregamento da aplicação: marca da Casa de Cultura + spinner.
 *
 * Sem texto visível (o usuário pediu spinner em vez de “Carregando…”); o nome
 * acessível vai por `aria-label`/texto oculto, para leitores de tela.
 * Com `prefers-reduced-motion`, a animação para e a marca fica estática.
 */
export function PageLoader({
  label = "Carregando",
  compact = false,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={["page-loader", compact ? "page-loader--compact" : "", className]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <img className="page-loader__mark" src={cadLogo} alt="" width={56} height={56} />
      <span className="page-loader__spinner" aria-hidden="true" />
      <span className="skip-vis">{label}</span>
    </div>
  );
}

export default PageLoader;
