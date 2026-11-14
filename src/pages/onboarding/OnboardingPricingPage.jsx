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
import { motion } from "framer-motion";
import { NumberTicker, Reveal, Spotlight } from "@/components/fx";

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
    <div className="px-4 sm:px-6 py-8 sm:py-10 text-ink-950">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/onboarding/hotel")}
          className="group inline-flex items-center gap-1.5 min-h-[40px] text-xs font-medium text-ink-600 hover:text-ink-950 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-1" />
          Back
        </button>

        <Reveal className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-900/[0.04] ring-1 ring-ink-900/[0.08] text-xs font-semibold text-ink-800">
            <Sparkles className="w-3.5 h-3.5 text-sunset-flame" /> Choose your plan
          </span>
          <h1 className="mt-5 font-display text-[34px] leading-[1.02] sm:text-6xl font-semibold tracking-[-0.045em] text-ink-950">
            Start{" "}
            <span className="font-serif italic font-normal text-sunset pr-1">free</span>{" "}
            — upgrade when you're ready
          </h1>
          <p className="mt-4 text-ink-600 max-w-lg mx-auto text-[15px]">
            OTA sync is free with 0% commission on every plan. The Pro plan adds
            the AI that answers every guest in your Airbnb, Booking.com &amp;
            Expedia inboxes and on WhatsApp — with a 3-day free trial.
          </p>
        </Reveal>

        {loading && !errored && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-[440px] rounded-3xl bg-ink-900/[0.04] ring-1 ring-ink-900/[0.08] animate-pulse" />
            ))}
            <span className="sr-only">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading plans…
            </span>
          </div>
        )}
        {errored && (
          <Reveal className="max-w-md mx-auto">
            <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-5 text-center">
              <p className="text-sm font-semibold text-amber-800">
                Couldn't load pricing
              </p>
              <p className="text-xs text-amber-800/70 mt-1">
                Please refresh and try again. If it keeps happening, email
                contactus@botlify.site.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary group mt-4 text-sm"
              >
                Retry{" "}
                <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
              </button>
            </div>
          </Reveal>
        )}

        {!loading && !errored && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {visiblePlans.map((p, i) => (
              <Reveal key={p.key} delay={i * 0.08} className="h-full">
                <PlanCard
                  plan={p}
                  picking={picking === p.key}
                  onPick={() => pickPlan(p)}
                />
              </Reveal>
            ))}
          </div>
        )}

        {!errored && (
          <>
            <CommissionSummary />

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-ink-500 text-center">
                <ShieldCheck className="w-3 h-3 shrink-0" />
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
      source: "OTA bookings — every channel you're on",
      sub: "Booking.com · Airbnb · Expedia",
      rate: "0%",
      cls: "bg-emerald-50 ring-emerald-200 text-emerald-700",
      why: "OTA sync is completely free on every channel we connect — we never take a cut.",
    },
    {
      icon: BadgePercent,
      source: "Bookings the AI closes for you",
      sub: "WhatsApp · your direct booking page",
      rate: "10%",
      cls: "bg-sunset-soft ring-sunset-flame/35 text-sunset-flame",
      why: "OTAs charge 15–18% for the same booking — and this is revenue you wouldn't otherwise have had.",
    },
    {
      icon: Plane,
      source: "Airport transfers we arrange",
      sub: "Through our partner network only",
      rate: "~5–10%",
      cls: "bg-ink-900/[0.04] ring-ink-900/15 text-ink-800",
      why: "Use your own driver and you keep 100%.",
    },
  ];

  return (
    <Reveal className="mt-12 max-w-2xl mx-auto">
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/[0.07]">
          <p className="text-sm font-display font-semibold text-ink-950 flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-sunset-flame" />
            How commission works
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            On top of the subscription — worth knowing before you pick.
          </p>
        </div>

        <ul className="divide-y divide-ink-900/[0.06]">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.source} className="group px-5 py-3.5 transition-colors hover:bg-ink-900/[0.04]">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-ink-900/[0.04] ring-1 ring-ink-900/[0.08] text-ink-600 flex items-center justify-center shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-ink-950 leading-snug">
                        {r.source}
                      </p>
                      <span
                        className={clsx(
                          "shrink-0 rounded-full ring-1 ring-inset px-2.5 py-1 text-xs font-bold tabular-nums",
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

        <div className="relative px-5 py-4 border-t border-ink-900/[0.07] bg-sunset-soft">
          <p className="text-sm font-display font-semibold text-ink-950 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sunset-flame" />
            Tracked automatically, settled manually
          </p>
          <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
            Commission is recorded in a ledger in your dashboard as bookings
            come in, and we email you a monthly statement to settle by bank
            transfer or invoice.{" "}
            <b className="text-ink-950">
              We never take money out of your account and never sit between your
              guest and your payments
            </b>{" "}
            — you always collect from the guest directly.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function PlanCard({ plan, picking, onPick }) {
  const isFree = plan.key === "hotel_free" || plan.usd === 0;
  // Pro is the elevated / recommended tier (sunset edge, "Recommended").
  const isPro = plan.key === "hotel_pro" || plan.premium || plan.recommended;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="relative h-full"
    >
      {isPro && (
        <div
          aria-hidden
          className="absolute -inset-[1.5px] rounded-[1.6rem] bg-sunset opacity-80"
        />
      )}
      {isPro && (
        <div
          aria-hidden
          className="absolute -inset-6 rounded-[2.5rem] bg-sunset opacity-[0.12] blur-3xl -z-10"
        />
      )}
      <Spotlight
        className={clsx(
          "relative h-full rounded-3xl p-6 sm:p-7 flex flex-col text-ink-950 overflow-hidden",
          isPro ? "bg-white shadow-[0_24px_60px_-28px_rgba(255,61,119,0.35)]" : "card",
        )}
      >
        {isPro && (
          <div className="absolute top-5 right-5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sunset text-white text-[11px] font-semibold shadow-[0_8px_24px_-8px_rgba(255,61,119,0.8)]">
              <Sparkles className="w-3 h-3" /> Recommended
            </span>
          </div>
        )}

        {/* name + tagline */}
        <h3 className={clsx("font-display text-xl font-semibold tracking-[-0.02em]", isPro && "pr-28")}>
          {plan.name}
        </h3>
        <p className="text-xs mt-1 text-ink-600">{plan.tagline}</p>

        {/* price */}
        <div className="mt-5 flex items-end gap-1.5">
          <span className="font-display text-[2.8rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">
            $<NumberTicker value={plan.usd ?? 0} />
          </span>
          <span className="text-sm mb-1 text-ink-500">/month</span>
        </div>
        <p className="text-[11px] mt-1.5 text-ink-500">
          {isFree
            ? "Free forever · no card required"
            : "Billed monthly · 3-day free trial · $490/yr (2 months free)"}
        </p>

        <div className="my-5 h-px bg-gradient-to-r from-transparent via-ink-900/10 to-transparent" />

        {/* features */}
        <ul className="space-y-2.5 flex-1">
          {(plan.highlights || []).map((h) => (
            <li key={h} className="flex items-start gap-2.5 text-[13px]">
              <span
                className={clsx(
                  "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                  isPro ? "bg-sunset text-white" : "bg-ink-900/[0.06] text-sunset-flame",
                )}
              >
                <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
              </span>
              <span className="text-ink-800">{h}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onPick}
          disabled={picking}
          className={clsx(
            "group mt-7 w-full h-12 text-sm",
            isPro ? "btn-primary" : "btn-secondary",
          )}
        >
          {picking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Starting…
            </>
          ) : (
            <>
              {isFree ? "Start free" : "Start 3-day trial"}
              <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
            </>
          )}
        </button>
        <p className="mt-2.5 text-center text-[11px] text-ink-400">
          {isFree ? "Upgrade anytime" : `3 days free, then $${plan.usd}/mo`}
        </p>
      </Spotlight>
    </motion.div>
  );
}
