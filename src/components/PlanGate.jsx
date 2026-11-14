import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PlanGate — wraps feature UI; shows upsell overlay if workspace plan
 * doesn't include the feature.
 *
 * Ranks map BOTH the live plan ids (free / ig_starter / ig_pro) and the legacy
 * tier names (starter / growth / scale) that the automation tabs use for their
 * `requiredPlan` value, so an ig_starter/ig_pro subscriber isn't wrongly locked
 * out of features their plan includes.
 */
const PLAN_RANK = {
  // live plan ids
  free: 0,
  ig_starter: 1,
  ig_pro: 2,
  // legacy / tier aliases (map to the closest live tier)
  starter: 1,
  growth: 1,
  scale: 2,
  business: 2,
  agency: 2,
};

export default function PlanGate({
  currentPlan = "free",
  requiredPlan = "ig_starter",
  feature = "",
  lifetime = false,
  children,
  compact = false,
}) {
  const navigate = useNavigate();
  // Lifetime/comped accounts get everything. Otherwise compare tier ranks.
  const hasAccess =
    lifetime ||
    (PLAN_RANK[currentPlan] ?? 0) >= (PLAN_RANK[requiredPlan] ?? 1);

  if (hasAccess) return children;

  const Icon = Sparkles;
  const cta = "Upgrade to Pro";

  if (compact) {
    return (
      <div className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-dashed border-sunset-flame/30 bg-sunset-soft p-3">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/80 text-sunset-flame shadow-[inset_0_1px_0_#fff] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span>
            Available on the <b>Pro</b> plan
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/pricing")}
          className="btn-primary text-xs py-1.5 px-3"
        >
          {cta}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1.5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md">
        <div className="glass-strong relative max-w-sm rounded-3xl px-6 py-8 text-center animate-pop-in">
          <div className="relative mx-auto mb-4 h-14 w-14">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-25 blur-2xl animate-glow-pulse" />
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_28px_-10px_rgba(255,61,119,0.7)]">
              <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
            </div>
          </div>
          <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
            {feature || "Premium feature"}
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            This feature is available on the <b>Pro</b> plan.
          </p>
          <button
            onClick={() => navigate("/dashboard/pricing")}
            className={
              requiredPlan === "scale" ? "btn-premium mt-4" : "btn-primary mt-4"
            }
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
