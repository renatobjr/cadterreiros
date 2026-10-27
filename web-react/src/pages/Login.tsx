import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../features/auth/components/AuthShell";
import { useAuth } from "../features/auth/context";
import { readEnvelope } from "../api/envelope";

interface LoginErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Extrai a mensagem de recusa do envelope da API (`status: false`). */
function apiRefusal(response: unknown): string | null {
  const envelope = readEnvelope(response);
  if (envelope?.status !== false) return null;
  const error = envelope.error;
  if (typeof error === "string" && error.trim()) return error;
  return "Não foi possível entrar. Verifique os dados e tente novamente.";
}

function validate(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!email.trim()) {
    errors.email = "Informe o e-mail.";
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!password) {
    errors.password = "Informe a senha.";
  }
  return errors;
}

/** Tela de acesso da curadoria, fiel ao mock (`renderAuthLogin`). */
export function Login() {
  const { login, isAuth, user, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError("");
    setSubmitting(true);
    try {
      const response = await login({
        email: email.trim(),
        password,
        origin: "web",
      });
      const refusal = apiRefusal(response);
      if (refusal) {
        setError(refusal);
        return;
      }
      // O painel da curadoria ainda não tem rota pública própria; a sessão
      // fica registrada e o aviso confirma o acesso.
      setPassword("");
    } catch {
      setError(
        "Não foi possível entrar agora. Verifique a conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuth) {
    return (
      <AuthShell>
        <p className="eyebrow">Curadoria</p>
        <h1 className="display-2">Acesso liberado</h1>
        <p className="lede">
          Sessão iniciada como{" "}
          <strong>{user?.fullname ?? user?.email ?? "curadoria"}</strong>.
        </p>

        <div className="auth-links">
          <Link to="/">Ir para o site</Link>
          <button className="btn btn--quiet" type="button" onClick={logout}>
            Sair
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <p className="eyebrow">Curadoria</p>
      <h1 className="display-2">Entrar no painel</h1>
      <p className="lede">
        Acesso restrito à equipe de curadoria e aos recenseadores.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-alert" role="alert">
            {error}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="auth-login-email">
            E-mail{" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </label>
          <input
            className="input"
            id="auth-login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((previous) => ({ ...previous, email: undefined }));
            }}
            autoComplete="email"
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              errors.email ? "auth-login-email-error" : undefined
            }
            disabled={submitting}
          />
          {errors.email ? (
            <p className="field__error" id="auth-login-email-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="auth-login-password">
            Senha{" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </label>
          <div className="auth-password">
            <input
              className="input"
              id="auth-login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((previous) => ({ ...previous, password: undefined }));
              }}
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={
                errors.password ? "auth-login-password-error" : undefined
              }
              disabled={submitting}
            />
            <button
              className="auth-show"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-controls="auth-login-password"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {errors.password ? (
            <p className="field__error" id="auth-login-password-error">
              {errors.password}
            </p>
          ) : null}
        </div>

        <button
          className="btn btn--primary auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/esqueci-minha-senha">Esqueci minha senha</Link>
        <Link to="/primeiro-acesso">Primeiro acesso</Link>
      </div>
    </AuthShell>
  );
}

export default Login;
