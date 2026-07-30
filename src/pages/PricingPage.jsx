/**
 * Public + embedded pricing page — Instagram-only, two plans.
 * Always renders plans (local fallback) so it works without login even
 * if the live /billing/plans endpoint is unavailable.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Zap,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { clsx } from "clsx";

/* Local fallback — mirrors backend plan catalog so pricing always shows. */
const FALLBACK_PLANS = [
  {
    key: "ig_starter",
    id: "ig_starter",
    name: "Basic — Instagram",
    tagline: "Instagram only · automate DMs and comments",
    usd: 9,
    monthlyPrice: 2520,
    trialDays: 3,
    highlights: [
      "1 Instagram account",
      "1,000 conversations/month",
      "Comment → DM, story replies, ice breakers",
      "AI smart replies (200/day)",
      "Basic analytics",
    ],
  },
  {
    key: "ig_pro",
    id: "ig_pro",
    name: "Instagram Pro",
    tagline: "Unlimited convos + premium AI",
    usd: 19,
    monthlyPrice: 5499,
    trialDays: 3,
    recommended: true,
    highlights: [
      "Unlimited conversations",
      "Unlimited contacts",
      "Premium AI · context-aware",
      "Broadcasts + drip campaigns",
      "Advanced analytics",
      "Team inbox (3 seats)",
      "Remove Botlify branding",
    ],
  },
];

// Tier rank for plans (higher = more features).
const TIER = { ig_starter: 1, ig_pro: 2 };
// Normalise a stored billing cycle to our toggle values.
const normCycle = (c) => (c === "annual" || c === "yearly" ? "yearly" : "monthly");

