import { createContext, useContext } from "react";
import type { ReligiousCommunity } from "../../domain/types";

export interface AdminCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  volunteers: number;
}

export interface AdminDataValue {
  records: ReligiousCommunity[];
  loading: boolean;
  error: boolean;
  reload: () => void;
  counts: AdminCounts;
}

export const AdminDataContext = createContext<AdminDataValue | null>(null);

/** Dados do painel (lista completa + contadores) compartilhados entre telas. */
export function useAdminData(): AdminDataValue {
  const context = useContext(AdminDataContext);
  if (context === null) {
    throw new Error("useAdminData deve ser usado dentro de AdminDataProvider");
  }
  return context;
}
