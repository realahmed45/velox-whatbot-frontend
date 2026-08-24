/**
 * Onboarding pricing — the plan-picker shown BEFORE the dashboard.
 * Two hotel plans: Launch (Free) activates instantly with no checkout;
 * Botlify for Hotels starts a Creem checkout (3-day trial, card upfront).
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
  BadgePercent,
  Wallet,
  Plane,
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

  // Start checkout. hotel_free returns {activated:true, url} — no external
  // checkout, just follow the url. Paid plans redirect to Creem.
  const startCheckout = async (planKey, billingCycle = "monthly") => {
    const { data } = await api.post("/billing/creem/checkout", {
      plan: planKey,
      billingCycle,
    });
    if (data?.activated) {
      toast.success("You're on the free plan — welcome!");
      window.location.href = data.url || "/dashboard";
      return true;
    }
    if (data?.url) {
      window.location.href = data.url;
      return true;
    }
    throw new Error("No checkout URL");
  };

  // If they arrived with a chosen plan (?plan=), send them straight through.
  useEffect(() => {
    if (autoApplied || !planHint || plans.length === 0) return;
    const plan = plans.find((p) => p.key === planHint);
    if (!plan) return;
    setAutoApplied(true);
    startCheckout(plan.key).catch(() => {
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
          onClick={() => navigate("/onboarding/hotel")}
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
            Start <span className="text-brand-500">free</span> — upgrade when
            you're ready
          </h1>
          <p className="mt-3 text-ink-600 max-w-lg mx-auto text-[15px]">
            OTA sync is free with 0% commission on every plan. The Pro plan adds
            the full AI concierge on WhatsApp &amp; Instagram — with a 3-day
            free trial.
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
          <>
            <CommissionSummary />

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-ink-400">
                <ShieldCheck className="w-3 h-3" />
                Free plan needs no card · Pro has a 3-day free trial · cancel
                anytime
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The commission model, shown before they pick a plan so there are no
 * surprises later. Mirrors the public pricing page.
 */
function CommissionSummary() {
  const rows = [
    {
      icon: Check,
      source: "OTA bookings — all 60+ channels",
      sub: "Booking.com · Airbnb · Agoda · Expedia · Traveloka · Tiket.com · and 50 more",
      rate: "0%",
      cls: "bg-emerald-50 border-emerald-100 text-emerald-700",
      why: "OTA sync is completely free on every one of the 60+ channels — we never take a cut.",
    },
    {
      icon: BadgePercent,
      source: "Bookings the AI closes for you",
      sub: "WhatsApp · Instagram · Messenger · Telegram · your direct page",
      rate: "10%",
      cls: "bg-brand-50 border-brand-200 text-brand-700",
      why: "OTAs charge 15–18% for the same booking — and this is revenue you wouldn't otherwise have had.",
    },
    {
      icon: Plane,
      source: "Airport transfers we arrange",
      sub: "Through our partner network only",
      rate: "~5–10%",
      cls: "bg-ink-100 border-ink-200 text-ink-700",
      why: "Use your own driver and you keep 100%.",
    },
  ];

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <div className="rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-ink-100 bg-ink-50/60">
          <p className="text-sm font-black text-ink-900 flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-brand-500" />
            How commission works
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            On top of the subscription — worth knowing before you pick.
          </p>
        </div>

        <ul className="divide-y divide-ink-100">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.source} className="px-5 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-ink-50 text-ink-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-ink-900 leading-snug">
                        {r.source}
                      </p>
                      <span
                        className={clsx(
                          "shrink-0 rounded-full border px-2.5 py-1 text-xs font-black",
                          r.cls,
                        )}
                      >
                        {r.rate}
                      </span>
                    </div>
                    {r.sub && (
                      <p className="mt-0.5 text-[11px] text-ink-400 leading-snug">
                        {r.sub}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                      {r.why}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="px-5 py-4 bg-brand-50/50 border-t border-brand-100">
          <p className="text-sm font-black text-ink-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand-500" />
            Tracked automatically, settled manually
          </p>
          <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
            Commission is recorded in a ledger in your dashboard as bookings
            come in, and we email you a monthly statement to settle by bank
            transfer or invoice.{" "}
            <b className="text-ink-900">
              We never take money out of your account and never sit between your
              guest and your payments
            </b>{" "}
            — you always collect from the guest directly.
          </p>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, picking, onPick }) {
  const isFree = plan.key === "hotel_free" || plan.usd === 0;
  // Pro is the elevated / recommended tier (dark, "Recommended").
  const isPro = plan.key === "hotel_pro" || plan.premium || plan.recommended;

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
            <Sparkles className="w-3 h-3" /> Recommended
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
          ${plan.usd ?? 0}
        </span>
        <span className={clsx("text-sm mb-1", isPro ? "text-white/50" : "text-ink-400")}>
          /month
        </span>
      </div>
      <p className={clsx("text-[11px] mt-1", isPro ? "text-white/45" : "text-ink-400")}>
        {isFree
          ? "Free forever · no card required"
          : "Billed monthly · 3-day free trial · $490/yr (2 months free)"}
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
            {isFree ? "Start free" : "Start 3-day trial"}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className={clsx("mt-2.5 text-center text-[11px]", isPro ? "text-white/40" : "text-ink-400")}>
        {isFree ? "Upgrade anytime" : `3 days free, then $${plan.usd}/mo`}
      </p>
    </div>
  );
}
