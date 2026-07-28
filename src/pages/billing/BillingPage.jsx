import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import {
  CheckCircle2,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Calendar,
  Loader2,
  FileText,
  XCircle,
} from "lucide-react";
import { clsx } from "clsx";
import PricingPage from "../PricingPage";
import PageHeader from "@/components/ui/PageHeader";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function BillingPage() {
  const confirm = useConfirm();
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

  // Toast when returning from the Lemon Squeezy hosted checkout. The webhook
  // activates the plan async, so refetch a moment later to reflect it.
  useEffect(() => {
    const billing = searchParams.get("billing") || searchParams.get("checkout");
    if (billing === "success") {
      toast.success("Payment received — activating your subscription…");
      setTimeout(load, 2500);
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
    return <div className="p-8 text-ink-400 text-sm">Loading…</div>;
  }

  const sub = data?.subscription;
  const usage = data?.usage || {};
  const limits = data?.planLimits || {};
  const planId = sub?.plan || limits.planId || "free";
  const status = sub?.status || "trialing";
  const isTrial = status === "trialing" || planId === "free";
  // A live paid/trialing subscription we can manage via the Creem portal.
  const hasManageable =
    !!(
      sub?.creemSubscriptionId ||
      sub?.paddleSubscriptionId ||
      sub?.lemonSqueezySubscriptionId
    ) && planId !== "free";
  const cancelPending = sub?.cancelAtPeriodEnd;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <PageHeader
        icon={CreditCard}
        title="Billing & plan"
        subtitle="Manage your subscription and monitor usage"
      />

      {/* Status banner */}
      <div
        className={clsx(
          "card p-5 mb-6 flex items-start gap-3",
          isTrial
            ? "border-l-4 border-amber-400 bg-amber-50/40"
            : "border-l-4 border-emerald-400 bg-emerald-50/40",
        )}
      >
        {isTrial ? (
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
        )}
        <div className="flex-1">
          <h2 className="font-semibold text-ink-900">
            {isTrial
              ? status === "trialing"
                ? "You're on your 3-day free trial"
                : "Choose a plan to get started"
              : `${formatPlan(planId)} · ${capitalize(status)}`}
          </h2>
          <p className="text-sm text-ink-500 mt-0.5">
            {status === "trialing" && sub?.trialEndsAt
              ? `Trial ends ${new Date(sub.trialEndsAt).toLocaleDateString()} — your card is charged then unless you cancel.`
              : isTrial
                ? "Pick a plan below to unlock your Instagram automations."
                : cancelPending
                  ? `Cancels on ${sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "period end"} — you keep access until then.`
                  : sub?.currentPeriodEnd
                    ? `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                    : "Subscription active."}
          </p>
        </div>
        {sub?.billingCycle && (
          <span className="chip bg-ink-100 text-ink-700 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {capitalize(sub.billingCycle)}
          </span>
        )}
      </div>

      {/* Manage your subscription — prominent self-service actions */}
      {hasManageable && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-ink-900 mb-1">
            Manage your subscription
          </h3>
          <p className="text-sm text-ink-500 mb-5">
            Everything's self-service — cancel, update your card or download
            invoices right here.
          </p>

          {cancelPending ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 mb-4 flex items-start gap-2.5">
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
          ) : null}

          <div className="grid sm:grid-cols-3 gap-3">
            {/* Update payment method */}
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="group rounded-xl border border-ink-200 bg-white p-4 text-left hover:border-brand-300 hover:shadow-card transition disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-2.5">
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
              </div>
              <p className="font-bold text-sm text-ink-900">Update card</p>
              <p className="text-xs text-ink-500 mt-0.5">
                Change your payment method securely.
              </p>
            </button>

            {/* Invoices / receipts */}
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="group rounded-xl border border-ink-200 bg-white p-4 text-left hover:border-brand-300 hover:shadow-card transition disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-2.5">
                <FileText className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-ink-900">Invoices</p>
              <p className="text-xs text-ink-500 mt-0.5">
                View and download your receipts.
              </p>
            </button>

            {/* Cancel */}
            {!cancelPending && (
              <button
                onClick={cancelPlan}
                disabled={cancelling}
                className="group rounded-xl border border-red-200 bg-white p-4 text-left hover:border-red-300 hover:bg-red-50/40 transition disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2.5">
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <p className="font-bold text-sm text-red-600">Cancel plan</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  Cancel anytime — keep access till period end.
                </p>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          <h3 className="font-semibold text-ink-900">This month's usage</h3>
        </div>
        <div className="space-y-4">
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

      {/* Embedded pricing — plan-aware: hides the current plan and any
          downgrades, only offering sensible upgrades. */}
      <div className="card p-6">
        <h3 className="font-semibold text-ink-900 mb-1">
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

      <p className="text-xs text-ink-400 text-center mt-6">
        Secure card payments · auto-renews each cycle · cancel anytime.
      </p>
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
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink-700">{label}</span>
        <span
          className={clsx(
            "font-mono text-xs",
            near ? "text-red-600" : "text-ink-500",
          )}
        >
          {Number(used).toLocaleString()} /{" "}
          {unlimited ? "∞" : numericLimit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full transition-all",
            unlimited
              ? "bg-brand-gradient w-full opacity-30"
              : near
                ? "bg-red-500"
                : "bg-brand-gradient",
          )}
          style={{ width: unlimited ? "100%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatPlan(id) {
  const map = {
    free: "Free trial",
    ig_starter: "Basic — Instagram",
    ig_pro: "Instagram Pro",
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