export default function PricingPage({
  embedded = false,
  currentPlan = null,
  currentCycle = null,
}) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = !!token;

  // Start with the fallback so the page is never blank / never redirects.
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [selecting, setSelecting] = useState(null);
  // Default the toggle to the user's current cycle so the "obvious" upgrade
  // (same plan, other cycle) is easy to see.
  const [cycle, setCycle] = useState(
    currentCycle ? normCycle(currentCycle) : "monthly",
  );

  const curCycle = currentCycle ? normCycle(currentCycle) : null;
  const curTier = currentPlan ? TIER[currentPlan] || 0 : 0;

  // Decide how a given plan card should behave relative to the current plan.
  // Returns "current" (their active plan+cycle — disabled), "downgrade" (hide),
  // or "offer" (a valid upgrade they can pick).
  const cardState = (planKey) => {
    if (!currentPlan) return "offer"; // trial / no plan → everything is pickable
    const tier = TIER[planKey] || 0;
    if (planKey === currentPlan && cycle === curCycle) return "current";
    if (tier < curTier) return "downgrade"; // lower tier → not shown
    // Same tier: only the OTHER cycle is a meaningful move (monthly → yearly).
    if (tier === curTier && cycle === curCycle) return "current";
    return "offer";
  };

  useEffect(() => {
    let alive = true;
    api
      .get("/billing/plans")
      .then(({ data }) => {
        if (alive && data?.plans?.length) setPlans(data.plans);
      })
      .catch(() => {
        /* keep the fallback plans — never block the page */
      });
    return () => {
      alive = false;
    };
  }, []);

  const starter = plans.find((p) => p.key === "ig_starter") || plans[0];
  const pro =
    plans.find((p) => p.key === "ig_pro") ||
    plans.find((p) => p.recommended) ||
    plans[1];

  const handlePick = async (plan) => {
    if (!plan) return;
    // Not logged in → register first, carrying the chosen plan so we can send
    // them to checkout right after signup.
    if (!isAuthenticated) {
      navigate(`/register?plan=${plan.key}&channel=instagram`);
      return;
    }

    // Logged in → start the Creem hosted checkout (3-day trial, card upfront)
    // and redirect the browser to it.
    setSelecting(plan.key);
    try {
      const billingCycle = cycle === "yearly" ? "annual" : "monthly";
      const { data } = await api.post("/billing/creem/checkout", {
        plan: plan.key,
        billingCycle,
      });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Couldn't start checkout. Please try again.",
      );
      setSelecting(null);
    }
  };

  return (
    <div className={embedded ? "" : "py-16 px-4"}>
      <div className={embedded ? "" : "max-w-4xl mx-auto"}>
        {!embedded && (
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
              <Instagram className="w-3 h-3" /> Instagram automation · 3-day free
              trial
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-ink-900">
              Simple, honest <span className="text-brand-500">pricing</span>
            </h1>
            <p className="mt-3 text-base text-ink-500 max-w-lg mx-auto">
              One platform, all your Instagram automations. Start free for 3 days
              — no credit card needed.
            </p>
          </div>
        )}

        <BillingToggle cycle={cycle} setCycle={setCycle} />

        {(() => {
          const cards = [
            starter && { plan: starter, highlight: false },
            pro && { plan: pro, highlight: true },
          ].filter(Boolean);
          const visible = cards.filter(
            (c) => cardState(c.plan.key) !== "downgrade",
          );
          if (visible.length === 0) {
            // Already on the top plan + cycle — nothing to upgrade to.
            return (
              <div className="max-w-md mx-auto text-center rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                <p className="font-bold text-ink-900">
                  You're on our top plan 🎉
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  Instagram Pro ({curCycle === "yearly" ? "yearly" : "monthly"})
                  — you already have every feature. Nothing to upgrade.
                </p>
              </div>
            );
          }
          return (
            <div
              className={clsx(
                "grid grid-cols-1 gap-6 mx-auto",
                visible.length > 1 ? "md:grid-cols-2 max-w-2xl" : "max-w-sm",
              )}
            >
              {visible.map(({ plan, highlight }) => {
                const state = cardState(plan.key);
                return (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    cycle={cycle}
                    onPick={handlePick}
                    selecting={selecting === plan.key}
                    highlight={highlight}
                    isCurrent={state === "current"}
                    ctaVerb={currentPlan ? "Switch to" : "Start"}
                  />
                );
              })}
            </div>
          );
        })()}

        {!embedded && (
          <>
            {/* Feature comparison note */}
            <div className="mt-10 max-w-2xl mx-auto bg-brand-50/60 border border-brand-100 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-ink-900">
                    All plans include
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {[
                      "Comment → DM automation",
                      "Story reply triggers",
                      "DM keyword auto-reply",
                      "AI chatbot",
                      "Visual flow builder",
                      "3-day free trial",
                      "Story mention alerts",
                      "Real-time inbox",
                    ].map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-ink-600"
                      >
                        <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Secure card checkout · 3-day free trial · Cancel anytime
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BillingToggle({ cycle, setCycle }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-ink-100 border border-ink-200">
        <button
          onClick={() => setCycle("monthly")}
          className={clsx(
            "px-4 py-1.5 rounded-full text-sm font-bold transition",
            cycle === "monthly"
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-500 hover:text-ink-800",
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setCycle("yearly")}
          className={clsx(
            "px-4 py-1.5 rounded-full text-sm font-bold transition inline-flex items-center gap-1.5",
            cycle === "yearly"
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-500 hover:text-ink-800",
          )}
        >
          Yearly
          <span className="text-[10px] font-black uppercase tracking-wide bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
            2 months free
          </span>
        </button>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  cycle,
  onPick,
  selecting,
  highlight,
  isCurrent,
  ctaVerb = "Start",
}) {
  const isYearly = cycle === "yearly";
  // Annual = 10× monthly (2 months free), matching the backend catalog.
  const usd = isYearly ? plan.usd * 10 : plan.usd;
  const per = isYearly ? "/yr" : "/mo";

  return (
    <div
      className={clsx(
        "relative rounded-2xl p-6 flex flex-col border transition",
        highlight
          ? "border-brand-300 shadow-glow bg-white"
          : "border-ink-100 bg-white hover:border-brand-200 hover:shadow-card",
      )}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-[11px] font-bold shadow-glow">
            Most popular
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
          highlight ? "bg-brand-500" : "bg-brand-50",
        )}
      >
        <Instagram
          className={clsx("w-5 h-5", highlight ? "text-white" : "text-brand-500")}
        />
      </div>

      <h3 className="text-xl font-black tracking-tight text-ink-900">
        {plan.name}
      </h3>
      <p className="text-xs mt-0.5 text-ink-500">{plan.tagline}</p>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-ink-900">${usd}</span>
          <span className="text-sm text-ink-400">{per}</span>
        </div>
        <p className="text-[11px] mt-0.5 text-ink-400">
          {isYearly ? "2 months free" : "3-day free trial"}
        </p>
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {(plan.highlights || []).map((h) => (
          <li key={h} className="flex items-start gap-2 text-xs text-ink-700">
            <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-500" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-4 h-4" /> Your current plan
        </div>
      ) : (
        <button
          onClick={() => onPick(plan)}
          disabled={selecting}
          className={clsx(
            "mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-60",
            highlight
              ? "bg-brand-500 text-white hover:bg-brand-600 shadow-glow"
              : "bg-ink-900 text-white hover:bg-ink-800",
          )}
        >
          {selecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Activating…
            </>
          ) : (
            <>
              {ctaVerb} {plan.name} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
