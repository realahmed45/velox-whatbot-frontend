import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspace: null,
      workspaces: [],
      loading: false,

      // Fetch the workspace. If we already have a cached copy (from a previous
      // session/persisted state), show it INSTANTLY and refresh in the
      // background — so the UI never blocks on a spinner after the first load.
      fetchWorkspace: async (workspaceId, opts = {}) => {
        if (!workspaceId) return;
        const cached = get().workspace;
        const haveCachedMatch =
          cached && String(cached._id) === String(workspaceId);
        // Only show the blocking spinner when we have nothing to show yet —
        // unless `force` is set (e.g. right after connecting Instagram, when the
        // cached copy is known-stale and we must not render off it).
        set({ loading: opts.force || !haveCachedMatch });
        try {
          const { data } = await api.get(`/workspaces/${workspaceId}`);
          set({ workspace: data.workspace });
          return data.workspace;
        } catch (err) {
          console.error("fetchWorkspace error", err);
          return null;
        } finally {
          set({ loading: false });
        }
      },

  fetchWorkspaces: async () => {
    try {
      const { data } = await api.get("/workspaces");
      set({ workspaces: data.workspaces });
    } catch (err) {
      console.error("fetchWorkspaces error", err);
    }
  },

  updateWorkspace: (updates) => {
    set((s) => ({
      workspace: s.workspace ? { ...s.workspace, ...updates } : s.workspace,
    }));
  },

  setWorkspace: (workspace) => set({ workspace }),

  // Persist active channel to backend + update local store
  setActiveChannel: async (channel) => {
    const ws = get().workspace;
    if (!ws?._id) return;
    // Optimistic update
    set({ workspace: { ...ws, activeChannel: channel } });
    try {
      await api.put(`/workspaces/${ws._id}`, { activeChannel: channel });
    } catch (err) {
      console.error("setActiveChannel error", err);
      // revert
      set({ workspace: ws });
      throw err;
    }
  },
    }),
    {
      name: "botlify-workspace",
      // Only cache the workspace itself; never persist the loading flag.
      partialize: (s) => ({ workspace: s.workspace }),
    },
  ),
);
