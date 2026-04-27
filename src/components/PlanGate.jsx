import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PlanGate — wraps feature UI; shows upsell overlay if workspace plan
 * doesn't include the feature.
 */
const PLAN_RANK = { starter: 0, growth: 1, scale: 2 };

export default function PlanGate({
  currentPlan = "starter",
  requiredPlan = "growth",
  feature = "",
  children,
  compact = false,
}) {
  const navigate = useNavigate();
  const hasAccess =
    (PLAN_RANK[currentPlan] ?? 0) >= (PLAN_RANK[requiredPlan] ?? 1);

  if (hasAccess) return children;

  const Icon = requiredPlan === "scale" ? Sparkles : Lock;
  const cta =
    requiredPlan === "scale" ? "Upgrade to Scale" : "Upgrade to Growth";

  if (compact) {
    return (
      <div className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/40 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <Icon className="w-4 h-4 text-brand-600" />
          <span>
            Available on <b className="capitalize">{requiredPlan}</b> plan
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
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-md">
        <div className="text-center max-w-sm px-6 py-8">
          <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-gradient mb-3 shadow-glow">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-ink-900">
            {feature || "Premium feature"}
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            This feature is available on the{" "}
            <b className="capitalize">{requiredPlan}</b> plan and above.
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
