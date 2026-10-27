import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AuthShell from "../features/auth/components/AuthShell";
import AuthSteps from "../features/auth/components/AuthSteps";
import { authApi } from "../api/auth";
import { isRefusal, readEnvelope } from "../api/envelope";

interface OtpLocationState {
  /** `false` quando o fluxo começou no primeiro acesso. */
  isFromForget?: boolean;
}

const CODE_LENGTH = 6;

/**
 * Verificação do código de seis dígitos (mock: `renderAuthOtp`).
 *
 * A mensagem de erro é sempre a mesma: a API responde igual para e-mail
 * cadastrado ou não, então a tela não pode reintroduzir a diferença.
 */
export function OTP() {
  const { token, email } = useParams<{ token: string; email: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const isFromForget =
    (location.state as OtpLocationState | null)?.isFromForget ?? true;
  const backPath = isFromForget ? "/esqueci-minha-senha" : "/primeiro-acesso";

  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (code.length !== CODE_LENGTH) {
      setFieldError("Informe os seis dígitos do código.");
      return;
    }
    setFieldError("");
    if (!token) {
      setError("Código inválido ou expirado.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.verifyOtp(token, code);
      const envelope = readEnvelope<{ token?: string }>(response);

      if (isRefusal(envelope)) {
        setError("Código inválido ou expirado.");
        return;
      }

      // A API devolve um token novo, de escopo restrito, emitido só depois do
      // código conferido — é ele que pode trocar a senha.
      const resetToken =
        typeof envelope?.data?.token === "string"
          ? envelope.data.token
          : token;

      navigate(`/set-password/${resetToken}`, {
        state: { isFromForget },
      });
    } catch {
      setError("Código inválido ou expirado.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setFieldError("");
    setError("");
    setNotice("");
    setResending(true);
    try {
      const response = await authApi.generateUserToken(email, isFromForget);
      const envelope = readEnvelope<string>(response);

      if (isRefusal(envelope) || typeof envelope?.data !== "string") {
        setError(
          "Não foi possível reenviar o código agora. Tente novamente em instantes.",
        );
        return;
      }

      setNotice("Enviamos um novo código.");
      navigate(`/otp/${envelope.data}/${encodeURIComponent(email)}`, {
        replace: true,
        state: { isFromForget },
      });
    } catch {
      setError(
        "Não foi possível reenviar o código agora. Tente novamente em instantes.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow">Verificação</p>
      <h1 className="display-2">Confira seu e-mail</h1>
      <p className="lede">
        Enviamos um código de seis dígitos para <strong>{email}</strong>.
      </p>

      <AuthSteps current={2} />

      {notice ? (
        <p className="auth-success" role="status">
          {notice}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-alert" role="alert">
            {error}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="auth-code">
            Código de verificação{" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </label>
          <p className="field__hint" id="auth-code-hint">
            Seis dígitos.
          </p>
          <input
            className="input auth-code"
            id="auth-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            pattern="[0-9]*"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
              setFieldError("");
              setError("");
              setNotice("");
            }}
            aria-describedby={
              fieldError ? "auth-code-error auth-code-hint" : "auth-code-hint"
            }
            aria-required="true"
            aria-invalid={fieldError ? true : undefined}
            disabled={submitting}
          />
          {fieldError ? (
            <p className="field__error" id="auth-code-error">
              {fieldError}
            </p>
          ) : null}
        </div>

        <button
          className="btn btn--primary auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Verificando…" : "Verificar código"}
        </button>
      </form>

      <div className="auth-links">
        <button
          className="btn btn--quiet"
          type="button"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Reenviando…" : "Reenviar código"}
        </button>
        <Link to={backPath}>Voltar e corrigir e-mail</Link>
      </div>
    </AuthShell>
  );
}

export default OTP;
