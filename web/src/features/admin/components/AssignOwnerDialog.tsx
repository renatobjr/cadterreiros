import { useEffect, useRef, useState } from "react";
import PageLoader from "../../../components/composed/PageLoader";
import { assignOwner, listUsers } from "../../../api/admin";
import type { AdminUser } from "../../../domain/types";

/* jsdom (e navegadores antigos) não implementa `showModal`; o atributo
   `open` mantém o diálogo utilizável e testável. */
function openDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

export interface AssignOwnerTarget {
  id: string;
  name: string;
}

export interface AssignOwnerDialogProps {
  community: AssignOwnerTarget | null;
  onClose: () => void;
  /** Chamado depois do sucesso, para a ficha recarregar o responsável. */
  onAssigned: () => void | Promise<void>;
}

/**
 * Atribuição do recenseador responsável (mock: `CadSetOwnerDialog`).
 *
 * Lista apenas pessoas ativas da equipe — atribuir a alguém desativado daria
 * acesso a um cadastro que essa pessoa não pode abrir. A opção “manter o
 * status” evita devolver um registro já aprovado para a fila.
 */
export function AssignOwnerDialog({
  community,
  onClose,
  onAssigned,
}: AssignOwnerDialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userId, setUserId] = useState("");
  const [keepStatus, setKeepStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (!community) {
      if (dialog.open) closeDialog(dialog);
      return;
    }

    if (!dialog.open) openDialog(dialog);
    setUserId("");
    setKeepStatus(false);
    setError("");
    setLoading(true);

    let active = true;
    listUsers()
      .then((data) => {
        if (active) setUsers(data.filter((user) => user.isEnabled));
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar a equipe.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [community]);

  if (!community) return null;

  const communityId = community.id;
  const options = users
    .slice()
    .sort((a, b) => a.fullname.localeCompare(b.fullname, "pt-BR"))
    .map((user) => ({ value: user.id, label: user.fullname }));

  async function confirm() {
    if (!userId) {
      setError("Selecione um recenseador.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const ok = await assignOwner(communityId, userId, keepStatus);
      if (!ok) {
        setError("Não foi possível atribuir. Tente novamente.");
        return;
      }
      await onAssigned();
      onClose();
    } catch {
      setError("Não foi possível atribuir. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      className="admin-dialog"
      ref={ref}
      aria-labelledby="assign-owner-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="admin-dialog__head">
        <div>
          <p className="eyebrow">Curadoria</p>
          <h2 id="assign-owner-title">Atribuir recenseador</h2>
        </div>
        <button
          className="admin-dialog__close"
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>

      <div className="admin-dialog__body">
        <p className="admin-dialog__text">{community.name}</p>
        <p className="admin-dialog__text">
          A pessoa escolhida passa a ver e editar este cadastro. Por padrão, o
          registro volta para a fila de aprovação.
        </p>

        {loading ? (
          <PageLoader compact label="Carregando equipe" />
        ) : (
          <>
            <div className="field">
              {/* Select nativo de propósito: a lista do componente custom é
                  posicionada e ficaria cortada pelo corpo rolável do diálogo. */}
              <label htmlFor="assign-owner-user">Recenseador</label>
              <select
                id="assign-owner-user"
                className="select"
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  setError("");
                }}
                disabled={busy}
              >
                <option value="">Selecione a pessoa</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="check" htmlFor="assign-owner-keep">
              <input
                id="assign-owner-keep"
                type="checkbox"
                checked={keepStatus}
                onChange={(event) => setKeepStatus(event.target.checked)}
                disabled={busy}
              />
              Manter o status atual do cadastro
            </label>
          </>
        )}

        {error ? (
          <p className="field__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="admin-dialog__actions">
        <button className="btn btn--ghost" type="button" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn--primary"
          type="button"
          disabled={busy || loading || !userId}
          onClick={() => void confirm()}
        >
          {busy ? "Atribuindo…" : "Atribuir"}
        </button>
      </div>
    </dialog>
  );
}

export default AssignOwnerDialog;
