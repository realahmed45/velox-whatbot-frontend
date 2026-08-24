/**
 * propertyStore — which of the account's properties the dashboard is showing.
 *
 * A workspace can hold several properties (a group with three villas is one
 * account). The backend resolves `?propertyId=` on the endpoints that take it
 * and falls back to the oldest active property otherwise, so this store is a
 * UI preference, never a source of truth: a stale id degrades to the default
 * rather than erroring.
 *
 * Persisted per-workspace so switching accounts doesn't carry the previous
 * account's property id across. zustand/persist wraps localStorage and already
 * swallows quota/private-mode failures, matching workspaceStore.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";

export const usePropertyStore = create(
  persist(
    (set, get) => ({
      properties: [],
      /** { [workspaceId]: propertyId } — the chosen property per account. */
      selectedByWorkspace: {},
      loading: false,
      loadedFor: null, // workspaceId the current list belongs to

      /**
       * The active property id for a workspace, falling back to the first
       * property so callers never have to special-case "nothing chosen yet".
       */
      activeId: (workspaceId) => {
        const { properties, selectedByWorkspace } = get();
        const chosen = workspaceId ? selectedByWorkspace[workspaceId] : null;
        if (chosen && properties.some((p) => String(p._id) === String(chosen))) {
          return chosen;
        }
        return properties[0]?._id || null;
      },

      activeProperty: (workspaceId) => {
        const id = get().activeId(workspaceId);
        return get().properties.find((p) => String(p._id) === String(id)) || null;
      },

      select: (workspaceId, propertyId) => {
        if (!workspaceId) return;
        set((s) => ({
          selectedByWorkspace: {
            ...s.selectedByWorkspace,
            [workspaceId]: propertyId,
          },
        }));
      },

      /**
       * Load the account's properties. `force` refetches even when the list is
       * already loaded for this workspace (e.g. right after creating one).
       */
      fetchProperties: async (workspaceId, opts = {}) => {
        if (!workspaceId) return [];
        if (!opts.force && get().loadedFor === workspaceId && get().properties.length) {
          return get().properties;
        }
        set({ loading: true });
        try {
          const { data } = await api.get("/hotel/properties");
          const list = (data.properties || []).filter(
            (p) => p.active !== false,
          );
          set({ properties: list, loadedFor: workspaceId });
          return list;
        } catch {
          // Non-fatal: the switcher simply stays hidden and pages fall back to
          // the server's default property.
          return get().properties;
        } finally {
          set({ loading: false });
        }
      },

      /** Drop everything — called on logout so nothing leaks to the next user. */
      reset: () =>
        set({
          properties: [],
          selectedByWorkspace: {},
          loadedFor: null,
          loading: false,
        }),
    }),
    {
      name: "botlify-property",
      // Only the choice survives a reload; the list is always refetched.
      partialize: (s) => ({ selectedByWorkspace: s.selectedByWorkspace }),
    },
  ),
);

/**
 * Convenience hook for pages: the active property id plus the params object to
 * spread into an axios call. Returns `{}` for params when there's nothing to
 * scope by, so single-property accounts send no extra query string at all.
 */
export function usePropertyScope(workspaceId) {
  const properties = usePropertyStore((s) => s.properties);
  const selectedByWorkspace = usePropertyStore((s) => s.selectedByWorkspace);

  const chosen = workspaceId ? selectedByWorkspace[workspaceId] : null;
  const valid =
    chosen && properties.some((p) => String(p._id) === String(chosen));
  const propertyId = valid ? chosen : properties[0]?._id || null;

  return {
    propertyId,
    multi: properties.length > 1,
    properties,
    // Only send the param when there's a real choice to communicate.
    params: properties.length > 1 && propertyId ? { propertyId } : {},
  };
}
