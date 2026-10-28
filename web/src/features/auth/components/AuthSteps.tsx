export interface AuthStepsProps {
  /** Etapa atual do fluxo de acesso (1 e-mail, 2 código, 3 senha). */
  current: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: "E-mail" },
  { number: 2, label: "Código" },
  { number: 3, label: "Senha" },
] as const;

/** Trilha de etapas do acesso (mock: `authSteps`). */
export function AuthSteps({ current }: AuthStepsProps) {
  return (
    <ol className="auth-steps" aria-label="Etapas do acesso">
      {STEPS.map((step) => {
        const className = [
          "auth-step",
          step.number === current
            ? "is-active"
            : step.number < current
              ? "is-done"
              : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li
            key={step.number}
            className={className}
            aria-current={step.number === current ? "step" : undefined}
          >
            <span className="auth-step__num">0{step.number}</span>
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default AuthSteps;
