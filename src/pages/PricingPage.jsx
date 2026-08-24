/**
 * Public + embedded pricing page — hotel product, two plans:
 *   hotel_free  "Launch (Free)"      $0 — activates instantly, no checkout.
 *   hotel_pro   "Botlify for Hotels" $49/mo · $490/yr — 3-day trial via Creem.
 * Always renders plans (local fallback) so it works without login even
 * if the live /billing/plans endpoint is unavailable.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Hotel,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  Zap,
  BadgePercent,
  Wallet,
  Plane,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { clsx } from "clsx";
import ChannelWall from "@/components/ChannelWall";

/* Local fallback — mirrors backend plan catalog so pricing always shows. */
const FALLBACK_PLANS = [
  {
    key: "hotel_free",
    id: "hotel_free",
    name: "Launch (Free)",
    tagline: "Get synced and take bookings — free forever",
    usd: 0,
    highlights: [
      "60+ OTA channels synced — free, 0% commission",
      "1 property, unlimited rooms",
      "Bookings dashboard & calendar",
      "Manual & direct bookings — unlimited",
      "AI concierge on WhatsApp",
      "10% only on bookings the bot closes",
    ],
  },
  {
    key: "hotel_pro",
    id: "hotel_pro",
    name: "Botlify for Hotels",
    tagline: "The full AI receptionist for your hotel",
    usd: 49,
    trialDays: 3,
    recommended: true,
    highlights: [
      "Everything in Launch",
      "AI concierge on WhatsApp & Instagram",
      "Books rooms, quotes prices & answers guests 24/7",
      "Airport transfers for your guests",
      "Unified inbox across every channel",
      "Broadcasts & pre-arrival messages",
      "Team access & priority support",
    ],
  },
];

