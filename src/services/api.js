import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://velox-whatbot-backend.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token + workspace id to every request
api.interceptors.request.use((config) => {
  const { token, activeWorkspace } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeWorkspace) config.headers["x-workspace-id"] = activeWorkspace;
  return config;
});

// Handle 401 — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post("/api/auth/refresh", {
          refreshToken,
        });
        useAuthStore.getState().setTokens(data.token, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
