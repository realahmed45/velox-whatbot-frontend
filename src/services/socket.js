import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket = null;

// ─── Listener registry ───────────────────────────────────────────────────────
// Long-lived app listeners (e.g. notifications) register here instead of
// calling socket.on() directly. They're attached to the current socket and
// automatically moved onto any socket initSocket() creates later, so a
// reconnect/re-init never silently drops them. Unsubscribe removes only that
// exact handler — never `off(event)` wholesale.
const registry = new Map(); // event -> Set<handler>

const attachRegistered = (s) => {
  registry.forEach((handlers, event) =>
    handlers.forEach((h) => s.on(event, h)),
  );
};
const detachRegistered = (s) => {
  registry.forEach((handlers, event) =>
    handlers.forEach((h) => s.off(event, h)),
  );
};

export const onSocketEvent = (event, handler) => {
  if (!registry.has(event)) registry.set(event, new Set());
  registry.get(event).add(handler);
  socket?.on(event, handler);
  return () => {
    registry.get(event)?.delete(handler);
    socket?.off(event, handler);
  };
};

export const initSocket = () => {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().token;

  if (socket) detachRegistered(socket);

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

  attachRegistered(socket);

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
