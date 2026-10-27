import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type LoginPayload, type LoginResponse } from "../../api/auth";

const SESSION_TOKEN_KEY = "SESSION_TOKEN";

export interface AuthUser {
  id: string | null;
  email: string | null;
  fullname: string | null;
}

export interface AuthContextValue {
  user: AuthUser;
  isAuth: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
}

const ANONYMOUS_USER: AuthUser = {
  id: null,
  email: null,
  fullname: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

type SessionRecord = Record<string, unknown>;

/** A API pode devolver a sessão direto ou dentro de um envelope `data`. */
function unwrapSession(response: unknown): SessionRecord {
  let current = response as SessionRecord | null | undefined;

  for (let depth = 0; depth < 3 && current !== null && current !== undefined; depth += 1) {
    if (typeof current.token === "string") {
      return current;
    }
    const next = current.data;
    current = typeof next === "object" && next !== null ? (next as SessionRecord) : undefined;
  }

  return {};
}

function readUser(value: unknown): AuthUser {
  if (typeof value !== "object" || value === null) {
    return ANONYMOUS_USER;
  }

  const record = value as SessionRecord;
  const id = typeof record.id === "string" ? record.id : null;
  const email = typeof record.email === "string" ? record.email : null;
  const fullname = typeof record.fullname === "string" ? record.fullname : null;

  return { id, email, fullname };
}

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(ANONYMOUS_USER);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_TOKEN_KEY),
  );

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    const session = unwrapSession(response);
    const sessionToken = typeof session.token === "string" ? session.token : null;

    if (sessionToken !== null) {
      setUser(readUser(session.user));
      setToken(sessionToken);
      localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
    }

    return response;
  }, []);

  const logout = useCallback(() => {
    setUser(ANONYMOUS_USER);
    setToken(null);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuth: token !== null, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook é o par público do provider; manter no mesmo módulo preserva a coesão do contexto.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}

export default AuthProvider;
