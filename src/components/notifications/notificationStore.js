import { create } from "zustand";
import api from "@/services/api";

/**
 * Notification store — the single source of truth for the bell, the panel,
 * the live toasts and the "(3) Today · Botlify" tab title.
 *
 * Backend:
 *   GET    /notifications?limit=30&before=<iso>&unread=1 → { notifications, unreadCount, hasMore }
 *   GET    /notifications/unread-count                  → { unreadCount } (or { count })
 *   POST   /notifications/:id/read
 *   POST   /notifications/read-all
 *   DELETE /notifications/:id
 * Socket: `notification:new` → { notification, unreadCount }
 */

const PAGE = 30;
const SOUND_KEY = "botlify-notif-sound";

const readSoundPref = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
};

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const pickCount = (data) => {
  const n = data?.unreadCount ?? data?.count;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

export const MESSAGE_TYPES = ["message.new", "guest.needs_human"];

export const useNotificationStore = create((set, get) => ({
  items: [],
  unreadCount: 0,
  hasMore: false,
  loading: false,
  loadingMore: false,
  loaded: false,
  loadedAt: 0,
  error: false,
  filter: "all", // all | unread
  soundOn: readSoundPref(),
  /** Bumped on every live arrival — the bell keys its pop/ring animation off it. */
  pulse: 0,

  reset: () =>
    set({
      items: [],
      unreadCount: 0,
      hasMore: false,
      loaded: false,
      loadedAt: 0,
      error: false,
      filter: "all",
    }),

  fetch: async ({ silent = false } = {}) => {
    const { filter } = get();
    if (!silent) set({ loading: true, error: false });
    try {
      const params = { limit: PAGE };
      if (filter === "unread") params.unread = 1;
      const { data } = await api.get("/notifications", { params });
      const count = pickCount(data);
      set({
        items: (data?.notifications || []).slice().sort(byNewest),
        hasMore: !!data?.hasMore,
        ...(count != null ? { unreadCount: count } : {}),
        loaded: true,
        loadedAt: Date.now(),
        error: false,
      });
    } catch {
      set({ error: !get().loaded, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { items, hasMore, loadingMore, filter } = get();
    if (!hasMore || loadingMore || items.length === 0) return;
    set({ loadingMore: true });
    try {
      const oldest = items[items.length - 1];
      const params = { limit: PAGE, before: oldest.createdAt };
      if (filter === "unread") params.unread = 1;
      const { data } = await api.get("/notifications", { params });
      const seen = new Set(get().items.map((n) => n._id));
      const more = (data?.notifications || []).filter((n) => !seen.has(n._id));
      set((s) => ({
        items: [...s.items, ...more].sort(byNewest),
        hasMore: !!data?.hasMore && more.length > 0,
      }));
    } catch {
      /* keep what we have; the button stays so they can retry */
    } finally {
      set({ loadingMore: false });
    }
  },

  setFilter: (filter) => {
    if (filter === get().filter) return;
    set({ filter, items: [], hasMore: false });
    get().fetch();
  },

  refreshCount: async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      const count = pickCount(data);
      if (count != null) set({ unreadCount: count });
    } catch {
      /* non-fatal */
    }
  },

  /** A live notification from the socket. Returns true if it was new. */
  receive: (notification, unreadCount) => {
    if (!notification?._id) return false;
    const exists = get().items.some((n) => n._id === notification._id);
    if (exists) return false;
    set((s) => ({
      items: [notification, ...s.items].sort(byNewest),
      unreadCount:
        typeof unreadCount === "number" ? unreadCount : s.unreadCount + (notification.readAt ? 0 : 1),
      pulse: s.pulse + 1,
    }));
    return true;
  },

  markRead: async (id) => {
    const target = get().items.find((n) => n._id === id);
    if (!target || target.readAt) return;
    const now = new Date().toISOString();
    set((s) => ({
      items: s.items.map((n) => (n._id === id ? { ...n, readAt: now } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {
      get().refreshCount();
    }
  },

  markAllRead: async () => {
    const prev = get().items;
    const prevCount = get().unreadCount;
    const now = new Date().toISOString();
    set((s) => ({
      items: s.items.map((n) => (n.readAt ? n : { ...n, readAt: now })),
      unreadCount: 0,
    }));
    try {
      await api.post("/notifications/read-all");
    } catch {
      set({ items: prev, unreadCount: prevCount });
      throw new Error("mark-all-failed");
    }
  },

  remove: async (id) => {
    const prev = get().items;
    const target = prev.find((n) => n._id === id);
    if (!target) return;
    set((s) => ({
      items: s.items.filter((n) => n._id !== id),
      unreadCount: target.readAt ? s.unreadCount : Math.max(0, s.unreadCount - 1),
    }));
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      set({ items: prev });
      get().refreshCount();
    }
  },

  setSound: (on) => {
    try {
      localStorage.setItem(SOUND_KEY, on ? "1" : "0");
    } catch {
      /* private mode — keep it in memory only */
    }
    set({ soundOn: !!on });
  },
}));

/** Unread guest-message notifications among those loaded — drives the Messages badge. */
export const selectUnreadMessages = (s) =>
  s.items.reduce((n, x) => n + (!x.readAt && MESSAGE_TYPES.includes(x.type) ? 1 : 0), 0);
