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
import OtaLogo from "@/components/OtaLogo";
import { AnimatePresence, motion } from "framer-motion";
import { Aurora, Reveal, SlidingTabs, Spotlight } from "@/components/fx";

/* Local fallback — mirrors backend plan catalog so pricing always shows. */
const FALLBACK_PLANS = [
  {
    key: "hotel_free",
    id: "hotel_free",
    name: "Launch (Free)",
    tagline: "Full access while we launch — no card needed",
    usd: 0,
    highlights: [
      "Booking.com, Airbnb & Expedia sync (free)",
      "AI replies on WhatsApp & in Airbnb, Booking.com and Expedia inboxes",
      "Bot books rooms & reservations 24/7",
      "Airport pickup & drop-off for guests",
      "Unified inbox with human takeover",
    ],
  },
  {
    key: "hotel_pro",
    id: "hotel_pro",
    name: "Botlify for Hotels",
    tagline: "Everything your hotel needs to take bookings on autopilot",
    usd: 49,
    trialDays: 3,
    recommended: true,
    highlights: [
      "Booking.com, Airbnb & Expedia sync (free, 0% commission)",
      "AI replies on WhatsApp & in Airbnb, Booking.com and Expedia inboxes",
      "Bot books rooms & reservations 24/7",
      "Airport pickup & drop-off for guests",
      "Unified inbox with human takeover",
      "Only 10% on bookings the bot closes for you",
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

  // Both the public page and the embedded dashboard variant are light.
  const dark = false;

  return (
    <div
      className={
        embedded
          ? ""
          : "relative isolate overflow-hidden bg-[#FBFAF8] text-ink-950 py-20 sm:py-28 px-4"
      }
    >
      {!embedded && (
        <>
          <Aurora />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-dot-grid mask-fade-b opacity-50"
          />
        </>
      )}
      <div className={embedded ? "" : "relative max-w-4xl mx-auto"}>
        {!embedded && (
          <div className="text-center mb-12">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-ink-700 text-xs font-semibold ring-1 ring-ink-900/[0.08] shadow-sm">
                <Hotel className="w-3.5 h-3.5 text-sunset-flame" strokeWidth={1.8} />{" "}
                The AI channel manager for hotels
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.95] text-ink-950">
                Simple, honest{" "}
                <span className="font-serif italic font-normal tracking-[-0.02em] text-sunset pr-1">
                  pricing
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-[15px] sm:text-base text-ink-600 max-w-lg mx-auto leading-relaxed">
                Booking.com, Airbnb and Expedia sync free with 0% commission, and
                the AI answers every guest in those inboxes and on WhatsApp. We
                only earn 10% on bookings the AI closes for you — start free,
                upgrade when you're ready.
              </p>
            </Reveal>
          </div>
        )}

        <BillingToggle cycle={cycle} setCycle={setCycle} dark={dark} />

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
              <Reveal>
                <div
                  className={clsx(
                    "max-w-md mx-auto text-center p-6",
                    "card ring-1 ring-emerald-500/15",
                  )}
                >
                  <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">
                    <Check className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <p
                    className={clsx(
                      "font-display font-semibold tracking-[-0.02em]",
                      "text-ink-900",
                    )}
                  >
                    You're on our top plan 🎉
                  </p>
                  <p
                    className={clsx(
                      "text-sm mt-1",
                      "text-ink-500",
                    )}
                  >
                    Botlify for Hotels ({curCycle === "yearly" ? "yearly" : "monthly"})
                    — you already have every feature. Nothing to upgrade.
                  </p>
                </div>
              </Reveal>
            );
          }
          return (
            <div
              className={clsx(
                "grid grid-cols-1 gap-6 mx-auto pt-3",
                visible.length > 1 ? "md:grid-cols-2 max-w-2xl" : "max-w-sm",
              )}
            >
              {visible.map(({ plan, highlight }, i) => {
                const state = cardState(plan.key);
                return (
                  <Reveal key={plan.key} delay={0.08 + i * 0.08} className="h-full">
                    <PlanCard
                      plan={plan}
                      cycle={cycle}
                      onPick={handlePick}
                      selecting={selecting === plan.key}
                      highlight={highlight}
                      isCurrent={state === "current"}
                      dark={dark}
                    />
                  </Reveal>
                );
              })}
            </div>
          );
        })()}

        {!embedded && (
          <>
            {/* Feature comparison note */}
            <Reveal className="mt-12 max-w-2xl mx-auto">
              <Spotlight className="card group p-5 sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                    <Zap className="w-5 h-5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold tracking-[-0.02em] text-ink-950">
                      Every plan includes
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {[
                        "Booking.com, Airbnb & Expedia sync",
                        "0% commission on OTA bookings",
                        "AI replies in every OTA inbox",
                        "AI replies on WhatsApp, 24/7",
                        "One availability calendar",
                        "10% only on AI-closed bookings",
                        "Direct & manual bookings",
                        "No setup fees",
                      ].map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-2 text-[13px] text-ink-700"
                        >
                          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sunset-soft text-sunset-flame">
                            <Check className="w-3 h-3" strokeWidth={2.4} />
                          </span>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Spotlight>
            </Reveal>

            <Reveal className="mt-10 max-w-3xl mx-auto">
              <LiveOtaStrip />
            </Reveal>

            <CommissionPanel />

            <Reveal>
              <div className="mt-10 text-center text-sm text-ink-500 flex flex-wrap items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
                Start free · Pro has a 3-day free trial · Cancel anytime
              </div>
            </Reveal>
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
    source: "OTA bookings",
    sub: "Booking.com · Airbnb · Expedia — more OTAs coming",
    rate: "0%",
    tone: "emerald",
    why: "OTA sync is completely free. We never take a cut of a reservation that arrived through an OTA — even when the AI answered the guest in the OTA inbox.",
  },
  {
    icon: BadgePercent,
    source: "Bookings the AI closes",
    sub: "WhatsApp · your direct page",
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
  emerald: "bg-emerald-50 ring-emerald-500/20 text-emerald-700",
  brand: "bg-sunset-soft ring-sunset-flame/25 text-sunset-flame",
  ink: "bg-ink-900/[0.04] ring-ink-900/[0.08] text-ink-600",
};

function CommissionPanel() {
  return (
    <Reveal className="mt-6 max-w-2xl mx-auto">
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/[0.06]">
          <p className="font-display text-base font-semibold tracking-[-0.02em] text-ink-950 flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
            And the commission, in full
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            On top of the flat subscription — three lines, no small print.
          </p>
        </div>

        <ul className="divide-y divide-ink-900/[0.06]">
          {COMMISSION_ROWS.map((r, i) => {
            const Icon = r.icon;
            return (
              <Reveal as="li" key={r.source} delay={i * 0.06} y={12}>
                <div className="group px-5 py-4 transition-colors duration-300 hover:bg-ink-900/[0.02]">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-sunset-soft text-sunset-flame flex items-center justify-center shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-ink-900 leading-snug">
                          {r.source}
                        </p>
                        <span
                          className={clsx(
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ring-1 ring-inset",
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
                </div>
              </Reveal>
            );
          })}
        </ul>

        <div className="relative px-5 py-4 border-t border-ink-900/[0.06] bg-sunset-soft">
          <p className="font-display text-sm font-semibold text-ink-950 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
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
    </Reveal>
  );
}

/** The OTAs that are live today — named honestly; the rest are coming. */
const LIVE_OTAS = [
  { key: "booking", name: "Booking.com" },
  { key: "airbnb", name: "Airbnb" },
  { key: "expedia", name: "Expedia" },
];

function LiveOtaStrip() {
  return (
    <div className="card px-5 py-6 text-center">
      <p className="font-display text-base font-semibold tracking-[-0.02em] text-ink-950">
        0% commission on every OTA booking
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {LIVE_OTAS.map((o) => (
          <span
            key={o.key}
            className="inline-flex items-center gap-2 rounded-full bg-white pl-1 pr-3 py-1 text-xs font-semibold text-ink-800 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff]"
          >
            <OtaLogo channelKey={o.key} name={o.name} size={20} />
            {o.name}
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-label="Live" />
          </span>
        ))}
        <span className="inline-flex items-center rounded-full border border-dashed border-ink-900/[0.15] px-3 py-1 text-xs font-semibold text-ink-500">
          More OTAs coming
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-500 leading-relaxed max-w-md mx-auto">
        Two-way sync through our connectivity partner, with no per-channel fee —
        and the AI answers guest messages inside each OTA's inbox.
      </p>
    </div>
  );
}

function BillingToggle({ cycle, setCycle, dark }) {
  return (
    <div className="flex justify-center mb-8">
      <SlidingTabs
        dark={dark}
        value={cycle}
        onChange={setCycle}
        className="max-w-full"
        items={[
          { value: "monthly", label: "Monthly" },
          {
            value: "yearly",
            label: (
              <span className="inline-flex items-center gap-1.5">
                Yearly
                <span
                  className={clsx(
                    "text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                    "bg-sunset-soft text-sunset-flame",
                  )}
                >
                  2 months free
                </span>
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

function PlanCard({ plan, cycle, onPick, selecting, highlight, isCurrent, dark }) {
  const isFree = plan.key === "hotel_free" || plan.usd === 0;
  const isYearly = cycle === "yearly";
  // Annual = 10× monthly (2 months free), matching the backend catalog.
  const usd = isFree ? 0 : isYearly ? (plan.yearlyUsd ?? plan.usd * 10) : plan.usd;
  const per = isFree ? "" : isYearly ? "/yr" : "/mo";

  const surface = highlight ? "bg-white text-ink-900" : "card";

  const body = (
    <Spotlight
      className={clsx(
        "group relative h-full rounded-[1.4rem] p-6 sm:p-7 flex flex-col",
        surface,
        highlight && "shadow-[inset_0_1px_0_#fff]",
      )}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="relative inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sunset text-white text-[11px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-6px_rgba(255,61,119,0.6)] whitespace-nowrap">
            <Sparkles className="h-3 w-3" strokeWidth={2} /> Recommended
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className={clsx(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-8deg]",
          highlight
            ? "bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-10px_rgba(255,61,119,0.7)]"
            : "bg-sunset-soft text-sunset-flame",
        )}
      >
        {highlight ? (
          <Sparkles className="w-5 h-5" strokeWidth={1.8} />
        ) : (
          <Hotel className="w-5 h-5" strokeWidth={1.8} />
        )}
      </div>

      <h3
        className={clsx(
          "font-display text-xl font-semibold tracking-[-0.03em]",
          "text-ink-900",
        )}
      >
        {plan.name}
      </h3>
      <p className={clsx("text-[13px] mt-1", "text-ink-500")}>
        {plan.tagline}
      </p>

      <div className="mt-5">
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${usd}${per}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className={clsx(
                "font-display text-5xl font-semibold tracking-[-0.04em] tabular-nums",
                "text-ink-900",
              )}
            >
              ${usd}
            </motion.span>
          </AnimatePresence>
          {per && (
            <span className={clsx("text-sm", "text-ink-400")}>
              {per}
            </span>
          )}
        </div>
        <p className={clsx("text-[11px] mt-1", "text-ink-400")}>
          {isFree
            ? "No card required"
            : isYearly
              ? "2 months free"
              : "3-day free trial"}
        </p>
      </div>

      <div className={clsx("my-5 h-px", "divider")} />

      <ul className="space-y-2.5 flex-1">
        {(plan.highlights || []).map((h) => (
          <li
            key={h}
            className={clsx(
              "flex items-start gap-2.5 text-[13px]",
              "text-ink-700",
            )}
          >
            <span
              className={clsx(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                highlight
                  ? "bg-sunset text-white"
                  : "bg-sunset-soft text-sunset-flame",
              )}
            >
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
            </span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div
          className={clsx(
            "mt-7 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ring-1 ring-inset",
            "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
          )}
        >
          <Check className="w-4 h-4" /> Your current plan
        </div>
      ) : (
        <button
          onClick={() => onPick(plan)}
          disabled={selecting}
          className={clsx(
            "group/btn mt-7 w-full",
            highlight ? "btn-primary" : "btn-secondary",
          )}
        >
          {selecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Activating…
            </>
          ) : (
            <>
              {isFree ? "Start free" : "Start 3-day trial"}
              <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/btn:translate-x-1" />
            </>
          )}
        </button>
      )}
    </Spotlight>
  );

  if (!highlight) {
    return (
      <motion.div
        className="h-full"
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        {body}
      </motion.div>
    );
  }

  // Recommended plan: a static sunset ring — the gradient behind a 1.5px
  // inset card, plus a soft bloom underneath (painted once, never animated).
  return (
    <motion.div
      className="relative h-full rounded-[1.5rem] p-[1.5px] isolate"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div
        aria-hidden
        className="absolute -inset-3 -z-20 rounded-[2rem] bg-sunset opacity-15 blur-2xl"
      />
      <div aria-hidden className="absolute inset-0 -z-10 rounded-[1.5rem] bg-sunset" />
      {body}
    </motion.div>
  );
}
