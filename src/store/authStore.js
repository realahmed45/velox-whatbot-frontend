import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * DEV-only seed login for working on the authenticated UI locally without a
 * working backend. The token is a recognizable sentinel so the API client can
 * skip its auth-refresh/redirect logic for it (see services/api.js). None of
 * this runs or matters in production — it's only triggered by a DEV-gated
 * button on the login page.
 */
export const DEV_TOKEN = "dev-ui-token";

const DEV_USER = {
  _id: "dev-user",
  name: "Dev User",
  email: "dev@botlify.local",
  role: "owner",
  isEmailVerified: true,
  avatar: null,
  activeWorkspace: { _id: "dev-workspace", name: "Dev Workspace" },
  workspaces: [{ _id: "dev-workspace", name: "Dev Workspace" }],
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      activeWorkspace: null, // workspaceId string

      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setActiveWorkspace: (workspaceId) =>
        set({ activeWorkspace: workspaceId }),

      login: (user, token, refreshToken) => {
        const ws = user?.activeWorkspace || user?.workspaces?.[0];
        set({
          user,
          token,
          refreshToken,
          activeWorkspace: ws?._id || ws || null,
        });
      },

      // DEV-only: seed a fake authenticated session for UI work.
      devLogin: () =>
        set({
          user: DEV_USER,
          token: DEV_TOKEN,
          refreshToken: null,
          activeWorkspace: "dev-workspace",
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          activeWorkspace: null,
        }),
    }),
    {
      name: "botlify-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        activeWorkspace: state.activeWorkspace,
      }),
    },
  ),
);
