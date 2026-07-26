/**
 * RequirePermission — route-level access guard.
 *
 * Hiding a sidebar link is cosmetic; an agent could still open a page by typing
 * its URL. This wraps a route element and blocks it unless the current user is
 * the owner or has the required permission. Owners always pass.
 *
 * Usage:
 *   <RequirePermission perm="automations"><AiBotPage /></RequirePermission>
 *   <RequirePermission ownerOnly><TeamPage /></RequirePermission>
 */
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import BrandSpinner from "@/components/ui/BrandSpinner";

export default function RequirePermission({ perm, ownerOnly, children }) {
  const { isOwner, ready, can } = usePermissions();
  const allowed = ready && (ownerOnly ? isOwner : can(perm));

  // Let the blocked agent know why they bounced (once, on denial).
  useEffect(() => {
    if (ready && !allowed) {
      toast.error("You don't have access to that page.");
    }
  }, [ready, allowed]);

  // Wait until we actually know the user's role/permissions — otherwise we'd
  // flash a denial before the workspace loads.
  if (!ready) return <BrandSpinner />;

  // Blocked → silently send them back to the dashboard home (everyone can see
  // it). The route is never rendered, so direct-URL access is prevented.
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return children;
}
