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
    usd: 8,
    monthlyPrice: 2240,
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

export default function PricingPage({ embedded = false }) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = !!token;

  // Start with the fallback so the page is never blank / never redirects.
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [selecting, setSelecting] = useState(null);
  const [cycle, setCycle] = useState("monthly"); // "monthly" | "yearly"

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
    if (!isAuthenticated) {
      navigate(`/register?plan=${plan.key}&channel=instagram`);
      return;
    }
    if (embedded) {
      setSelecting(plan.key);
      try {
        await api.post("/billing/select-plan", {
          plan: plan.key,
          billingCycle: cycle,
        });
        toast.success(`Switched to ${plan.name}`);
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to switch plan");
      } finally {
        setSelecting(null);
      }
      return;
    }
    navigate(`/onboarding/pricing?channel=instagram&plan=${plan.key}`);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {starter && (
            <PlanCard
              plan={starter}
              cycle={cycle}
              onPick={handlePick}
              selecting={selecting === starter.key}
            />
          )}
          {pro && (
            <PlanCard
              plan={pro}
              cycle={cycle}
              onPick={handlePick}
              selecting={selecting === pro.key}
              highlight
            />
          )}
        </div>

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
              Secure checkout · Easypaisa · JazzCash · Card · Manual transfer
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

function PlanCard({ plan, cycle, onPick, selecting, highlight }) {
  const isYearly = cycle === "yearly";
  // Annual = 10× monthly (2 months free), matching the backend catalog.
  const usd = isYearly ? plan.usd * 10 : plan.usd;
  const pkr = isYearly
    ? (plan.monthlyPrice || 0) * 10
    : plan.monthlyPrice || 0;
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
          ≈ Rs {pkr.toLocaleString()} {per}
          {isYearly ? " · 2 months free" : " · 3-day free trial"}
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
            Start {plan.name} <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
