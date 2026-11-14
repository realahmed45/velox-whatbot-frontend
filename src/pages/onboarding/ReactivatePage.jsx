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
import { motion } from "framer-motion";
import { Aurora, Reveal } from "@/components/fx";

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
    <div className="relative isolate min-h-screen bg-night-950 text-white overflow-hidden grain">
      <Aurora variant="dark" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <Reveal className="text-center mb-8">
          <div className="relative mx-auto w-14 h-14 mb-5">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-30 blur-2xl" />
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [0, -4, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-14 h-14 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_36px_-12px_rgba(255,61,119,0.8)]"
            >
              <Lock className="w-7 h-7" strokeWidth={1.8} />
            </motion.div>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            {headline}
          </h1>
          <p className="mt-3 text-white/60 text-[15px] max-w-md mx-auto">{subtext}</p>
        </Reveal>

        {/* Reassurance strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 max-w-lg mx-auto">
          {[
            { icon: Database, label: "Your data is safe" },
            { icon: ShieldCheck, label: "1-click reactivate" },
            { icon: Lock, label: "Cancel anytime" },
          ].map(({ icon: Icon, label }, i) => (
            <Reveal key={label} delay={0.08 + i * 0.06}>
              <div className="group card-dark h-full p-3 text-center">
                <span className="mx-auto mb-2 h-9 w-9 rounded-xl grid place-items-center bg-sunset-soft text-sunset-gold transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </span>
                <p className="text-[11px] font-medium text-white/70 leading-tight">
                  {label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Plan picker → Creem checkout. The picker is a light surface, so it
            sits on a bright liquid-glass sheet over the night canvas. */}
        <Reveal delay={0.2}>
          <div className="glass-strong rounded-3xl p-4 sm:p-8 text-ink-900 shadow-[0_40px_100px_-40px_rgba(255,61,119,0.55)]">
            <PricingPage embedded />
          </div>
        </Reveal>

        {/* Footer — sign out escape hatch */}
        <div className="mt-7 text-center">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="btn-glass-dark group text-xs max-w-full"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" />
            <span className="truncate">
              Sign out
              {user?.email ? ` (${user.email})` : ""}
            </span>
          </button>
          <p className="mt-4 text-[11px] text-white/45">
            Need help? Email{" "}
            <a
              href="mailto:contactus@botlify.site"
              className="text-sunset-gold hover:underline underline-offset-4"
            >
              contactus@botlify.site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
