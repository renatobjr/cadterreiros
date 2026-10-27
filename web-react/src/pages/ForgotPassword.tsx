import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../features/auth/components/AuthShell";
import AuthSteps from "../features/auth/components/AuthSteps";
import { authApi } from "../api/auth";
import { isRefusal, readEnvelope } from "../api/envelope";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Recuperação de senha (mock: `renderAuthRecovery`, contexto `forget`). */
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!value) {
      setFieldError("Informe o e-mail cadastrado.");
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
      const response = await authApi.generateUserToken(value, true);
      const envelope = readEnvelope<string>(response);

      // A API responde igual para e-mail cadastrado ou não (proteção contra
      // enumeração de usuários): só falhas de servidor/rede interrompem o fluxo.
      if (isRefusal(envelope)) {
        setError(
          "Não foi possível enviar o código agora. Tente novamente em instantes.",
        );
        return;
      }

      navigate(`/otp/${String(envelope?.data)}/${encodeURIComponent(value)}`, {
        state: { isFromForget: true },
      });
    } catch {
      setError(
        "Não foi possível enviar o código agora. Tente novamente em instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow">Recuperação</p>
      <h1 className="display-2">Recuperar senha</h1>
      <p className="lede">
        Informe seu e-mail para receber um código de verificação e criar uma
        nova senha.
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
          {submitting ? "Enviando…" : "Enviar código"}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/entrar">Voltar ao login</Link>
      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
