/**
 * Public + embedded pricing page — Instagram-only, two plans.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Sparkles,
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

export default function PricingPage({ embedded = false }) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = !!token;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      if (alive) setErrored(true);
    }, 12000);
    api
      .get("/billing/plans")
      .then(({ data }) => alive && setPlans(data.plans || []))
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

  const starter = plans.find((p) => p.key === "ig_starter");
  const pro = plans.find((p) => p.key === "ig_pro");

  const handlePick = async (plan) => {
    if (!plan) return;
    if (!isAuthenticated) {
      navigate(`/register?plan=${plan.key}&channel=instagram`);
      return;
    }
    if (embedded) {
      setSelecting(plan.key);
      try {
        // Start a card subscription — Xendit collects the card on its hosted
        // page, then auto-charges every cycle. We redirect there.
        const { data } = await api.post("/billing/initiate", {
          plan: plan.key,
          billingCycle: "monthly",
          paymentMethod: "card",
        });
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        toast.error("Could not start checkout. Please try again.");
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Card payments aren't available yet. Please try again later.",
        );
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold border border-pink-100">
              <Instagram className="w-3 h-3" /> Instagram automation · 3-day free trial
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-ink-900">
              Simple, honest pricing
            </h1>
            <p className="mt-3 text-base text-ink-500 max-w-lg mx-auto">
              One platform, all your Instagram automations. Start free for 3 days — no credit card needed.
            </p>
          </div>
        )}

        {loading && !errored && (
          <div className="text-center text-ink-400 py-16 inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading plans…
          </div>
        )}

        {errored && (
          <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-sm font-bold text-amber-800">Couldn't load live pricing</p>
            <p className="text-xs text-amber-700 mt-1.5">
              Sign up and we'll start your 3-day free trial — pick a plan anytime from Billing.
            </p>
            <button
              onClick={() =>
                isAuthenticated ? navigate("/dashboard") : navigate("/register")
              }
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition"
            >
              {isAuthenticated ? "Go to dashboard" : "Start free trial"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!loading && !errored && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Basic */}
            {starter && (
              <PlanCard
                plan={starter}
                onPick={handlePick}
                selecting={selecting === starter.key}
              />
            )}
            {/* Pro — highlighted */}
            {pro && (
              <PlanCard
                plan={pro}
                onPick={handlePick}
                selecting={selecting === pro.key}
                highlight
              />
            )}
          </div>
        )}

        {!embedded && (
          <>
            {/* Feature comparison note */}
            <div className="mt-10 max-w-2xl mx-auto bg-pink-50/60 border border-pink-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-ink-900">All plans include</p>
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
                      <div key={f} className="flex items-center gap-1.5 text-xs text-ink-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure card checkout · auto-renews · cancel anytime
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, onPick, selecting, highlight }) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl p-6 flex flex-col border transition",
        highlight
          ? "border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.2)] bg-white"
          : "border-ink-100 bg-white hover:border-ink-200",
      )}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 text-white text-[11px] font-bold shadow">
            Most popular
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
          highlight
            ? "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600"
            : "bg-ink-100",
        )}
      >
        <Instagram className={clsx("w-5 h-5", highlight ? "text-white" : "text-ink-600")} />
      </div>

      <h3 className="text-xl font-black tracking-tight text-ink-900">{plan.name}</h3>
      <p className="text-xs mt-0.5 text-ink-500">{plan.tagline}</p>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-ink-900">${plan.usd}</span>
          <span className="text-sm text-ink-400">/mo</span>
        </div>
        <p className="text-[11px] mt-0.5 text-ink-400">
          ≈ Rs {plan.monthlyPrice?.toLocaleString()} /mo · 3-day free trial
        </p>
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {(plan.highlights || []).map((h) => (
          <li key={h} className="flex items-start gap-2 text-xs text-ink-700">
            <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
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
            ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 text-white hover:opacity-90"
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
