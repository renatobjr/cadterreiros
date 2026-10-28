import { Ban, Check, Info, Pencil } from "lucide-react";

export type AdminActionKind = "approve" | "reject" | "corrections" | "edit";

const ICONS = {
  approve: Check,
  reject: Ban,
  corrections: Info,
  edit: Pencil,
} as const;

/**
 * Ícones das ações da curadoria — Lucide (ISC), 16px e traço 1.9 para casar
 * com o peso dos ícones do projeto. Decorativos: o nome vem do `aria-label`
 * do botão.
 */
export function AdminActionIcon({ kind }: { kind: AdminActionKind }) {
  const Icon = ICONS[kind];

  return <Icon size={16} strokeWidth={1.9} aria-hidden="true" focusable="false" />;
}

export default AdminActionIcon;
