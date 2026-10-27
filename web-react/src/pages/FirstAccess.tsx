import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../features/auth/components/AuthShell";
import AuthSteps from "../features/auth/components/AuthSteps";
import { authApi } from "../api/auth";
import { isRefusal, readEnvelope } from "../api/envelope";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Primeiro acesso da curadoria (mock: `renderAuthRecovery` com contexto
 * `first`): a pessoa informa o e-mail de cadastro e recebe um código para
 * criar a senha.
 */
export function FirstAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!value) {
      setFieldError("Informe o e-mail de cadastro.");
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setFieldError("Informe um e-mail válido.");
      return;
    }

    setFieldError("");
    setError("");
    setSubmitting(true);
    try {
      const response = await authApi.generateUserToken(value, false);
      const envelope = readEnvelope<string>(response);

      // Mesma resposta para e-mail cadastrado ou não — evita enumeração.
      if (isRefusal(envelope)) {
        setError(
          "Não foi possível iniciar o primeiro acesso agora. Tente novamente em instantes.",
        );
        return;
      }

      navigate(`/otp/${String(envelope?.data)}/${encodeURIComponent(value)}`, {
        state: { isFromForget: false },
      });
    } catch {
      setError(
        "Não foi possível iniciar o primeiro acesso agora. Tente novamente em instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow">Primeiro acesso</p>
      <h1 className="display-2">Configurar acesso</h1>
      <p className="lede">
        Informe o e-mail de cadastro para receber um código de verificação e
        criar sua senha.
      </p>

      <AuthSteps current={1} />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-alert" role="alert">
            {error}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="auth-recovery-email">
            E-mail{" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </label>
          <input
            className="input"
            id="auth-recovery-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldError("");
            }}
            autoComplete="email"
            aria-required="true"
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={
              fieldError ? "auth-recovery-email-error" : undefined
            }
            disabled={submitting}
          />
          {fieldError ? (
            <p className="field__error" id="auth-recovery-email-error">
              {fieldError}
            </p>
          ) : null}
        </div>

        <button
          className="btn btn--primary auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Enviando…" : "Continuar"}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/entrar">Voltar ao login</Link>
      </div>
    </AuthShell>
  );
}

export default FirstAccess;