// Tier rank for plans (higher = more features).
const TIER = { hotel_free: 1, hotel_pro: 2 };
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
  const [cycle, setCycle] = useState(
    currentCycle ? normCycle(currentCycle) : "monthly",
  );

  const curCycle = currentCycle ? normCycle(currentCycle) : null;
  const curTier = currentPlan ? TIER[currentPlan] || 0 : 0;

  // "current" (their active plan+cycle — disabled), "downgrade" (hide), or
  // "offer" (a valid move they can pick).
  const cardState = (planKey) => {
    if (!currentPlan) return "offer";
    const tier = TIER[planKey] || 0;
    if (planKey === currentPlan && (planKey === "hotel_free" || cycle === curCycle))
      return "current";
    if (tier < curTier) return "downgrade";
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

  const free = plans.find((p) => p.key === "hotel_free") || plans[0];
  const pro =
    plans.find((p) => p.key === "hotel_pro") ||
    plans.find((p) => p.recommended) ||
    plans[1];

  const handlePick = async (plan) => {
    if (!plan) return;
    // Not logged in → register first, carrying the chosen plan.
    if (!isAuthenticated) {
      navigate(`/register?plan=${plan.key}`);
      return;
    }

    setSelecting(plan.key);
    try {
      const billingCycle = cycle === "yearly" ? "annual" : "monthly";
      const { data } = await api.post("/billing/creem/checkout", {
        plan: plan.key,
        billingCycle,
      });
      // Free plan activates instantly — no external checkout, just follow the
      // returned url into the app.
      if (data?.activated) {
        toast.success("Free plan activated!");
        window.location.href = data.url || "/dashboard";
        return;
      }
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
              <Hotel className="w-3 h-3" /> Your hotel's AI receptionist
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-ink-900">
              Simple, honest <span className="text-brand-500">pricing</span>
            </h1>
            <p className="mt-3 text-base text-ink-500 max-w-lg mx-auto">
              OTA sync is free with 0% commission. We only earn 10% on bookings
              the AI closes for you — start free, upgrade when you're ready.
            </p>
          </div>
        )}

        <BillingToggle cycle={cycle} setCycle={setCycle} />

        {(() => {
          const cards = [
            free && { plan: free, highlight: false },
            pro && { plan: pro, highlight: true },
          ].filter(Boolean);
          const visible = cards.filter(
            (c) => cardState(c.plan.key) !== "downgrade",
          );
          if (visible.length === 0) {
            return (
              <div className="max-w-md mx-auto text-center rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                <p className="font-bold text-ink-900">
                  You're on our top plan 🎉
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  Botlify for Hotels ({curCycle === "yearly" ? "yearly" : "monthly"})
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
                    Every plan includes
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {[
                      "60+ OTA channels synced",
                      "0% commission on OTA bookings",
                      "Bookings dashboard",
                      "Availability calendar",
                      "AI concierge on WhatsApp",
                      "10% only on bot-closed bookings",
                      "Direct & manual bookings",
                      "No setup fees",
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

            <ChannelWall
              className="mt-10 max-w-3xl mx-auto"
              size="compact"
              align="center"
              title="0% commission on all 60+ booking channels"
              subtitle="Two-way sync on every one of them, through our connectivity partner — with no per-channel fee."
            />

            <CommissionPanel />

            <div className="mt-8 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Start free · Pro has a 3-day free trial · Cancel anytime
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The commission model, stated plainly. Two numbers plus the transfer margin,
 * and — the part hotels actually want to know — how it's settled.
 */
const COMMISSION_ROWS = [
  {
    icon: Check,
    source: "OTA bookings — all 60+ channels",
    sub: "Booking.com · Airbnb · Agoda · Expedia · Traveloka · Tiket.com · and 50 more",
    rate: "0%",
    tone: "emerald",
    why: "OTA sync is completely free. We never take a cut of a reservation that arrived through an OTA.",
  },
  {
    icon: BadgePercent,
    source: "Bookings the AI closes",
    sub: "WhatsApp · Instagram · Messenger · Telegram · your direct page",
    rate: "10%",
    tone: "brand",
    why: "OTAs charge 15–18% for the same reservation — this is cheaper, and it's on revenue you wouldn't otherwise have had.",
  },
  {
    icon: Plane,
    source: "Airport transfers",
    sub: "Only when we arrange one through our partner network",
    rate: "~5–10%",
    tone: "ink",
    why: "A small partner margin. Hotels with their own driver keep 100%.",
  },
];

const TONES = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  brand: "bg-brand-50 border-brand-200 text-brand-700",
  ink: "bg-ink-100 border-ink-200 text-ink-700",
};

function CommissionPanel() {
  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <div className="rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100 bg-ink-50/60">
          <p className="text-sm font-black text-ink-900 flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-brand-500" />
            And the commission, in full
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            On top of the flat subscription — three lines, no small print.
          </p>
        </div>

        <ul className="divide-y divide-ink-100">
          {COMMISSION_ROWS.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.source} className="px-5 py-4">
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
                          TONES[r.tone],
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
                    <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
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
            Every commissionable booking is recorded in a ledger in your
            dashboard as it happens, and we email you a statement each month.
            You settle it by bank transfer or invoice.{" "}
            <b className="text-ink-900">
              Botlify never takes money out of your account and never sits
              between your guest and your payments
            </b>{" "}
            — the hotel always collects from the guest directly.
          </p>
        </div>
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

function PlanCard({ plan, cycle, onPick, selecting, highlight, isCurrent }) {
  const isFree = plan.key === "hotel_free" || plan.usd === 0;
  const isYearly = cycle === "yearly";
  // Annual = 10× monthly (2 months free), matching the backend catalog.
  const usd = isFree ? 0 : isYearly ? (plan.yearlyUsd ?? plan.usd * 10) : plan.usd;
  const per = isFree ? "" : isYearly ? "/yr" : "/mo";

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
            Recommended
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
        {highlight ? (
          <Sparkles className="w-5 h-5 text-white" />
        ) : (
          <Hotel className="w-5 h-5 text-brand-500" />
        )}
      </div>

      <h3 className="text-xl font-black tracking-tight text-ink-900">
        {plan.name}
      </h3>
      <p className="text-xs mt-0.5 text-ink-500">{plan.tagline}</p>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-ink-900">${usd}</span>
          {per && <span className="text-sm text-ink-400">{per}</span>}
        </div>
        <p className="text-[11px] mt-0.5 text-ink-400">
          {isFree
            ? "No card required"
            : isYearly
              ? "2 months free"
              : "3-day free trial"}
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
              {isFree ? "Start free" : "Start 3-day trial"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
