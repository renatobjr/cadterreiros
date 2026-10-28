import { useEffect, useState } from "react";
import Select from "../../components/ui/Select";
import PageLoader from "../../components/composed/PageLoader";
import Pagination from "../../components/composed/Pagination";
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

const PAGE_SIZE = 10;

/** Gestão de usuários (mock: `renderAdminUsers`). */
export function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<StatusTab>("active");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
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

  const term = query.trim().toLowerCase();
  const matching = users.filter((item) => {
    const inTab = tab === "active" ? item.isEnabled : !item.isEnabled;
    if (!inTab) return false;
    if (!term) return true;
    return (
      item.fullname.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleUsers = matching.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  async function handleRole(id: string, nextRole: string) {
    setBusy(id);
    setError("");
    try {
      await changeUserRole(id, nextRole);
      await load();
    } catch {
      setError("Não foi possível alterar o papel. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function handleStatus(target: AdminUser) {
    setBusy(target.id);
    setError("");
    try {
      await setUserStatus(target.id, !target.isEnabled);
      await load();
    } catch {
      setError("Não foi possível alterar a situação. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCreate() {
    if (!fullname.trim() || !email.trim()) return;
    setBusy("new");
    setError("");
    try {
      await addUser({
        fullname: fullname.trim(),
        email: email.trim(),
        role,
      });
      setFullname("");
      setEmail("");
      await load();
    } catch {
      setError("Não foi possível enviar o convite. Tente novamente.");
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
          onClick={() => {
            setTab("active");
            setPage(1);
          }}
        >
          Ativos
          <span className="admin-tab__count">{activeCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === "inactive"}
          onClick={() => {
            setTab("inactive");
            setPage(1);
          }}
        >
          Desativados
          <span className="admin-tab__count">{inactiveCount}</span>
        </button>
      </div>

      <div className="admin-users-tools">
        <div className="field">
          <label htmlFor="users-search">Buscar pessoa</label>
          <input
            id="users-search"
            className="input"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Nome ou e-mail"
          />
        </div>
        <p className="meta" aria-live="polite">
          {matching.length === 1 ? "1 perfil" : `${matching.length} perfis`} nesta
          aba
        </p>
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
                  {term
                    ? "Nenhum perfil encontrado para essa busca."
                    : tab === "active"
                      ? "Nenhum usuário ativo."
                      : "Nenhum usuário desativado."}
                </td>
              </tr>
            ) : (
              visibleUsers.map((item) => {
                const isSelf = Boolean(user?.id) && item.id === user?.id;
                return (
                <tr key={item.id}>
                  <td>
                    <span className="admin-name">
                      {item.fullname}
                      {isSelf ? (
                        <span className="admin-you">você</span>
                      ) : null}
                    </span>
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
                      disabled={busy === item.id || isSelf}
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
                      disabled={busy === item.id || isSelf}
                      title={
                        isSelf
                          ? "Você não pode desativar a própria conta"
                          : undefined
                      }
                      onClick={() => void handleStatus(item)}
                    >
                      {item.isEnabled ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      ) : null}

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
