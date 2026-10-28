const COLOR_TOKENS = [
  { token: "--accent", description: "Cor de ação e destaque" },
  { token: "--accent-deep", description: "Fundos institucionais escuros" },
  { token: "--bg", description: "Fundo padrão das páginas" },
  { token: "--surface", description: "Superfícies de cartões e blocos" },
  { token: "--fg", description: "Texto principal" },
  { token: "--muted", description: "Texto secundário e meta" },
  { token: "--border", description: "Fios e contornos" },
  { token: "--gold", description: "Detalhes e ênfases editoriais" },
  { token: "--ok", description: "Estados de sucesso" },
  { token: "--danger", description: "Estados de erro" },
] as const;

const TYPE_STEPS = [
  { token: "--type-display-1", className: "ds--display-1", sample: "Terreiros de matriz africana" },
  { token: "--type-display-2", className: "ds--display-2", sample: "Memória e território" },
  { token: "--type-display-3", className: "ds--display-3", sample: "Comunidades tradicionais" },
  { token: "--type-lede", className: "ds--lede", sample: "Texto de abertura que situa a página." },
  { token: "--type-body", className: "ds--body", sample: "Texto corrido usado na leitura dos artigos." },
  { token: "--type-meta", className: "ds--meta", sample: "METADADOS · LEITURA DE 5 MIN" },
  { token: "--type-eyebrow", className: "ds--eyebrow", sample: "Categoria" },
] as const;

const SPACE_STEPS = ["--s2", "--s3", "--s4", "--s5", "--s6", "--s7"] as const;

/** Referência interna dos tokens visuais usados nas telas públicas. */
export function DesignSystem() {
  return (
    <main>
      <header className="page-head ds-hero">
        <div className="shell">
          <p className="eyebrow">Referência interna</p>
          <h1 className="display-1">Design system</h1>
          <p className="lede">
            Tokens de cor, tipografia e espaço que sustentam as telas do
            Cadterreiros. Página de consulta, fora do menu principal.
          </p>
        </div>
      </header>

      <div className="shell page-body">
        <section aria-labelledby="ds-principios">
          <h2 id="ds-principios">Princípios</h2>
          <ol className="dsprinc">
            <li>
              <strong>Fio de 1px, sem sombra.</strong>
              Profundidade vem da hierarquia e do contraste, não de efeitos.
            </li>
            <li>
              <strong>Grade de 8px.</strong>
              Espaçamento e tamanhos derivam dos passos de espaço.
            </li>
            <li>
              <strong>Cor só em oklch().</strong>
              Nenhum hex é escrito no código; os tokens são a fonte única.
            </li>
            <li>
              <strong>Contraste AA.</strong>
              Todo par de texto e fundo é verificado antes de entrar na tela.
            </li>
          </ol>
        </section>

        <section aria-labelledby="ds-tipografia">
          <h2 id="ds-tipografia">Escala tipográfica</h2>
          <div className="dssteps">
            {TYPE_STEPS.map((step) => (
              <div className="dstep" key={step.token}>
                <p className={`dstep__sample ${step.className}`}>{step.sample}</p>
                <p className="dstep__meta">
                  <code>{step.token}</code>
                  <span>{step.className}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="ds-cores">
          <h2 id="ds-cores">Cores</h2>
          <div className="dsgrid">
            {COLOR_TOKENS.map((color) => (
              <div className="dsw" key={color.token}>
                <span
                  className="dsw__chip"
                  style={{ background: `var(${color.token})` }}
                  aria-hidden="true"
                />
                <span className="dsw__meta">
                  <span className="dsw__name">{color.token}</span>
                  <span className="dsw__desc">{color.description}</span>
                  <span className="dsw__val">{`var(${color.token})`}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="ds-espaco">
          <h2 id="ds-espaco">Espaço</h2>
          <div className="dsspace">
            {SPACE_STEPS.map((token) => (
              <div className="dsspace__row" key={token}>
                <code>{token}</code>
                <span
                  className="dsspace__bar"
                  style={{ width: `var(${token})` }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default DesignSystem;
