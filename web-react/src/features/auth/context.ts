import { createContext, useContext } from "react";
import type { LoginPayload, LoginResponse } from "../../api/auth";

export const SESSION_TOKEN_KEY = "SESSION_TOKEN";

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

export const ANONYMOUS_USER: AuthUser = {
  id: null,
  email: null,
  fullname: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook de acesso à sessão.
 *
 * Vive fora do `AuthProvider` de propósito: o Fast Refresh do React só
 * funciona em módulos que exportam **apenas** componentes — misturar o
 * provider com um hook derruba o HMR para recarregar a página inteira.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
