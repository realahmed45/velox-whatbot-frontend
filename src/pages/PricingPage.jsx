import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Sparkles,
  Zap,
  Rocket,
  MessageSquare,
  Instagram,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { clsx } from "clsx";

/**
 * Public + embedded pricing page.
 * Renders three tabs: Instagram · WhatsApp · Both channels.
 * Plans come from GET /api/billing/plans (single source of truth).
 */

const CHANNELS = [
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "both", label: "Both channels", icon: Layers, highlight: true },
];

const ICONS = {
  free: Sparkles,
  ig_starter: Zap,
  ig_pro: Rocket,
  wa_starter: Zap,
  wa_pro: Rocket,
  bundle_pro: Sparkles,
  bundle_business: Sparkles,
};

export default function PricingPage({ embedded = false }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("both");
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState("PKR");

  useEffect(() => {
    api
      .get("/billing/plans")
      .then(({ data }) => setPlans(data.plans || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const visiblePlans = useMemo(() => {
    // Always show the free trial in every tab as the entry option.
    const free = plans.find((p) => p.key === "free");
    const inTab = plans.filter(
      (p) => p.channel === tab && p.key !== "free",
    );
    if (tab === "both") {
      // For bundle tab: show free + all bundle plans
      return [free, ...inTab].filter(Boolean);
    }
    // For single-channel tabs: show free + that channel's plans + bundle_pro upsell
    const bundle = plans.find((p) => p.key === "bundle_pro");
    return [free, ...inTab, bundle].filter(Boolean);
  }, [plans, tab]);

  const formatPrice = (plan) => {
    if (!plan) return "—";
    if (plan.monthlyPrice === 0) return "Free";
    if (currency === "USD") {
      const usd = annual ? Math.round(plan.usd * 10) : plan.usd;
      return `$${usd.toLocaleString()}`;
    }
    const pkr = annual ? plan.annualPrice : plan.monthlyPrice;
    return `Rs ${pkr.toLocaleString()}`;
  };

  const handlePick = (plan) => {
    if (!plan) return;
    if (plan.key === "free") {
      if (isAuthenticated) navigate("/dashboard");
      else navigate("/register");
      return;
    }
    if (!isAuthenticated) {
      navigate("/register?plan=" + plan.key);
      return;
    }
    // In-app: kick off checkout
    navigate(`/dashboard/billing?plan=${plan.key}&cycle=${annual ? "annual" : "monthly"}`);
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-canvas py-16 px-4"}>
      <div className={embedded ? "" : "max-w-7xl mx-auto"}>
        {!embedded && (
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
              Simple pricing for every channel
            </h1>
            <p className="mt-4 text-lg text-ink-500 max-w-2xl mx-auto">
              Start with a 7-day free trial. No card required. Cancel anytime.
            </p>
          </div>
        )}

        {/* Channel tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-ink-100 p-1">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              const active = tab === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setTab(c.key)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition",
                    active
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-700",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                  {c.highlight && active && (
                    <span className="ml-1 chip text-[10px] bg-brand-100 text-brand-700">
                      Best value
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cycle / currency toggles */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
          <div className="inline-flex items-center gap-2 bg-ink-100 rounded-md p-1">
            <button
              onClick={() => setAnnual(false)}
              className={clsx(
                "px-3 py-1 rounded",
                !annual ? "bg-white shadow-sm text-ink-900" : "text-ink-500",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={clsx(
                "px-3 py-1 rounded inline-flex items-center gap-2",
                annual ? "bg-white shadow-sm text-ink-900" : "text-ink-500",
              )}
            >
              Annual
              <span className="chip text-[10px] bg-emerald-100 text-emerald-700">
                Save 17%
              </span>
            </button>
          </div>
          <div className="inline-flex items-center gap-2 bg-ink-100 rounded-md p-1">
            {["PKR", "USD"].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={clsx(
                  "px-3 py-1 rounded",
                  currency === c
                    ? "bg-white shadow-sm text-ink-900"
                    : "text-ink-500",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        {loading ? (
          <div className="text-center text-ink-400 py-16">Loading plans…</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePlans.map((p) => {
              const Icon = ICONS[p.key] || Zap;
              const isFree = p.key === "free";
              const isBundle = p.channel === "both" && !isFree;
              return (
                <div
                  key={p.key}
                  className={clsx(
                    "card p-6 flex flex-col",
                    p.recommended && "border-2 border-brand-500 relative",
                    p.premium &&
                      "bg-gradient-to-br from-ink-900 to-ink-800 text-white",
                  )}
                >
                  {p.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="chip bg-brand-gradient text-white text-[11px] px-3 py-1 shadow">
                        Most popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-md flex items-center justify-center",
                        p.premium ? "bg-white/10" : "bg-brand-gradient",
                      )}
                    >
                      <Icon
                        className={clsx(
                          "w-5 h-5",
                          p.premium ? "text-accent-300" : "text-white",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={clsx(
                          "text-lg font-bold",
                          p.premium ? "text-white" : "text-ink-900",
                        )}
                      >
                        {p.name}
                      </h3>
                      <p
                        className={clsx(
                          "text-xs",
                          p.premium ? "text-white/60" : "text-ink-400",
                        )}
                      >
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div
                      className={clsx(
                        "text-3xl font-bold",
                        p.premium ? "text-white" : "text-ink-900",
                      )}
                    >
                      {formatPrice(p)}
                      {!isFree && (
                        <span
                          className={clsx(
                            "text-sm font-normal ml-1",
                            p.premium ? "text-white/50" : "text-ink-400",
                          )}
                        >
                          /{annual ? "year" : "mo"}
                        </span>
                      )}
                    </div>
                    {!isFree && (
                      <p
                        className={clsx(
                          "text-xs mt-1",
                          p.premium ? "text-white/50" : "text-ink-400",
                        )}
                      >
                        {currency === "PKR"
                          ? `≈ $${(annual ? p.usd * 10 : p.usd).toLocaleString()} ${annual ? "/yr" : "/mo"}`
                          : `≈ Rs ${(annual ? p.annualPrice : p.monthlyPrice).toLocaleString()} ${annual ? "/yr" : "/mo"}`}
                      </p>
                    )}
                    {isFree && (
                      <p className="text-xs text-ink-400 mt-1">
                        7 days · no card required
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {(p.highlights || []).slice(0, 7).map((h, i) => (
                      <li
                        key={i}
                        className={clsx(
                          "flex items-start gap-2 text-sm",
                          p.premium ? "text-white/80" : "text-ink-700",
                        )}
                      >
                        <Check
                          className={clsx(
                            "w-4 h-4 flex-shrink-0 mt-0.5",
                            p.premium ? "text-accent-300" : "text-brand-600",
                          )}
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePick(p)}
                    className={clsx(
                      "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition",
                      p.premium
                        ? "bg-accent-400 text-ink-900 hover:bg-accent-300"
                        : p.recommended
                          ? "bg-brand-gradient text-white hover:opacity-90"
                          : "bg-ink-900 text-white hover:bg-ink-800",
                    )}
                  >
                    {isFree
                      ? isAuthenticated
                        ? "Go to dashboard"
                        : "Start free trial"
                      : `Get ${p.name}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {isBundle && !p.premium && (
                    <p className="text-[11px] text-center text-ink-400 mt-2">
                      <Bot className="inline w-3 h-3 mr-1" />
                      Includes premium AI on both channels
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!embedded && (
          <div className="mt-12 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Secure checkout · Easypaisa · JazzCash · Card · Manual transfer
          </div>
        )}
      </div>
    </div>
  );
}
