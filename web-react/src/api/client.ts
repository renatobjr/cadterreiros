import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    const token = localStorage.getItem("SESSION_TOKEN");
    if (token) {
      config.headers["X-Access-Token"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

client.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: unknown) => Promise.reject(error),
);

export default client;
