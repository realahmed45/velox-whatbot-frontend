import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket = null;

export const initSocket = () => {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().token;

  socket = io(
    import.meta.env.VITE_SOCKET_URL ||
      "https://velox-whatbot-backend.onrender.com",
    {
      auth: { token },
      // Allow polling first, then upgrade to WebSocket. Forcing websocket-only
      // fails hard when the backend is cold-starting (Render free tier) or
      // behind a proxy that doesn't immediately upgrade — which showed up as
      // "WebSocket connection failed" in the console.
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      timeout: 20000,
    },
  );

  if (import.meta.env.DEV) {
    socket.on("connect", () => console.log("[Socket] Connected:", socket.id));
    socket.on("disconnect", (reason) =>
      console.log("[Socket] Disconnected:", reason),
    );
    socket.on("connect_error", (err) =>
      console.error("[Socket] Error:", err.message),
    );
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
