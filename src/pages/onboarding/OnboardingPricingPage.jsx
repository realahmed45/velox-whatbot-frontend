/**
 * Onboarding pricing — shown AFTER Instagram is connected (pay later).
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
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [picking, setPicking] = useState(null);
  const [autoApplied, setAutoApplied] = useState(false);

  const igConnected = workspace?.instagram?.status === "connected";

  useEffect(() => {
    if (activeWorkspace) fetchWorkspace(activeWorkspace);
  }, [activeWorkspace, fetchWorkspace]);

  useEffect(() => {
    if (!igConnected && workspace) {
      navigate("/onboarding/instagram", { replace: true });
    }
  }, [igConnected, workspace, navigate]);

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

  useEffect(() => {
    if (autoApplied || !planHint || plans.length === 0) return;
    const plan = plans.find((p) => p.key === planHint);
    if (!plan) return;
    setAutoApplied(true);
    (async () => {
      try {
        await api.post("/billing/select-plan", {
          plan: plan.key,
          billingCycle: "monthly",
        });
        toast.success(`${plan.name} activated`);
      } catch {
        /* non-fatal */
      }
      navigate("/dashboard", { replace: true });
    })();
  }, [planHint, plans, autoApplied, navigate]);

  const visiblePlans = useMemo(() => plans, [plans]);

  const goDashboard = () => navigate("/dashboard");

  const pickPlan = async (plan) => {
    setPicking(plan.key);
    try {
      await api.post("/billing/select-plan", {
        plan: plan.key,
        billingCycle: "monthly",
      });
      toast.success(`${plan.name} selected`);
      goDashboard();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Couldn't activate plan — you can choose one later in Billing.",
      );
      goDashboard();
    } finally {
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

        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-brand-200 text-xs font-bold text-brand-700 shadow-sm">
            <Sparkles className="w-3 h-3" /> Final step · Choose a plan
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-ink-900">
            You're connected — pick a plan
          </h1>
          <p className="mt-3 text-ink-600 max-w-xl mx-auto text-sm">
            Start with a free trial. Upgrade anytime from Billing — your
            automations are already ready to configure.
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
              Continue with your trial — pick a plan anytime from Billing.
            </p>
            <button
              onClick={goDashboard}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition"
            >
              Go to dashboard <ArrowRight className="w-4 h-4" />
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
            <button
              type="button"
              onClick={goDashboard}
              className="text-sm font-semibold text-ink-600 hover:text-ink-900 underline-offset-2 hover:underline"
            >
              Continue with free trial — choose a plan later
            </button>
            <p className="inline-flex items-center gap-1.5 text-[11px] text-ink-400">
              <ShieldCheck className="w-3 h-3" />
              3-day free trial · cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, picking, onPick }) {
  const isRecommended = plan.recommended;
  const isPremium = plan.premium;
  return (
    <div
      className={clsx(
        "rounded-2xl p-6 flex flex-col border transition",
        isRecommended
          ? "border-brand-500 shadow-glow relative bg-white"
          : "border-ink-100 bg-white hover:border-ink-200",
        isPremium && "bg-gradient-to-br from-ink-900 to-ink-800 text-white",
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-brand-gradient text-white text-[11px] font-bold shadow">
            Most popular
          </span>
        </div>
      )}

      <h3
        className={clsx(
          "text-lg font-black tracking-tight",
          isPremium ? "text-white" : "text-ink-900",
        )}
      >
        {plan.name}
      </h3>
      <p
        className={clsx(
          "text-xs mt-0.5",
          isPremium ? "text-white/60" : "text-ink-500",
        )}
      >
        {plan.tagline}
      </p>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span
            className={clsx(
              "text-3xl font-black",
              isPremium ? "text-white" : "text-ink-900",
            )}
          >
            ${plan.usd}
          </span>
          <span
            className={clsx(
              "text-sm",
              isPremium ? "text-white/50" : "text-ink-400",
            )}
          >
            /mo
          </span>
        </div>
        <p
          className={clsx(
            "text-[11px] mt-0.5",
            isPremium ? "text-white/50" : "text-ink-400",
          )}
        >
          ≈ Rs {plan.monthlyPrice?.toLocaleString()} /mo
        </p>
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {(plan.highlights || []).map((h) => (
          <li
            key={h}
            className={clsx(
              "flex items-start gap-2 text-xs",
              isPremium ? "text-white/80" : "text-ink-700",
            )}
          >
            <Check
              className={clsx(
                "w-3.5 h-3.5 flex-shrink-0 mt-0.5",
                isPremium ? "text-emerald-300" : "text-emerald-500",
              )}
            />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onPick}
        disabled={picking}
        className={clsx(
          "mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-60",
          isRecommended
            ? "bg-brand-gradient text-white hover:opacity-90 shadow-glow"
            : isPremium
              ? "bg-white text-ink-900 hover:bg-ink-100"
              : "bg-ink-900 text-white hover:bg-ink-800",
        )}
      >
        {picking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Activating…
          </>
        ) : (
          <>
            Start with {plan.name}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
