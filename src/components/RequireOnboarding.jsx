/**
 * RequireOnboarding — mandatory channel-connection gate.
 *
 * If the active workspace has neither WhatsApp nor Instagram connected,
 * this redirects the user to /dashboard/onboarding/choose-channel.
 *
 * Onboarding pages themselves are exempt (otherwise we'd loop forever),
 * and so are billing & settings (so users can pay / sign out).
 */
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

const EXEMPT_PATHS = [
  "/dashboard/onboarding",
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/pricing",
  "/dashboard/guide",
];

export default function RequireOnboarding({ children }) {
  const { workspace, fetchWorkspace, loading } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const location = useLocation();

  // Lazy-fetch workspace if missing
  useEffect(() => {
    if (!workspace && activeWorkspace && !loading) {
      fetchWorkspace(activeWorkspace);
    }
  }, [workspace, activeWorkspace, loading, fetchWorkspace]);

  if (loading || !workspace) return children;

  const igConnected = workspace.instagram?.status === "connected";
  const waConnected = workspace.whatsapp?.status === "connected";
  const hasChannel = igConnected || waConnected;
  const isExempt = EXEMPT_PATHS.some((p) => location.pathname.startsWith(p));

  if (!hasChannel && !isExempt) {
    return (
      <Navigate
        to="/dashboard/onboarding/choose-channel"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
