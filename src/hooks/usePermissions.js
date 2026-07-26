import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

/**
 * Single source of truth for "what can the current user access in this
 * workspace?". Used by BOTH the sidebar (to hide links) and the route guard
 * (to block direct-URL access) so they can never disagree.
 *
 * Owners get everything. Agents get only the permission keys the owner granted
 * on their membership.
 *
 * Returns:
 *   isOwner   — true if the current user owns the active workspace
 *   perms     — string[] of granted permission keys (empty for a fresh agent)
 *   ready     — false until we actually know role/permissions (workspace loaded)
 *   can(perm) — true if the user may access a `perm` area
 *   canItem(item) — accepts a nav item {perm?, ownerOnly?} and returns access
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const workspace = useWorkspaceStore((s) => s.workspace);

  return useMemo(() => {
    const myId = String(user?._id || user?.id || "");
    const ownerId = String(workspace?.owner?._id || workspace?.owner || "");
    const isOwner = !!myId && !!ownerId && myId === ownerId;

    const myMember = (workspace?.members || []).find(
      (m) => String(m.user?._id || m.user) === myId,
    );
    const perms = myMember?.permissions || [];

    // We "know" the answer once the workspace with its owner/members is loaded.
    const ready = !!workspace && !!ownerId;

    const can = (perm) => {
      if (isOwner) return true;
      if (!perm) return true; // pages with no permission requirement
      return perms.includes(perm);
    };

    const canItem = (item) => {
      if (isOwner) return true;
      if (item?.ownerOnly) return false;
      return can(item?.perm);
    };

    return { isOwner, perms, ready, can, canItem };
  }, [user, workspace]);
}
