import { useEffect, useRef, useState } from "react";

export type DecisionAction = "reject" | "corrections";

export interface DecisionTarget {
  id: string;
  name: string;
}

interface DecisionDialogProps {
  record: DecisionTarget | null;
  action: DecisionAction;
  onClose: () => void;
  onConfirm: (record: DecisionTarget, action: DecisionAction, reason: string) => Promise<void>;
}

/**
 * Diálogo de decisão da curadoria (mock: `openAdminDialog`): pede o motivo
 * antes de rejeitar ou solicitar correções.
 */
export function DecisionDialog({
  record,
  action,
  onClose,
  onConfirm,
}: DecisionDialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (record) {
      if (!dialog.open) dialog.showModal?.();
      setReason("");
      setError("");
    } else if (dialog.open) {
      dialog.close();
    }
  }, [record]);

  if (!record) return null;

  const title = action === "reject" ? "Rejeitar cadastro" : "Solicitar correções";

  return (
    <dialog
      className="admin-dialog"
      ref={ref}
      aria-labelledby="admin-dialog-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="admin-dialog__head">
        <div>
          <p className="eyebrow">Curadoria</p>
          <h2 id="admin-dialog-title">{title}</h2>
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
        <p className="admin-dialog__text">{record.name}</p>
        <div className="field">
          <label htmlFor="decision-reason">Motivo</label>
          <textarea
            id="decision-reason"
            className="input"
            rows={4}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
          />
          {error ? (
            <p className="field__error">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="admin-dialog__actions">
        <button className="btn btn--ghost" type="button" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn--primary"
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!reason.trim()) {
              setError("Descreva o motivo para continuar.");
              return;
            }
            setBusy(true);
            try {
              await onConfirm(record, action, reason.trim());
              onClose();
            } catch {
              setError("Não foi possível concluir. Tente novamente.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Enviando…" : "Confirmar"}
        </button>
      </div>
    </dialog>
  );
}

export default DecisionDialog;
