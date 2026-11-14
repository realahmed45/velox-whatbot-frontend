import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle2,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Calendar,
  Loader2,
  FileText,
  XCircle,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { NumberTicker, PulseDot, Reveal, Spotlight } from "@/components/fx";
import PricingPage from "../PricingPage";
import PageHeader from "@/components/ui/PageHeader";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function BillingPage() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = () =>
    api
      .get("/billing/subscription")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  // Returning from checkout. Activation is async (provider webhook), so POLL the
  // workspace until it's entitled, then move the user forward automatically
  // (dashboard, or hotel onboarding if no channel is connected yet) instead of
  // stranding them on the billing page.
  useEffect(() => {
    const billing = searchParams.get("billing") || searchParams.get("checkout");
    if (billing === "success") {
      toast.success("Payment received — activating your subscription…");
      let tries = 0;
      const poll = setInterval(async () => {
        tries += 1;
        load(); // refresh local billing view
        let ws = null;
        try {
          ws = await fetchWorkspace(activeWorkspace, { force: true });
        } catch {
          /* keep polling */
        }
        const entitled =
          ws?.entitled === true ||
          ws?.subscription?.lifetime === true ||
          ["active", "trialing"].includes(ws?.subscription?.status);
        if (entitled || tries >= 8) {
          clearInterval(poll);
          if (entitled) {
            toast.success("You're all set! 🎉");
            const connected = ws?.instagram?.status === "connected";
            navigate(connected ? "/dashboard" : "/onboarding/hotel", {
              replace: true,
            });
          }
        }
      }, 2500);
    } else if (billing === "failed") {
      toast.error("Checkout was cancelled. No card was charged.");
    }
    if (searchParams.get("billing") || searchParams.get("checkout")) {
      searchParams.delete("billing");
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.get("/billing/creem/portal");
      if (data?.url) window.location.href = data.url;
      else throw new Error();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Couldn't open the billing portal.",
      );
      setPortalLoading(false);
    }
  };

  const cancelPlan = async () => {
    const ok = await confirm({
      title: "Cancel your subscription?",
      description:
        "You'll keep full access until the end of your current billing period. Your account and data stay safe — you can resubscribe anytime.",
      confirmLabel: "Yes, cancel",
      cancelLabel: "Keep my plan",
      danger: true,
    });
    if (!ok) return;
    setCancelling(true);
    try {
      await api.post("/billing/cancel");
      toast.success("Subscription will cancel at the end of your period.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't cancel.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6" aria-busy="true">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-ink-900/[0.06] animate-pulse" />
          <div className="h-4 w-72 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
        </div>
        <div className="card p-5 h-24 animate-pulse" />
        <div className="card p-6 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-32 rounded bg-ink-900/[0.06] animate-pulse" />
              <div className="h-2 rounded-full bg-ink-900/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  const sub = data?.subscription;
  const usage = data?.usage || {};
  const limits = data?.planLimits || {};
  const planId = sub?.plan || limits.planId || "free";
  const status = sub?.status || "trialing";
  // Lifetime / comped account — always active, never billed, never expires.
  const isLifetime = data?.lifetime === true || sub?.lifetime === true;
  const isTrial = !isLifetime && (status === "trialing" || planId === "free");
  // A live paid/trialing subscription we can manage via the Creem portal.
  // Lifetime accounts have no billing to manage/cancel.
  const hasManageable =
    !isLifetime &&
    !!(
      sub?.creemSubscriptionId ||
      sub?.paddleSubscriptionId ||
      sub?.lemonSqueezySubscriptionId
    ) &&
    planId !== "free";
  const cancelPending = !isLifetime && sub?.cancelAtPeriodEnd;

  const tone = isLifetime ? "brand" : isTrial ? "amber" : "emerald";
  const actionTile =
    "group rounded-xl bg-white/80 p-4 text-left ring-1 shadow-[inset_0_1px_0_#fff] transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50";

  return (
    <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-10 max-w-6xl mx-auto">
      <PageHeader
        icon={CreditCard}
        title="Billing & plan"
        subtitle="Manage your subscription and monitor usage"
      />

      {/* Status banner */}
      <Reveal y={16}>
        <Spotlight
          className={clsx(
            "group card p-5 mb-6 flex flex-wrap sm:flex-nowrap items-start gap-3 sm:gap-4 overflow-hidden ring-1",
            tone === "brand"
              ? "ring-sunset-flame/25"
              : tone === "amber"
                ? "ring-amber-500/25"
                : "ring-emerald-500/25",
          )}
        >
          <span
            aria-hidden
            className={clsx(
              "pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full blur-3xl",
              tone === "brand"
                ? "bg-sunset opacity-25"
                : tone === "amber"
                  ? "bg-amber-400/25"
                  : "bg-emerald-400/25",
            )}
          />
          <span
            className={clsx(
              "relative grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]",
              tone === "brand"
                ? "bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.6)]"
                : tone === "amber"
                  ? "bg-amber-50 text-amber-600 ring-1 ring-amber-500/15"
                  : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/15",
            )}
          >
            {isLifetime ? (
              <Sparkles className="w-5 h-5" strokeWidth={1.8} />
            ) : isTrial ? (
              <AlertCircle className="w-5 h-5" strokeWidth={1.8} />
            ) : (
              <CheckCircle2 className="w-5 h-5" strokeWidth={1.8} />
            )}
          </span>
          <div className="relative flex-1 min-w-0">
            <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900 flex items-center gap-2">
              {!isLifetime && !isTrial && (
                <PulseDot color="bg-emerald-500" className="shrink-0" />
              )}
              <span>
                {isLifetime
                  ? "Lifetime subscription ✨"
                  : isTrial
                    ? status === "trialing"
                      ? "You're on your 3-day free trial"
                      : "Choose a plan to get started"
                    : `${formatPlan(planId)} · ${capitalize(status)}`}
              </span>
            </h2>
            <p className="text-sm text-ink-500 mt-0.5">
              {isLifetime
                ? "Free forever — your account never expires and is never charged. 💙"
                : status === "trialing" && sub?.trialEndsAt
                  ? `Trial ends ${new Date(sub.trialEndsAt).toLocaleDateString()} — your card is charged then unless you cancel.`
                  : isTrial
                    ? "Pick a plan below to switch on channel sync and AI guest replies."
                    : cancelPending
                      ? `Cancels on ${sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "period end"} — you keep access until then.`
                      : sub?.currentPeriodEnd
                        ? `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                        : "Subscription active."}
            </p>
          </div>
          {isLifetime ? (
            <span className="relative badge-premium inline-flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Lifetime
            </span>
          ) : (
            sub?.billingCycle && (
              <span className="relative badge-gray inline-flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {capitalize(sub.billingCycle)}
              </span>
            )
          )}
        </Spotlight>
      </Reveal>

      {/* Manage your subscription — prominent self-service actions */}
      {hasManageable && (
        <Reveal y={16} delay={0.05}>
          <div className="card p-5 sm:p-6 mb-6">
            <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-ink-900 mb-1">
              Manage your subscription
            </h3>
            <p className="text-sm text-ink-500 mb-5">
              Everything's self-service — cancel, update your card or download
              invoices right here.
            </p>

            <AnimatePresence initial={false}>
              {cancelPending ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl bg-amber-50/80 ring-1 ring-amber-500/20 p-4 mb-4 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-amber-900">
                        Your plan is set to cancel
                      </p>
                      <p className="text-amber-700 mt-0.5">
                        You keep full access until{" "}
                        {sub?.currentPeriodEnd
                          ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                          : "the end of your period"}
                        . Changed your mind? Just pick a plan below to stay.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="grid sm:grid-cols-3 gap-3">
              {/* Update payment method */}
              <Spotlight
                as="button"
                onClick={openPortal}
                disabled={portalLoading}
                className={clsx(
                  actionTile,
                  "ring-ink-900/[0.07] hover:ring-sunset-flame/30 hover:shadow-[0_14px_30px_-14px_rgba(255,106,43,0.45)]",
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-sunset-soft text-sunset-flame flex items-center justify-center mb-3 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </div>
                <p className="font-semibold text-sm text-ink-900">Update card</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  Change your payment method securely.
                </p>
              </Spotlight>

              {/* Invoices / receipts */}
              <Spotlight
                as="button"
                onClick={openPortal}
                disabled={portalLoading}
                className={clsx(
                  actionTile,
                  "ring-ink-900/[0.07] hover:ring-sunset-flame/30 hover:shadow-[0_14px_30px_-14px_rgba(255,106,43,0.45)]",
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-sunset-soft text-sunset-flame flex items-center justify-center mb-3 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[8deg]">
                  <FileText className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <p className="font-semibold text-sm text-ink-900">Invoices</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  View and download your receipts.
                </p>
              </Spotlight>

              {/* Cancel */}
              {!cancelPending && (
                <button
                  onClick={cancelPlan}
                  disabled={cancelling}
                  className={clsx(
                    actionTile,
                    "ring-rose-500/20 hover:bg-rose-50/60 hover:ring-rose-500/35 hover:shadow-[0_14px_30px_-14px_rgba(225,29,72,0.4)]",
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 transition-transform duration-500 ease-spring group-hover:rotate-90">
                    {cancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" strokeWidth={1.8} />
                    )}
                  </div>
                  <p className="font-semibold text-sm text-rose-600">Cancel plan</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Cancel anytime — keep access till period end.
                  </p>
                </button>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Usage card */}
      <Reveal y={16} delay={0.08}>
        <div className="card p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset-soft text-sunset-flame">
              <TrendingUp className="w-4 h-4" strokeWidth={1.8} />
            </span>
            <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-ink-900">
              This month's usage
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <UsageBar
              label="Messages sent"
              used={usage.messagesThisMonth || 0}
              limit={limits.messages}
            />
            <UsageBar
              label="Contacts"
              used={usage.contactsCount || 0}
              limit={limits.contacts}
            />
            <UsageBar
              label="Active flows"
              used={usage.activeFlows || 0}
              limit={limits.flows}
            />
            <UsageBar
              label="Team seats"
              used={usage.teamMembers || 1}
              limit={limits.teamSeats}
            />
          </div>
        </div>
      </Reveal>

      {/* Embedded pricing — hidden for lifetime accounts (nothing to buy). */}
      {!isLifetime && (
        <div>
          {/* Not wrapped in Reveal: a lingering CSS filter would trap any
              fixed-position overlay the pricing block opens. */}
          <div className="card p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900 mb-1">
              {isTrial ? "Choose a plan" : "Upgrade your plan"}
            </h3>
            <p className="text-sm text-ink-500 mb-6">
              {isTrial
                ? "Switch plans anytime. Annual billing saves ~17%."
                : "Upgrade for more — annual billing saves ~17%. You keep everything you already have."}
            </p>
            <PricingPage
              embedded
              currentPlan={isTrial ? null : planId}
              currentCycle={sub?.billingCycle || null}
            />
          </div>
        </div>
      )}

      {!isLifetime && (
        <p className="text-xs text-ink-400 text-center mt-6">
          Secure card payments · auto-renews each cycle · cancel anytime.
        </p>
      )}
    </div>
  );
}

function UsageBar({ label, used, limit }) {
  const unlimited =
    !limit || limit === -1 || limit === Infinity || limit === "Infinity";
  const numericLimit = unlimited ? 0 : Number(limit);
  const pct = unlimited
    ? 0
    : Math.min(100, Math.round((used / numericLimit) * 100));
  const near = pct >= 80;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm mb-1.5">
        <span className="text-ink-700">{label}</span>
        <span
          className={clsx(
            "font-mono text-xs tabular-nums",
            near ? "text-rose-600" : "text-ink-500",
          )}
        >
          <NumberTicker value={Number(used) || 0} /> /{" "}
          {unlimited ? "∞" : numericLimit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-ink-900/[0.06] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]">
        <motion.div
          className={clsx(
            "h-full rounded-full",
            unlimited
              ? "bg-sunset opacity-30"
              : near
                ? "bg-gradient-to-r from-rose-400 to-rose-600"
                : "bg-sunset",
          )}
          initial={{ width: 0 }}
          whileInView={{ width: unlimited ? "100%" : `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function formatPlan(id) {
  const map = {
    free: "Free trial",
    hotel_free: "Launch (Free)",
    hotel_pro: "Botlify for Hotels",
    ig_starter: "Basic (legacy)",
    ig_pro: "Pro (legacy)",
    starter: "Starter (legacy)",
    growth: "Basic (legacy)",
    scale: "Pro (legacy)",
    business: "Pro (legacy)",
    agency: "Pro (legacy)",
  };
  return map[id] || id;
}
function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : "";
}
