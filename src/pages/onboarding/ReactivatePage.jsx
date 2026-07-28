/**
 * ReactivatePage — the "resubscribe to continue" screen shown when a workspace
 * owner's trial or subscription has ended. The dashboard is locked; this is the
 * easy, reassuring path back: their account + data are safe, they just pick a
 * plan to unlock everything again. Reuses the plan picker (Creem checkout).
 */
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Database, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import PricingPage from "../PricingPage";

export default function ReactivatePage() {
  const { user, logout } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const status = workspace?.subscription?.status;

  const headline =
    status === "past_due"
      ? "Your payment didn't go through"
      : status === "cancelled" || status === "expired"
        ? "Welcome back — reactivate to continue"
        : "Your free trial has ended";

  const subtext =
    status === "past_due"
      ? "Update your plan below to get your automations running again. Everything you built is safe."
      : "Pick a plan to unlock your dashboard again. Your account, contacts, flows and settings are all exactly where you left them.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-900">
            {headline}
          </h1>
          <p className="mt-2 text-ink-500 max-w-md mx-auto">{subtext}</p>
        </div>

        {/* Reassurance strip */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
          {[
            { icon: Database, label: "Your data is safe" },
            { icon: ShieldCheck, label: "1-click reactivate" },
            { icon: Lock, label: "Cancel anytime" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl border border-ink-100 bg-white p-3 text-center"
            >
              <Icon className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
              <p className="text-[11px] font-semibold text-ink-600 leading-tight">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Plan picker → Creem checkout */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-lg p-6 sm:p-8">
          <PricingPage embedded />
        </div>

        {/* Footer — sign out escape hatch */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-ink-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
            {user?.email ? ` (${user.email})` : ""}
          </button>
          <p className="mt-3 text-[11px] text-ink-400">
            Need help? Email{" "}
            <a
              href="mailto:contactus@botlify.site"
              className="text-brand-600 hover:underline"
            >
              contactus@botlify.site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
