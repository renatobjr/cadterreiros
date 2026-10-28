import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi, type LoginPayload } from "../../api/auth";
import { isRefusal, readEnvelope } from "../../api/envelope";
import { AuthContext, type AuthContextValue, type AuthUser } from "./context";

export interface AuthProviderProps {
  children: ReactNode;
}

type SessionRecord = Record<string, unknown>;

interface SessionPayload {
  user?: unknown;
}

function readUser(value: unknown): AuthUser | null {
  if (typeof value !== "object" || value === null) return null;

  const record = value as SessionRecord;
  const id = typeof record.id === "string" ? record.id : null;
  const email = typeof record.email === "string" ? record.email : null;
  const fullname = typeof record.fullname === "string" ? record.fullname : null;
  const role = typeof record.role === "string" ? record.role : null;

  if (!id && !email) return null;

  return { id, email, fullname, role };
}

/** Lê `{ user }` do envelope da API (login/validate-token). */
function userFromResponse(response: unknown): AuthUser | null {
  const envelope = readEnvelope<SessionPayload>(response);
  if (!envelope || isRefusal(envelope)) return null;
  return readUser(envelope.data?.user);
}

/**
 * Sessão do painel baseada em **cookie httpOnly**.
 *
 * Não há token em `localStorage`: o navegador envia o cookie a cada requisição
 * (`withCredentials`) e a identidade é recuperada com `validate-token` no boot.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  /** Evita que a validação inicial sobrescreva um login feito no meio do caminho. */
  const sessionSettledRef = useRef(false);

  useEffect(() => {
    let active = true;

    // Migração: versões antigas guardavam o JWT no localStorage.
    localStorage.removeItem("SESSION_TOKEN");

    authApi
      .validateToken()
      .then((response) => {
        if (active && !sessionSettledRef.current) {
          setUser(userFromResponse(response));
        }
      })
      .catch(() => {
        if (active && !sessionSettledRef.current) setUser(null);
      })
      .finally(() => {
        if (active) setRestoring(false);
      });

    // Encerra a sessão local quando a API responde 401 (expiração/revogação).
    function handleUnauthorized() {
      sessionSettledRef.current = true;
      setUser(null);
    }

    window.addEventListener("cadterreiros:unauthorized", handleUnauthorized);

    return () => {
      active = false;
      window.removeEventListener("cadterreiros:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    sessionSettledRef.current = true;
    const response = await authApi.login(payload);
    const nextUser = userFromResponse(response);
    if (nextUser) setUser(nextUser);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // mesmo se a API falhar, a sessão local é encerrada
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuth: user !== null, restoring, login, logout }),
    [user, restoring, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
