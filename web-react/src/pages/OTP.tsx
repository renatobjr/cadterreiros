import { useState } from "react";
import { useParams } from "react-router-dom";
import { authApi } from "../api/auth";

export function OTP() {
  const { token, email } = useParams<{ token: string; email: string }>();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await authApi.verifyOtp(token, code);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="authwrap">
      <div className="auth">
        <div className="auth__box">
          <h1>Verifique seu email</h1>
          <p>Enviamos para o email {email} o código de verificação.</p>
          <form onSubmit={handleSubmit}>
            <input
              className="auth__code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Código OTP"
            />
            <button type="submit" disabled={submitting || code.length < 6}>
              Verificar Código
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default OTP;