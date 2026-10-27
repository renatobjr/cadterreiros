import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type LoginPayload } from "../../api/auth";
import { isRefusal, readEnvelope } from "../../api/envelope";
import {
  ANONYMOUS_USER,
  AuthContext,
  SESSION_TOKEN_KEY,
  type AuthContextValue,
  type AuthUser,
} from "./context";

export interface AuthProviderProps {
  children: ReactNode;
}

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

/** Provê a sessão da curadoria (token em `localStorage` + usuário logado). */
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

  // Ao recarregar, o token vem do localStorage mas a identidade se perde:
  // validamos a sessão para recuperar nome/e-mail (ou descartar token inválido).
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!stored) return;

    let active = true;
    authApi
      .validateToken(stored)
      .then((response) => {
        if (!active) return;
        const envelope = readEnvelope<{ user?: unknown }>(response);
        if (isRefusal(envelope)) {
          logout();
          return;
        }
        const payload = envelope?.data ?? (response as { user?: unknown });
        setUser(readUser(payload?.user ?? payload));
        setToken(stored);
      })
      .catch(() => {
        if (active) logout();
      });

    return () => {
      active = false;
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuth: token !== null, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
