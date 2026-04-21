import { useEffect, useState } from "react";
import api from "@/services/api";
import { CheckCircle2, TrendingUp, Zap, Sparkles, Rocket } from "lucide-react";
import { clsx } from "clsx";
import PricingPage from "../PricingPage";

const ICONS = { starter: Zap, growth: Rocket, scale: Sparkles };

export default function BillingPage() {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/plans/current")
      .then(({ data }) => {
        setCurrent(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-ink-400 text-sm">Loading…</div>;
  }

  const plan = current?.plan;
  const usage = current?.usage || {};
  const limits = plan?.limits || {};
  const Icon = ICONS[plan?.id] || Zap;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Billing & Plan</h1>
        <p className="text-sm text-ink-500">
          Manage your subscription and monitor usage.
        </p>
      </div>

      {/* Current plan card */}
      {plan && (
        <div
          className={clsx(
            "card p-6 mb-6",
            plan.premium
              ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white border-accent-400/30"
              : plan.recommended
                ? "border-2 border-brand-500"
                : "",
          )}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  plan.premium ? "bg-white/10" : "bg-brand-gradient",
                )}
              >
                <Icon
                  className={clsx(
                    "w-6 h-6",
                    plan.premium ? "text-accent-300" : "text-white",
                  )}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={clsx(
                      "text-xl font-bold",
                      plan.premium ? "text-white" : "text-ink-900",
                    )}
                  >
                    {plan.name}
                  </h2>
                  <span
                    className={clsx(
                      "chip text-[10px]",
                      plan.premium
                        ? "bg-accent-400/20 text-accent-200"
                        : "bg-brand-100 text-brand-700",
                    )}
                  >
                    Current plan
                  </span>
                </div>
                <p
                  className={clsx(
                    "text-sm mt-0.5",
                    plan.premium ? "text-white/70" : "text-ink-500",
                  )}
                >
                  {plan.tagline || ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={clsx(
                  "text-3xl font-bold",
                  plan.premium ? "text-white" : "text-ink-900",
                )}
              >
                {plan.currency || "PKR"}{" "}
                {plan.priceMonthly?.toLocaleString() || 0}
                <span
                  className={clsx(
                    "text-sm font-normal",
                    plan.premium ? "text-white/50" : "text-ink-400",
                  )}
                >
                  /mo
                </span>
              </p>
              {plan.id === "starter" && (
                <p className={clsx("text-xs mt-1", "text-ink-400")}>
                  Free forever
                </p>
              )}
            </div>
          </div>

          {plan.highlights?.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-2 mt-5">
              {plan.highlights.slice(0, 4).map((h) => (
                <div key={h} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className={clsx(
                      "w-4 h-4 flex-shrink-0 mt-0.5",
                      plan.premium ? "text-accent-300" : "text-brand-600",
                    )}
                  />
                  <span
                    className={plan.premium ? "text-white/80" : "text-ink-700"}
                  >
                    {h}
                  </span>
                </div>
              ))}
            </div>
          )}
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
            label="DMs sent"
            used={usage.messagesThisMonth || 0}
            limit={limits.dmsPerMonth}
          />
          <UsageBar
            label="Active triggers"
            used={usage.activeTriggers || 0}
            limit={limits.triggers}
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
        <PricingPage embedded />
      </div>

      <p className="text-xs text-ink-400 text-center mt-6">
        Payment integrations (JazzCash / Easypaisa) are being finalized — plan
        activation is free while we're in open beta.
      </p>
    </div>
  );
}

function UsageBar({ label, used, limit }) {
  const unlimited = !limit || limit === -1 || limit === Infinity;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
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
          {used.toLocaleString()} / {unlimited ? "∞" : limit.toLocaleString()}
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
