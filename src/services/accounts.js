/**
 * accounts.js — client helpers for multi-account (multi-workspace) management.
 * One Botlify identity → many accounts (each = a workspace with its own IG,
 * bot, data and billing). These wrap the backend endpoints and keep the
 * persisted active-account choice in sync.
 */
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

/** Fetch the user's accounts (switcher + picker). */
export async function fetchAccounts() {
  const { data } = await api.get("/workspaces/accounts");
  return {
    accounts: data.accounts || [],
    activeWorkspace: data.activeWorkspace || null,
  };
}

/**
 * Switch the active account — persists server-side, updates the local store,
 * then hard-reloads so every store/query re-reads under the new workspace.
 */
export async function switchAccount(workspaceId) {
  await api.post(`/workspaces/${workspaceId}/switch`);
  useAuthStore.getState().setActiveWorkspace(workspaceId);
  // A full reload is the simplest correct reset: the x-workspace-id header now
  // carries the new id and every store re-hydrates for that account.
  window.location.assign("/dashboard");
}

/**
 * Create a brand-new account (independent workspace) and switch into it, then
 * route into onboarding to connect that account's Instagram + start its trial.
 */
export async function addAccount() {
  const { data } = await api.post("/workspaces/add-account", {});
  const ws = data.workspace;
  useAuthStore.getState().setActiveWorkspace(ws._id);
  // New account has no plan + no IG yet → onboarding gate will walk them
  // through pricing → connect IG → business type, all scoped to this new ws.
  window.location.assign("/onboarding/pricing");
  return ws;
}

/** A short human plan label for badges. */
export function planBadge(acc) {
  if (acc?.lifetime) return "Lifetime";
  const status = acc?.subscriptionStatus;
  const plan = acc?.plan;
  if (status === "trialing") return "Trial";
  const map = {
    ig_starter: "Basic",
    ig_pro: "Pro",
    starter: "Basic",
    growth: "Basic",
    scale: "Pro",
  };
  return map[plan] || (status === "active" ? "Active" : "Trial");
}
