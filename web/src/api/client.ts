import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/**
 * Cliente HTTP da API.
 *
 * A sessão do painel vive em cookie `httpOnly` (`cadterreiros_session`), então
 * toda requisição precisa de `withCredentials` — nenhum token é lido/gravado
 * em `localStorage`.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    const apiKey = import.meta.env.VITE_CADTERREIROS_API_KEY;
    if (apiKey) {
      config.headers["x-cadterreiros-api"] = apiKey;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

client.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: unknown) => {
    // Sessão expirada/revogada: avisa a aplicação para voltar ao login.
    if (
      typeof window !== "undefined" &&
      (error as { response?: { status?: number } })?.response?.status === 401
    ) {
      window.dispatchEvent(new Event("cadterreiros:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default client;
