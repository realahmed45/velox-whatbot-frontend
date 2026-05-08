/**
 * Public + embedded pricing page.
 *
 * Three plans only: Basic ($8 — one platform), Pro ($15 — both),
 * Business ($39 — 3 WA numbers + IG). Every plan is paid; 3-day free
 * trial included. The Basic card has a WhatsApp/Instagram toggle so
 * the user picks which platform they want.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Sparkles,
  MessageSquare,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Loader2,
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
  const [basicChannel, setBasicChannel] = useState("whatsapp"); // wa | ig toggle inside Basic card
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

  const basic = useMemo(() => {
    const key = basicChannel === "instagram" ? "ig_starter" : "wa_starter";
    return plans.find((p) => p.key === key);
  }, [plans, basicChannel]);
  const pro = useMemo(() => plans.find((p) => p.key === "bundle_pro"), [plans]);
  const business = useMemo(
    () => plans.find((p) => p.key === "bundle_business"),
    [plans],
  );

  // Map plan key → channel hint for the post-signup flow
  const planToChannel = (key) => {
    if (key === "wa_starter") return "whatsapp";
    if (key === "ig_starter") return "instagram";
    return "both"; // bundle_pro / bundle_business
  };

  const handlePick = async (plan) => {
    if (!plan) return;
    if (!isAuthenticated) {
      const channel = planToChannel(plan.key);
      navigate(`/register?plan=${plan.key}&channel=${channel}`);
      return;
    }
    if (embedded) {
      setSelecting(plan.key);
      try {
        await api.post("/billing/select-plan", {
          plan: plan.key,
          billingCycle: "monthly",
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
    // Logged in but on PUBLIC pricing page — go straight into onboarding
    // pricing step with that plan pre-selected.
    const channel = planToChannel(plan.key);
    navigate(`/onboarding/pricing?channel=${channel}&plan=${plan.key}`);
  };

  const cards = [basic, pro, business].filter(Boolean);

  return (
    <div className={embedded ? "" : "py-16 px-4"}>
      <div className={embedded ? "" : "max-w-5xl mx-auto"}>
        {!embedded && (
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
              <Sparkles className="w-3 h-3" /> 3-day free trial on every plan
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-ink-900">
              Simple, honest pricing
            </h1>
            <p className="mt-3 text-base text-ink-500 max-w-xl mx-auto">
              Pick the plan that matches the channels you want to automate.
              Cancel anytime — no surprises.
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
            <p className="text-sm font-bold text-amber-800">
              Couldn't load live pricing
            </p>
            <p className="text-xs text-amber-700 mt-1.5">
              Sign up and we'll start your 3-day free trial — pick a plan
              anytime from Billing.
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

        {!loading && !errored && cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Basic */}
            {basic && (
              <PlanCard
                plan={basic}
                onPick={handlePick}
                selecting={selecting === basic.key}
                topSlot={
                  <div className="inline-flex rounded-md bg-ink-100 p-0.5 mb-4">
                    <button
                      onClick={() => setBasicChannel("whatsapp")}
                      className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition",
                        basicChannel === "whatsapp"
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-ink-500",
                      )}
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </button>
                    <button
                      onClick={() => setBasicChannel("instagram")}
                      className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition",
                        basicChannel === "instagram"
                          ? "bg-white text-pink-700 shadow-sm"
                          : "text-ink-500",
                      )}
                    >
                      <Instagram className="w-3 h-3" /> Instagram
                    </button>
                  </div>
                }
              />
            )}
            {/* Pro */}
            {pro && (
              <PlanCard
                plan={pro}
                onPick={handlePick}
                selecting={selecting === pro.key}
                highlight
              />
            )}
            {/* Business */}
            {business && (
              <PlanCard
                plan={business}
                onPick={handlePick}
                selecting={selecting === business.key}
                premium
              />
            )}
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

function PlanCard({ plan, onPick, selecting, topSlot, highlight, premium }) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl p-6 flex flex-col border transition",
        highlight
          ? "border-brand-500 shadow-glow bg-white"
          : premium
            ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-800"
            : "border-ink-100 bg-white hover:border-ink-200",
      )}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-brand-gradient text-white text-[11px] font-bold shadow">
            Most popular
          </span>
        </div>
      )}

      {topSlot}

      <h3
        className={clsx(
          "text-xl font-black tracking-tight",
          premium ? "text-white" : "text-ink-900",
        )}
      >
        {plan.name}
      </h3>
      <p
        className={clsx(
          "text-xs mt-0.5",
          premium ? "text-white/60" : "text-ink-500",
        )}
      >
        {plan.tagline}
      </p>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span
            className={clsx(
              "text-4xl font-black",
              premium ? "text-white" : "text-ink-900",
            )}
          >
            ${plan.usd}
          </span>
          <span
            className={clsx(
              "text-sm",
              premium ? "text-white/50" : "text-ink-400",
            )}
          >
            /mo
          </span>
        </div>
        <p
          className={clsx(
            "text-[11px] mt-0.5",
            premium ? "text-white/50" : "text-ink-400",
          )}
        >
          ≈ Rs {plan.monthlyPrice?.toLocaleString()} /mo · 3-day free trial
        </p>
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {(plan.highlights || []).slice(0, 7).map((h) => (
          <li
            key={h}
            className={clsx(
              "flex items-start gap-2 text-xs",
              premium ? "text-white/80" : "text-ink-700",
            )}
          >
            <Check
              className={clsx(
                "w-3.5 h-3.5 flex-shrink-0 mt-0.5",
                premium ? "text-emerald-300" : "text-emerald-500",
              )}
            />
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
            ? "bg-brand-gradient text-white hover:opacity-90"
            : premium
              ? "bg-white text-ink-900 hover:bg-ink-100"
              : "bg-ink-900 text-white hover:bg-ink-800",
        )}
      >
        {selecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Activating…
          </>
        ) : (
          <>
            Start {plan.name.split("—")[0].trim()}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
