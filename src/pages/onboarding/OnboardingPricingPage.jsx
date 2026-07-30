/**
 * Onboarding pricing — the paywall shown BEFORE the dashboard. A plan (card,
 * 3-day trial) is required to use Botlify; there is no free tier.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

export default function OnboardingPricingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planHint = params.get("plan");
  const { activeWorkspace, user, setActiveWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [picking, setPicking] = useState(null);
  const [autoApplied, setAutoApplied] = useState(false);

  // Pricing comes BEFORE connecting Instagram — a plan (card, 3-day trial) is
  // required first, so we do NOT redirect to the Instagram step from here.
  // A brand-new owner has no workspace yet (we don't auto-create at signup), so
  // ensure one exists — the checkout endpoint is workspace-scoped.
  useEffect(() => {
    if (activeWorkspace) {
      fetchWorkspace(activeWorkspace);
      return;
    }
    api
      .post("/workspaces/ensure", {
        name: user?.name ? `${user.name}'s Workspace` : undefined,
      })
      .then(({ data }) => {
        setActiveWorkspace(data.workspace._id);
        fetchWorkspace(data.workspace._id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      if (alive) setErrored(true);
    }, 12000);
    api
      .get("/billing/plans")
      .then(({ data }) => {
        if (!alive) return;
        setPlans(data.plans || []);
      })
      .catch(() => alive && setErrored(true))
      .finally(() => {
        if (alive) {
          setLoading(false);
          clearTimeout(t);
        }
      });
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // Start the Creem hosted checkout (3-day trial, card upfront) and redirect.
  const startCheckout = async (planKey, billingCycle = "monthly") => {
    const { data } = await api.post("/billing/creem/checkout", {
      plan: planKey,
      billingCycle,
    });
    if (data?.url) {
      window.location.href = data.url;
      return true;
    }
    throw new Error("No checkout URL");
  };

  // If they arrived with a chosen plan (?plan=), send them straight to checkout.
  useEffect(() => {
    if (autoApplied || !planHint || plans.length === 0) return;
    const plan = plans.find((p) => p.key === planHint);
    if (!plan) return;
    setAutoApplied(true);
    startCheckout(plan.key).catch(() => {
      /* fall through to the plan picker below if checkout can't start */
      setAutoApplied(false);
    });
  }, [planHint, plans, autoApplied]);

  const visiblePlans = useMemo(() => plans, [plans]);

  const pickPlan = async (plan) => {
    setPicking(plan.key);
    try {
      await startCheckout(plan.key);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Couldn't start checkout. Please try again.",
      );
      setPicking(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/onboarding/instagram")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-800 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-xs font-bold text-brand-700">
            <Sparkles className="w-3.5 h-3.5" /> Choose your plan
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tighter text-ink-950">
            Start your <span className="text-brand-500">3-day free trial</span>
          </h1>
          <p className="mt-3 text-ink-600 max-w-lg mx-auto text-[15px]">
            Pick a plan to unlock every Botlify feature. You won't be charged
            until your trial ends — cancel anytime before then.
          </p>

        </div>

        {loading && !errored && (
          <div className="text-center py-16 text-ink-400 inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading plans…
          </div>
        )}
        {errored && (
          <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
            <p className="text-sm font-semibold text-amber-800">
              Couldn't load pricing
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Please refresh and try again. If it keeps happening, email
              contactus@botlify.site.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition"
            >
              Retry <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!loading && !errored && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {visiblePlans.map((p) => (
              <PlanCard
                key={p.key}
                plan={p}
                picking={picking === p.key}
                onPick={() => pickPlan(p)}
              />
            ))}
          </div>
        )}

        {!errored && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="inline-flex items-center gap-1.5 text-[11px] text-ink-400">
              <ShieldCheck className="w-3 h-3" />
              3-day free trial · card required · cancel anytime before it ends
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, picking, onPick }) {
  // Pro is the elevated / recommended tier (dark, "Most popular").
  const isPro = plan.key === "ig_pro" || plan.premium || plan.recommended;

  return (
    <div
      className={clsx(
        "relative rounded-3xl p-7 flex flex-col transition-all duration-300",
        isPro
          ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white shadow-2xl shadow-ink-900/25 ring-1 ring-white/10 md:-translate-y-2"
          : "bg-white text-ink-900 border border-ink-200 shadow-sm hover:shadow-lg hover:-translate-y-1",
      )}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500 text-white text-[11px] font-bold shadow-glow">
            <Sparkles className="w-3 h-3" /> Most popular
          </span>
        </div>
      )}

      {/* name + tagline */}
      <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
      <p className={clsx("text-xs mt-1", isPro ? "text-white/55" : "text-ink-500")}>
        {plan.tagline}
      </p>

      {/* price */}
      <div className="mt-5 flex items-end gap-1.5">
        <span className="text-[2.6rem] leading-none font-black tracking-tighter">
          ${plan.usd}
        </span>
        <span className={clsx("text-sm mb-1", isPro ? "text-white/50" : "text-ink-400")}>
          /month
        </span>
      </div>
      <p className={clsx("text-[11px] mt-1", isPro ? "text-white/45" : "text-ink-400")}>
        Billed monthly · 3-day free trial
      </p>

      <div className={clsx("my-5 h-px", isPro ? "bg-white/10" : "bg-ink-100")} />

      {/* features */}
      <ul className="space-y-2.5 flex-1">
        {(plan.highlights || []).map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-[13px]">
            <span
              className={clsx(
                "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                isPro ? "bg-brand-500/20 text-brand-300" : "bg-brand-50 text-brand-500",
              )}
            >
              <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
            </span>
            <span className={isPro ? "text-white/85" : "text-ink-700"}>{h}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onPick}
        disabled={picking}
        className={clsx(
          "mt-7 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition disabled:opacity-60",
          isPro
            ? "bg-brand-500 text-white hover:bg-brand-600 shadow-glow"
            : "bg-ink-900 text-white hover:bg-ink-800",
        )}
      >
        {picking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Starting…
          </>
        ) : (
          <>
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className={clsx("mt-2.5 text-center text-[11px]", isPro ? "text-white/40" : "text-ink-400")}>
        3 days free, then ${plan.usd}/mo
      </p>
    </div>
  );
}
