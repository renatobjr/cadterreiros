import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/context";

/**
 * Protege as rotas do painel.
 *
 * A checagem aqui é de **UX** (evita mostrar telas sem sessão); a autorização
 * real é feita pela API em cada requisição.
 */
export function RequireAdmin() {
  const { isAuth, restoring } = useAuth();
  const location = useLocation();

  if (restoring) {
    return (
      <main className="admin-shell">
        <p className="admin-muted" role="status" aria-live="polite">
          Verificando sessão…
        </p>
      </main>
    );
  }

  if (!isAuth) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}

export default RequireAdmin;
