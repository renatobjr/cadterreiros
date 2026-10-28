import { useState } from "react";

export interface AuthPasswordFieldProps {
  /** id do input (também vira prefixo dos ids de hint/erro). */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Campo de senha do fluxo de acesso (mock: `authPasswordField`):
 * label com marcador de obrigatório, hint opcional, botão Mostrar/Ocultar
 * e mensagem de erro ligada por `aria-describedby`.
 */
export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  autoComplete = "new-password",
  required = true,
  disabled,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            {" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div className="auth-password">
        <input
          className="input"
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          disabled={disabled}
        />
        <button
          className="auth-show"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-controls={id}
          aria-pressed={visible}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default AuthPasswordField;
