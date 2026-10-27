import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { authApi } from "../api/auth";

interface GenerateUserTokenResponse {
  status?: boolean;
  data?: unknown;
}

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Informe o e-mail cadastrado.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = (await authApi.generateUserToken(
        value,
        true,
      )) as GenerateUserTokenResponse;

      if (response?.status === false) {
        setError(
          "Não foi possível enviar o e-mail de recuperação. Verifique o e-mail informado.",
        );
        return;
      }

      navigate(`/otp/${String(response?.data)}/${encodeURIComponent(value)}`, {
        state: { isFromForget: true },
      });
    } catch {
      setError("Não foi possível enviar o e-mail de recuperação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="authwrap">
      <div className="auth">
        <div className="auth__box">
          <h1>Recuperar senha</h1>
          <p>
            Informe o e-mail cadastrado para iniciar o processo de recuperação
            da senha.
          </p>

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
            <Button type="submit" loading={submitting} disabled={!email.trim()}>
              Recuperar senha
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
