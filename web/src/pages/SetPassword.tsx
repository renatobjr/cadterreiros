import { useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AuthShell from "../features/auth/components/AuthShell";
import AuthSteps from "../features/auth/components/AuthSteps";
import AuthPasswordField from "../features/auth/components/AuthPasswordField";
import { authApi } from "../api/auth";
import { isRefusal, readEnvelope } from "../api/envelope";

interface SetPasswordLocationState {
  /** `false` quando o fluxo começou no primeiro acesso. */
  isFromForget?: boolean;
}

const MIN_PASSWORD = 8;

interface Errors {
  fullname?: string;
  password?: string;
  confirm?: string;
}

const GENERIC_ERROR =
  "Não foi possível salvar a nova senha. Solicite um novo código e tente novamente.";

/**
 * Etapa final do acesso (mock: `renderAuthReset`): define a nova senha — e o
 * nome completo quando o fluxo veio do primeiro acesso.
 */
export function SetPassword() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const isFromForget =
    (location.state as SetPasswordLocationState | null)?.isFromForget ?? true;
  const firstAccess = !isFromForget;

  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (firstAccess && fullname.trim().length < 3) {
      next.fullname = "Informe seu nome completo.";
    }
    if (password.length < MIN_PASSWORD) {
      next.password = `Use pelo menos ${MIN_PASSWORD} caracteres.`;
    }
    if (confirm !== password) {
      next.confirm = "As senhas não conferem.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!token) {
      setError(GENERIC_ERROR);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.setPassword(
        token,
        password,
        firstAccess ? fullname.trim() : "",
      );

      if (isRefusal(readEnvelope(response))) {
        setError(GENERIC_ERROR);
        return;
      }

      setSaved(true);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow">Etapa final</p>
      <h1 className="display-2">
        {firstAccess ? "Concluir primeiro acesso" : "Criar nova senha"}
      </h1>
      <p className="lede">
        {firstAccess
          ? "Defina seu nome e uma senha para concluir o primeiro acesso."
          : "Defina uma nova senha para voltar a acessar o painel."}
      </p>

      <AuthSteps current={3} />

      {saved ? (
        <>
          <p className="auth-success" role="status">
            {firstAccess
              ? "Primeiro acesso concluído. Você já pode entrar no painel."
              : "Senha redefinida. Você já pode entrar com a nova senha."}
          </p>
          <div className="auth-links">
            <Link to="/entrar">Ir para o login</Link>
          </div>
        </>
      ) : (
        <>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error ? (
              <p className="auth-alert" role="alert">
                {error}
              </p>
            ) : null}

            {firstAccess ? (
              <div className="field">
                <label htmlFor="auth-fullname">
                  Nome completo{" "}
                  <span className="req" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  className="input"
                  id="auth-fullname"
                  name="fullname"
                  type="text"
                  value={fullname}
                  onChange={(event) => {
                    setFullname(event.target.value);
                    setErrors((previous) => ({ ...previous, fullname: undefined }));
                  }}
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={errors.fullname ? true : undefined}
                  aria-describedby={
                    errors.fullname ? "auth-fullname-error" : undefined
                  }
                  disabled={submitting}
                />
                {errors.fullname ? (
                  <p className="field__error" id="auth-fullname-error">
                    {errors.fullname}
                  </p>
                ) : null}
              </div>
            ) : null}

            <AuthPasswordField
              id="auth-new-password"
              label="Nova senha"
              hint={`Mínimo de ${MIN_PASSWORD} caracteres.`}
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((previous) => ({ ...previous, password: undefined }));
              }}
              error={errors.password}
              disabled={submitting}
            />

            <AuthPasswordField
              id="auth-confirm-password"
              label="Confirme a nova senha"
              value={confirm}
              onChange={(value) => {
                setConfirm(value);
                setErrors((previous) => ({ ...previous, confirm: undefined }));
              }}
              error={errors.confirm}
              disabled={submitting}
            />

            <button
              className="btn btn--primary auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Salvando…"
                : firstAccess
                  ? "Concluir acesso"
                  : "Salvar nova senha"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/entrar">Voltar ao login</Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}

export default SetPassword;
