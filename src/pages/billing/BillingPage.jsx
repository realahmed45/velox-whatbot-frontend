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
} from "lucide-react";
import { clsx } from "clsx";
import PricingPage from "../PricingPage";
import PageHeader from "@/components/ui/PageHeader";

export default function BillingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    api
      .get("/billing/subscription")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Show a toast when returning from the Xendit hosted checkout.
  useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") {
      toast.success("Payment received — your subscription is being activated.");
    } else if (billing === "failed") {
      toast.error("Checkout was cancelled or failed. No card was charged.");
    }
    if (billing) {
      searchParams.delete("billing");
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="p-8 text-ink-400 text-sm">Loading…</div>;
  }

  const sub = data?.subscription;
  const usage = data?.usage || {};
  const limits = data?.planLimits || {};
  const planId = sub?.plan || limits.planId || "free";
  const status = sub?.status || "trialing";
  const isTrial = status === "trialing" || planId === "free";

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
              ? "You're on the free trial"
              : `${formatPlan(planId)} · ${capitalize(status)}`}
          </h2>
          <p className="text-sm text-ink-500 mt-0.5">
            {isTrial
              ? "Pick a plan below to unlock unlimited Instagram automations and premium AI."
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

      {/* Embedded pricing */}
      <div className="card p-6">
        <h3 className="font-semibold text-ink-900 mb-1">
          {isTrial ? "Choose a plan" : "Change plan"}
        </h3>
        <p className="text-sm text-ink-500 mb-6">
          Switch plans anytime. Annual billing saves ~17%.
        </p>
        <PricingPage embedded />
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
