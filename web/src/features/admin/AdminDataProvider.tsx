import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { listAllCommunities } from "../../api/admin";
import type { ReligiousCommunity } from "../../domain/types";
import { AdminDataContext, type AdminDataValue } from "./adminDataContext";

/**
 * Carrega uma única vez a lista administrativa (todos os estágios) e a
 * compartilha entre shell, visão geral e listagem.
 */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ReligiousCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    listAllCommunities()
      .then((data) => {
        if (active) setRecords(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const counts = useMemo(() => {
    const pending = records.filter((item) => item.censusStep === "pending").length;
    const approved = records.filter((item) => item.censusStep === "approved").length;
    const rejected = records.filter((item) => item.censusStep === "rejected").length;
    const volunteers = records.filter((item) => item.registeredVoluntarily).length;

    return { pending, approved, rejected, total: records.length, volunteers };
  }, [records]);

  const value = useMemo<AdminDataValue>(
    () => ({ records, loading, error, reload, counts }),
    [records, loading, error, reload, counts],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export default AdminDataProvider;
