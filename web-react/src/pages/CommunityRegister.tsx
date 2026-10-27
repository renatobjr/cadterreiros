import { useState } from "react";
import client from "../api/client";
import TextInput from "../components/ui/TextInput";

export function CommunityRegister() {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = (await client.post("religious-communities/public/create", {
        religiousSpaceName: name,
      })) as { id?: string } | null;
      setProtocol(res?.id ?? null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="cadastro-form">
      <form className="form" onSubmit={handleSubmit}>
        <TextInput
          label="Nome do terreiro"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="form__actions">
          <button type="submit" disabled={submitting} className="form__full">
            Cadastrar
          </button>
        </div>
      </form>
      {protocol && <p>Protocolo: {protocol}</p>}
    </main>
  );
}

export default CommunityRegister;
