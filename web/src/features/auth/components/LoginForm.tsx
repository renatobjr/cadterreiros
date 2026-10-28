import React, { useState } from "react";
import TextInput from "../../../components/ui/TextInput";
import { authApi, type LoginPayload } from "../../../api/auth";

export interface LoginFormProps {
  onSubmit?: (payload: LoginPayload) => void;
  onSuccess?: (response: unknown) => void;
}

export function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LoginPayload = { email, password };
    onSubmit?.(payload);
    setSubmitting(true);
    try {
      const res = await authApi.login(payload);
      onSuccess?.(res);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <TextInput
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextInput
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="form__actions form__full">
        <button type="submit" disabled={submitting}>
          Entrar
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
