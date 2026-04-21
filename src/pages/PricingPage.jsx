import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const ICONS = { starter: Zap, growth: Rocket, scale: Sparkles };

export default function PricingPage({ embedded = false }) {
  const { token, activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentPlanId = workspace?.subscription?.plan || "starter";

  useEffect(() => {
    api.get("/plans").then(({ data }) => setPlans(data.plans || []));
  }, []);

  const activate = async (planId) => {
    if (!token) {
      navigate("/register");
      return;
    }
    if (planId === currentPlanId) return;
    setLoading(true);
    try {
      await api.post("/plans/activate", { planId });
      await fetchWorkspace(activeWorkspace);
      toast.success(
        `${planId[0].toUpperCase() + planId.slice(1)} plan activated! 🎉`,
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not activate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? "p-4 sm:p-8" : "min-h-screen bg-ink-50"}>
      <div className="max-w-6xl mx-auto">
        {!embedded && (
          <div className="text-center pt-12 pb-8">
            <span className="badge-brand">Pricing</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink-900 mt-3">
              Simple, honest pricing
            </h1>
            <p className="text-ink-500 text-lg mt-2">
              Start free. Upgrade when you're ready. No hidden fees.
            </p>
          </div>
        )}
        {embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink-900">Pricing & Plans</h1>
            <p className="text-ink-500 text-sm mt-1">
              Click any plan below to instantly switch. No card required.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => {
            const Icon = ICONS[p.id] || Zap;
            const isCurrent = p.id === currentPlanId;
            const isPremium = p.premium;
            const isRecommended = p.recommended;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  isPremium
                    ? "bg-gradient-to-br from-ink-900 to-ink-800 text-white shadow-hero border border-accent-400/30"
                    : isRecommended
                      ? "bg-white border-2 border-brand-500 shadow-glow"
                      : "bg-white border border-ink-200"
                }`}
              >
                {isRecommended && !isPremium && (
                  <span className="absolute -top-3 left-6 bg-brand-gradient text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                )}
                {isPremium && (
                  <span className="absolute -top-3 left-6 bg-premium-gradient text-white text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Bot Included
                  </span>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isPremium ? "bg-white/10" : "bg-brand-gradient"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isPremium ? "text-accent-300" : "text-white"}`}
                  />
                </div>

                <h3
                  className={`mt-4 text-xl font-bold ${isPremium ? "text-white" : "text-ink-900"}`}
                >
                  {p.name}
                </h3>
                <p
                  className={`text-sm ${isPremium ? "text-ink-300" : "text-ink-500"}`}
                >
                  {p.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${isPremium ? "text-white" : "text-ink-900"}`}
                  >
                    {p.priceMonthly === 0
                      ? "Free"
                      : `PKR ${p.priceMonthly.toLocaleString()}`}
                  </span>
                  {p.priceMonthly > 0 && (
                    <span
                      className={`text-sm ${isPremium ? "text-ink-400" : "text-ink-500"}`}
                    >
                      /mo
                    </span>
                  )}
                </div>

                <ul
                  className={`mt-6 space-y-2.5 text-sm flex-1 ${isPremium ? "text-ink-200" : "text-ink-700"}`}
                >
                  {(p.highlights || []).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPremium ? "text-accent-400" : "text-brand-500"}`}
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={loading || isCurrent}
                  onClick={() => activate(p.id)}
                  className={
                    isCurrent
                      ? "mt-6 btn-secondary cursor-default"
                      : isPremium
                        ? "mt-6 btn-premium"
                        : isRecommended
                          ? "mt-6 btn-primary"
                          : "mt-6 btn-secondary"
                  }
                >
                  {isCurrent
                    ? "Current plan"
                    : p.priceMonthly === 0
                      ? "Start free"
                      : `Activate ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-400 mt-8">
          Click-to-activate. Payments are coming soon — for now every plan
          unlocks instantly for testing.
        </p>
      </div>
    </div>
  );
}
