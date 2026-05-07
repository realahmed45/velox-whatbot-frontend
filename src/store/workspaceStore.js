import { create } from "zustand";
import api from "@/services/api";

export const useWorkspaceStore = create((set, get) => ({
  workspace: null,
  workspaces: [],
  loading: false,

  fetchWorkspace: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}`);
      set({ workspace: data.workspace });
    } catch (err) {
      console.error("fetchWorkspace error", err);
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
}));
