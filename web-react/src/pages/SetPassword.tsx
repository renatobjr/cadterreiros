import { useState } from "react";
import { useParams } from "react-router-dom";
import { authApi } from "../api/auth";

export function SetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await authApi.setPassword(token, password, fullname);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="authwrap">
      <div className="auth">
        <div className="auth__box">
          <h1>Definir senha</h1>
          <form onSubmit={handleSubmit}>
            <input
              className="auth__password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Senha"
            />
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              aria-label="Nome completo"
            />
            <button type="submit" disabled={submitting}>
              Definir Senha
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default SetPassword;