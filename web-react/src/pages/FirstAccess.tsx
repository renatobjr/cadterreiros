import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { authApi } from "../api/auth";

const STEPS = ["E-mail", "Código", "Senha"] as const;

interface GenerateUserTokenResponse {
  status?: boolean;
  data?: unknown;
}

export function FirstAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Informe o e-mail de cadastro.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = (await authApi.generateUserToken(
        value,
        false,
      )) as GenerateUserTokenResponse;

      if (response?.status === false) {
        setError(
          "Não foi possível iniciar o primeiro acesso. Verifique o e-mail informado.",
        );
        return;
      }

      navigate(`/otp/${String(response?.data)}/${encodeURIComponent(value)}`, {
        state: { isFromForget: false },
      });
    } catch {
      setError("Não foi possível iniciar o primeiro acesso. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="authwrap">
      <div className="auth">
        <div className="auth__box">
          <h1>Primeiro acesso</h1>
          <p>
            Informe o e-mail de cadastro para iniciar a configuração da sua
            senha.
          </p>

          <ol className="steps" aria-label="Etapas do primeiro acesso">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="step"
                aria-current={index === 0 ? "step" : undefined}
              >
                <span className="step__num">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmit} noValidate>
            <TextInput
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
            />
            {error && (
              <p className="auth__err" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              loading={submitting}
              disabled={!email.trim()}
            >
              Continuar
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default FirstAccess;
