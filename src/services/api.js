import axios from "axios";
import { useAuthStore, DEV_TOKEN } from "@/store/authStore";

const DEV = import.meta.env.DEV;

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://velox-whatbot-backend.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const { token, activeWorkspace } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeWorkspace) config.headers["x-workspace-id"] = activeWorkspace;
  if (DEV) {
    console.log(`[API] --> ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (DEV) console.log(`[API] <-- ${res.status} ${res.config?.url}`);
    return res;
  },
  async (err) => {
    const originalRequest = err.config;
    if (DEV) {
      console.error(
        `[API] <-- ERROR ${err.response?.status ?? "(no response)"} ${originalRequest?.url}`,
        err.response?.data?.message || err.message,
      );
    }
    // Only attempt the refresh/redirect dance for requests made as a
    // logged-in user. Anonymous visitors hitting a 401 on a public page
    // (e.g. /pricing) must never be force-redirected to /login.
    // The DEV seed token is also exempt — it has no backend session, so 401s
    // from API calls should just fail quietly and keep you in the UI.
    const currentToken = useAuthStore.getState().token;
    const isDevSession = currentToken === DEV_TOKEN;
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !!currentToken &&
      !isDevSession
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await api.post("/auth/refresh", { refreshToken });
        useAuthStore.getState().setTokens(data.token, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
