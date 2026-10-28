import { useEffect, useState } from "react";
import Select from "../../components/ui/Select";
import PageLoader from "../../components/composed/PageLoader";
import {
  addUser,
  changeUserRole,
  listUsers,
  setUserStatus,
} from "../../api/admin";
import { useAuth } from "../../features/auth/context";
import { formatDate } from "../../features/communities/format";
import type { AdminUser } from "../../domain/types";

const ROLES = [
  { value: "admin", label: "Administrador (curador)" },
  { value: "census_taker", label: "Recenseador" },
];

type StatusTab = "active" | "inactive";

/** Gestão de usuários (mock: `renderAdminUsers`). */
export function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<StatusTab>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("census_taker");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setUsers(await listUsers());
    } catch {
      setError("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    void load();
  }, [isAdmin]);

  const activeCount = users.filter((item) => item.isEnabled).length;
  const inactiveCount = users.length - activeCount;
  const visibleUsers = users.filter((item) =>
    tab === "active" ? item.isEnabled : !item.isEnabled,
  );

  async function handleRole(id: string, nextRole: string) {
    setBusy(id);
    try {
      await changeUserRole(id, nextRole);
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleStatus(target: AdminUser) {
    setBusy(target.id);
    try {
      await setUserStatus(target.id, !target.isEnabled);
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleCreate() {
    if (!fullname.trim() || !email.trim()) return;
    setBusy("new");
    try {
      await addUser({
        fullname: fullname.trim(),
        email: email.trim(),
        role,
      });
      setFullname("");
      setEmail("");
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="admin-empty admin-empty--page">
        <p>Área restrita à equipe de curadoria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-head">
        <div className="admin-page-head__text">
          <p className="eyebrow">Usuários</p>
          <h1 className="display-1">Equipe da curadoria</h1>
          <p className="lede">
            Perfis com acesso ao painel, papéis e situação de cada pessoa.
          </p>
          <div className="admin-page-head__meta">
            <span>{users.length} perfis</span>
            <span>{users.filter((item) => item.isEnabled).length} ativos</span>
          </div>
        </div>
      </div>

      {error ? (
        <p className="auth-alert" role="alert">
          {error}
        </p>
      ) : null}

      <div className="tabs admin-tabs" role="tablist" aria-label="Situação dos usuários">
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === "active"}
          onClick={() => setTab("active")}
        >
          Ativos
          <span className="admin-tab__count">{activeCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === "inactive"}
          onClick={() => setTab("inactive")}
        >
          Desativados
          <span className="admin-tab__count">{inactiveCount}</span>
        </button>
      </div>

      <div className="tablewrap admin-tablewrap">
        <table className="data admin-table admin-users-table">
          <thead>
            <tr>
              <th scope="col">Pessoa</th>
              <th scope="col">Papel</th>
              <th scope="col">Situação</th>
              <th scope="col">Último acesso</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <PageLoader compact label="Carregando usuários" />
                </td>
              </tr>
            ) : visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  {tab === "active"
                    ? "Nenhum usuário ativo."
                    : "Nenhum usuário desativado."}
                </td>
              </tr>
            ) : (
              visibleUsers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="admin-name">{item.fullname}</span>
                    <span className="admin-cell-line admin-cell-line--muted">
                      {item.email}
                    </span>
                  </td>
                  <td>
                    <Select
                      id={`role-${item.id}`}
                      value={item.role}
                      onChange={(value) => void handleRole(item.id, value)}
                      options={ROLES}
                      placeholder="Selecione o papel"
                      disabled={busy === item.id}
                    />
                  </td>
                  <td>
                    <span
                      className={`admin-status ${
                        item.isEnabled
                          ? "admin-status--approved"
                          : "admin-status--rejected"
                      }`}
                    >
                      <span className="admin-status__dot" aria-hidden="true" />
                      {item.isEnabled ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td>
                    {item.lastLogin ? formatDate(item.lastLogin) : "não informado"}
                  </td>
                  <td>
                    <button
                      className="admin-action"
                      type="button"
                      disabled={busy === item.id}
                      onClick={() => void handleStatus(item)}
                    >
                      {item.isEnabled ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="admin-panel mt-6">
        <p className="eyebrow">Novo acesso</p>
        <h2 className="display-3">Adicionar pessoa à equipe</h2>
        <div className="admin-edit-grid">
          <div className="field">
            <label htmlFor="user-name">Nome completo</label>
            <input
              id="user-name"
              className="input"
              value={fullname}
              onChange={(event) => setFullname(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="user-email">E-mail</label>
            <input
              id="user-email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="user-role">Papel</label>
            <Select
              id="user-role"
              value={role}
              onChange={setRole}
              options={ROLES}
              placeholder="Selecione o papel"
            />
          </div>
        </div>
        <div className="admin-savebar__actions mt-6">
          <button
            className="btn btn--primary"
            type="button"
            disabled={busy === "new" || !fullname.trim() || !email.trim()}
            onClick={() => void handleCreate()}
          >
            {busy === "new" ? "Enviando…" : "Enviar convite"}
          </button>
        </div>
        <p className="meta mt-6">
          A pessoa recebe um e-mail para definir a senha no primeiro acesso.
        </p>
      </section>
    </>
  );
}

export default AdminUsers;
