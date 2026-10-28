import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import cadWhite from "../../../assets/img/logos/cad.white.svg";
import ArrowIcon from "../../../components/ui/ArrowIcon";
import { useAuth } from "../../auth/context";
import { useAdminData } from "../adminDataContext";

const SECTION_TITLES: Array<[RegExp, string]> = [
  [/^\/admin\/usuarios/, "Usuários"],
  [/^\/admin\/cadastros\/[^/]+\/editar/, "Editar cadastro"],
  [/^\/admin\/cadastros\/[^/]+/, "Cadastro"],
  [/^\/admin\/cadastros/, "Cadastros"],
  [/^\/admin/, "Visão geral"],
];

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Moldura do painel da curadoria (mock: `renderAdmin`), com sidebar, topbar,
 * banner de pendentes e o conteúdo da rota atual.
 */
export function AdminShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { counts } = useAdminData();

  useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => document.body.classList.remove("admin-mode");
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const title = useMemo(
    () =>
      SECTION_TITLES.find(([pattern]) => pattern.test(location.pathname))?.[1] ??
      "Visão geral",
    [location.pathname],
  );

  const displayName = user?.fullname ?? user?.email ?? "Curadoria";

  async function handleExit() {
    await logout();
    navigate("/entrar", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar${open ? " is-open" : ""}`}
        id="admin-sidebar"
        aria-label="Navegação da curadoria"
      >
        <div className="admin-sidebar__brand">
          <img
            className="admin-sidebar__mark"
            src={cadWhite}
            alt=""
            width={48}
            height={48}
          />
          <p className="admin-sidebar__eyebrow">Painel da curadoria</p>
          <p className="admin-sidebar__title">Cadterreiros</p>
          <p className="admin-sidebar__sub">
            Acervo, fila de aprovação e equipe.
          </p>
        </div>

        <nav className="admin-nav" aria-label="Seções do painel">
          <NavLink
            className={({ isActive }) =>
              `admin-nav__link${isActive ? " is-active" : ""}`
            }
            to="/admin"
            end
          >
            <span className="admin-nav__num">01</span>
            <span className="admin-nav__label">Visão geral</span>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `admin-nav__link${isActive ? " is-active" : ""}`
            }
            to="/admin/cadastros"
          >
            <span className="admin-nav__num">02</span>
            <span className="admin-nav__label">Cadastros</span>
            {counts?.pending ? (
              <span className="admin-nav__count">{counts.pending}</span>
            ) : null}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `admin-nav__link${isActive ? " is-active" : ""}`
            }
            to="/admin/usuarios"
          >
            <span className="admin-nav__num">03</span>
            <span className="admin-nav__label">Usuários</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar__foot">
          <Link className="admin-sidebar__site" to="/">
            Ver site público <ArrowIcon />
          </Link>
          <div className="admin-user">
            <span className="admin-user__avatar" aria-hidden="true">
              {initials(displayName)}
            </span>
            <div className="admin-user__text">
              <strong>{displayName}</strong>
              <span>{user?.email ?? ""}</span>
            </div>
          </div>
          <button
            className="btn btn--quiet admin-user__exit"
            type="button"
            onClick={() => void handleExit()}
          >
            Sair da curadoria
          </button>
        </div>
      </aside>

      <div
        className="admin-scrim"
        hidden={!open}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-burger"
            type="button"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            aria-label="Abrir menu da curadoria"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="admin-topbar__crumb">
            <span className="eyebrow">Curadoria</span>
            <span aria-hidden="true">/</span>
            <strong>{title}</strong>
          </div>

          <div className="admin-topbar__actions">
            <Link className="admin-topbar__link" to="/">
              Ver site <ArrowIcon />
            </Link>
          </div>
        </header>

        <div className="admin-content">
          {counts.pending > 0 && !bannerDismissed ? (
            <section className="admin-banner" aria-labelledby="admin-banner-title">
              <div className="admin-banner__body">
                <p className="eyebrow">Avisos da curadoria</p>
                <h2 id="admin-banner-title">
                  <span className="admin-banner__num">{counts.pending}</span>{" "}
                  {counts.pending === 1
                    ? "cadastro aguardando análise"
                    : "cadastros aguardando análise"}
                </h2>
                <p>
                  Existem novos cadastros. Revise os dados antes de publicar no
                  acervo.
                </p>
              </div>
              <div className="admin-banner__actions">
                <Link
                  className="btn btn--primary"
                  to="/admin/cadastros?status=pending"
                >
                  Revisar pendentes <ArrowIcon />
                </Link>
                <button
                  className="admin-banner__close"
                  type="button"
                  onClick={() => setBannerDismissed(true)}
                  aria-label="Dispensar aviso"
                >
                  ×
                </button>
              </div>
            </section>
          ) : null}

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminShell;
