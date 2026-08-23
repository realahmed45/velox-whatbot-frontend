/**
 * RequireOnboarding — the minimum gate before the dashboard.
 *
 * What is still mandatory:
 *   1. a verified email
 *   2. a workspace
 *   3. an active/trialing plan (Botlify has no free tier)
 *
 * What is NOT: connecting a messaging channel, and picking a business type —
 * both were Instagram-era steps. A hotel owner goes straight from signup to
 * naming their hotel to the dashboard.
 *
 * Billing/settings remain accessible so users can pay or sign out.
 */
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import BrandSpinner from "@/components/ui/BrandSpinner";

const EXEMPT_PATHS = [
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/pricing",
  "/dashboard/guide",
  // Consultants aren't hotels — their program dashboard must stay reachable
  // without connecting a channel or starting a plan.
  "/dashboard/consultant",
];

export default function RequireOnboarding({ children }) {
  const { workspace, fetchWorkspace, loading } = useWorkspaceStore();
  const { activeWorkspace, user } = useAuthStore();
  const location = useLocation();

  // Just came back from connecting Instagram (?connected=true). The cached
  // workspace still shows "not connected", which would bounce us straight back
  // to onboarding — a loop. Force ONE fresh fetch and hold the gate until it
  // resolves so we read the real, just-connected status.
  const justConnected = new URLSearchParams(location.search).get("connected") ===
    "true";
  const [refreshing, setRefreshing] = useState(justConnected);
  useEffect(() => {
    if (justConnected && activeWorkspace) {
      setRefreshing(true);
      Promise.resolve(fetchWorkspace(activeWorkspace, { force: true })).finally(
        () => setRefreshing(false),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justConnected, activeWorkspace]);

  useEffect(() => {
    if (!workspace && activeWorkspace && !loading) {
      fetchWorkspace(activeWorkspace);
    }
  }, [workspace, activeWorkspace, loading, fetchWorkspace]);

  // Hold everything while we refresh the just-connected workspace. Show a
  // reassuring label so the brief window after Instagram's redirect reads as
  // "we're finishing up", not a broken page.
  if (justConnected && refreshing)
    return <BrandSpinner label="Finishing your Instagram connection" />;

  // Email/password signups must confirm their 4-digit code first. Google
  // signups arrive with isEmailVerified: true, so they pass straight through.
  if (user && user.isEmailVerified === false) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />;
  }

  // A brand-new owner has NO workspace yet (we no longer create one at signup).
  // Send them to onboarding, which creates their workspace and connects
  // Instagram. Verified users with no active workspace land here.
  // Exception: the consultant dashboard — consultants aren't hotels and don't
  // need a workspace to apply / see their referral code.
  if (!activeWorkspace) {
    if (location.pathname.startsWith("/dashboard/consultant")) return children;
    return <Navigate to="/onboarding/hotel" replace />;
  }

  // While the workspace is still loading we don't yet know if Instagram is
  // connected — show a spinner instead of flashing the dashboard (or the
  // onboarding redirect) and then correcting it a moment later.
  if (loading || !workspace) return <BrandSpinner />;

  // Agents (invited team members) never run onboarding — they inherit the
  // owner's already-connected workspace. Only the workspace OWNER is gated on
  // connecting a channel.
  const myId = String(user?._id || user?.id || "");
  const ownerId = String(workspace.owner?._id || workspace.owner || "");
  const isOwner = !!myId && !!ownerId && myId === ownerId;
  const isMember = (workspace.members || []).some((m) => {
    const uid = String(m.user?._id || m.user || "");
    return uid === myId && (m.role === "agent" || uid !== ownerId);
  });
  // If we can positively tell they're a non-owner member, let them straight in.
  if (!isOwner && isMember) return children;

  const isExempt = EXEMPT_PATHS.some((p) => location.pathname.startsWith(p));

  // PAYWALL: Botlify has no free tier. An owner without an active/trialing paid
  // plan must start a plan (card required) before using the app. Billing +
  // settings stay reachable so they can pay or sign out. Agents already bypassed
  // above (they use the owner's paid workspace).
  const entitled = workspace.entitled === true;
  if (isOwner && !entitled && !isExempt) {
    // Distinguish a lapsed user (had a plan, it ended → reactivate screen with
    // "your data is safe") from a brand-new owner (never subscribed → the
    // first-time pricing/onboarding).
    const status = workspace.subscription?.status;
    const lapsed = ["cancelled", "expired", "past_due"].includes(status);
    return (
      <Navigate
        to={lapsed ? "/onboarding/reactivate" : "/onboarding/pricing"}
        replace
      />
    );
  }

  // Hotels are not gated on connecting a messaging channel — an owner can run
  // the whole product (bookings, calendar, guests) without Instagram. Channels
  // are opt-in from Settings → Channels whenever they want them.
  //
  // The business-type / vertical picker is gone too: the backend defaults every
  // workspace to "hospitality", so `verticalConfigured` is no longer a gate.

  return children;
}
