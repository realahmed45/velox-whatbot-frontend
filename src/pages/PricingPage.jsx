import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Rocket,
  Bot,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const ICONS = { starter: Zap, growth: Rocket, scale: Sparkles };

const COMPARISON = [
  {
    group: "Core automation",
    rows: [
      {
        label: "DMs included / month",
        starter: "500",
        growth: "5,000",
        scale: "Unlimited",
      },
      {
        label: "Comment → DM triggers",
        starter: true,
        growth: true,
        scale: true,
      },
      { label: "Keyword auto-reply", starter: true, growth: true, scale: true },
      {
        label: "Welcome DM (first message)",
        starter: true,
        growth: true,
        scale: true,
      },
      {
        label: "Fallback auto-reply",
        starter: true,
        growth: true,
        scale: true,
      },
    ],
  },
  {
    group: "Advanced triggers",
    rows: [
      {
        label: "Story reply triggers",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Story mention triggers",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Share-to-story → DM",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Live-comment auto-reply",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Ref-URL deep links",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Conversation starters",
        starter: false,
        growth: true,
        scale: true,
      },
    ],
  },
  {
    group: "Engage & analyse",
    rows: [
      { label: "Team inbox seats", starter: "1", growth: "3", scale: "10" },
      {
        label: "Broadcast campaigns",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Advanced analytics",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Business-hours auto-reply",
        starter: false,
        growth: true,
        scale: true,
      },
      {
        label: "Remove Botlify branding",
        starter: false,
        growth: true,
        scale: true,
      },
    ],
  },
  {
    group: "AI conversational bot",
    rows: [
      {
        label: "AI DM bot (GPT-powered)",
        starter: false,
        growth: false,
        scale: true,
      },
      {
        label: "Trains on your FAQs & tone",
        starter: false,
        growth: false,
        scale: true,
      },
      {
        label: "Context-aware multi-turn replies",
        starter: false,
        growth: false,
        scale: true,
      },
      {
        label: "Smart human hand-off",
        starter: false,
        growth: false,
        scale: true,
      },
      {
        label: "Priority processing",
        starter: false,
        growth: false,
        scale: true,
      },
    ],
  },
];

const FAQ = [
  {
    q: "Is there a free trial?",
    a: "Better — Starter is permanently free. 500 DMs / month, no card required, all the core triggers. Upgrade only when you outgrow it.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade in one click. We pro-rate the difference and never lock you in.",
  },
  {
    q: "What makes the AI bot different from ManyChat?",
    a: "ManyChat replies with rigid keyword flows. Botlify's Scale plan ships a true conversational AI trained on your business — it answers off-script questions, qualifies leads, and only pings you when it's something real.",
  },
  {
    q: "Do you support WhatsApp & Facebook Messenger?",
    a: "Instagram is our headline. WhatsApp Business and Messenger are on the roadmap and already in private beta — ask us about it.",
  },
  {
    q: "Is this Meta-compliant?",
    a: "Yes. We use Meta's official Graph API with proper webhooks and OAuth. No browser automation, no shady tricks, no risk to your account.",
  },
  {
    q: "What happens if I exceed my plan's DM limit?",
    a: "We pause new automated replies until next cycle (or until you upgrade) — your account is never at risk and your inbox keeps working.",
  },
];

function Cell({ value }) {
  if (value === true)
    return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-ink-300 mx-auto" />;
  return <span className="text-sm font-medium text-ink-700">{value}</span>;
}

export default function PricingPage({ embedded = false }) {
  const { token, activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
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

  const Wrapper = embedded ? "div" : "div";
  const wrapperCls = embedded
    ? "p-4 sm:p-6 space-y-10"
    : "min-h-screen bg-gradient-to-b from-ink-50 via-white to-brand-50/40";

  return (
    <Wrapper className={wrapperCls}>
      <div className={embedded ? "" : "max-w-6xl mx-auto px-4 sm:px-6"}>
        {/* Hero */}
        {!embedded && (
          <div className="text-center pt-12 sm:pt-20 pb-10 sm:pb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5" /> Simple pricing
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-ink-900 mt-4">
              Pay once you've seen{" "}
              <span className="gradient-text">it work.</span>
            </h1>
            <p className="text-ink-500 text-base sm:text-lg mt-4 max-w-2xl mx-auto">
              Start free with 500 DMs a month. Upgrade when your DMs blow up.
              Click-to-activate — no card needed during testing.
            </p>
          </div>
        )}
        {embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink-900">Plans & pricing</h1>
            <p className="text-ink-500 text-sm mt-1">
              Click any plan to instantly switch. No card required while we wrap
              up payment integration.
            </p>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {plans.map((p) => {
            const Icon = ICONS[p.id] || Zap;
            const isCurrent = p.id === currentPlanId;
            const isPremium = p.premium;
            const isRecommended = p.recommended;
            return (
              <div
                key={p.id}
                className={`relative rounded-lg p-6 sm:p-7 flex flex-col transition ${
                  isPremium
                    ? "bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 text-white shadow-hero border border-accent-400/30 hover:-translate-y-1"
                    : isRecommended
                      ? "bg-white border-2 border-brand-500 shadow-glow hover:shadow-glow-lg hover:-translate-y-1"
                      : "bg-white border border-ink-200 hover:border-brand-300 hover:-translate-y-1 hover:shadow-card-lg"
                }`}
              >
                {isRecommended && !isPremium && (
                  <span className="absolute -top-3 left-6 bg-brand-gradient text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow">
                    Most Popular
                  </span>
                )}
                {isPremium && (
                  <span className="absolute -top-3 left-6 bg-premium-gradient text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow flex items-center gap-1">
                    <Bot className="w-3 h-3" /> AI Bot Included
                  </span>
                )}

                <div
                  className={`w-11 h-11 rounded-md flex items-center justify-center ${
                    isPremium
                      ? "bg-white/10 border border-white/10"
                      : "bg-brand-gradient shadow-glow"
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
                    className={`text-4xl sm:text-5xl font-bold ${isPremium ? "text-white" : "text-ink-900"}`}
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
                  {!isCurrent && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-ink-600">
          <div className="flex items-center gap-2 p-3 rounded-md border border-ink-200 bg-white">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Meta-compliant Graph API</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-md border border-ink-200 bg-white">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span>Cancel or switch in one click</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-md border border-ink-200 bg-white">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span>No card required during beta</span>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-14 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
              Compare every feature
            </h2>
            <p className="text-ink-500 mt-2">
              Honest, side-by-side. No fine print.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-ink-200 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-200">
                  <th className="text-left px-4 sm:px-6 py-4 text-xs uppercase tracking-wider text-ink-500 font-semibold">
                    Feature
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-xs uppercase tracking-wider text-ink-700 font-semibold text-center">
                    Starter
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-xs uppercase tracking-wider text-brand-700 font-semibold text-center bg-brand-50">
                    Growth
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-xs uppercase tracking-wider text-accent-700 font-semibold text-center">
                    Scale
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((section) => (
                  <Fragment key={section.group}>
                    <tr className="bg-ink-50/40">
                      <td
                        colSpan={4}
                        className="px-4 sm:px-6 py-2.5 text-[11px] uppercase tracking-wider text-ink-500 font-bold"
                      >
                        {section.group}
                      </td>
                    </tr>
                    {section.rows.map((row, i) => (
                      <tr
                        key={`${section.group}-${i}`}
                        className="border-t border-ink-100 hover:bg-ink-50/40"
                      >
                        <td className="px-4 sm:px-6 py-3 text-ink-800">
                          {row.label}
                        </td>
                        <td className="px-3 sm:px-6 py-3 text-center">
                          <Cell value={row.starter} />
                        </td>
                        <td className="px-3 sm:px-6 py-3 text-center bg-brand-50/30">
                          <Cell value={row.growth} />
                        </td>
                        <td className="px-3 sm:px-6 py-3 text-center">
                          <Cell value={row.scale} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
              Questions, answered
            </h2>
            <p className="text-ink-500 mt-2">
              Still curious?{" "}
              <Link
                to="/guide"
                className="text-brand-600 font-semibold hover:underline"
              >
                Check our setup guide
              </Link>{" "}
              or email hello@botlify.site.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  className={`text-left p-5 rounded-md border bg-white transition ${
                    open
                      ? "border-brand-400 shadow-glow"
                      : "border-ink-200 hover:border-brand-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-ink-900">{f.q}</h3>
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold transition ${
                        open
                          ? "bg-brand-gradient text-white border-transparent"
                          : "border-ink-300 text-ink-400"
                      }`}
                    >
                      {open ? "−" : "+"}
                    </span>
                  </div>
                  {open && (
                    <p className="mt-3 text-sm text-ink-600 leading-relaxed">
                      {f.a}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        {!embedded && (
          <div className="my-14 sm:my-20 relative overflow-hidden rounded-lg bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 p-8 sm:p-14 text-white shadow-hero">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent-500/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                Stop missing DMs.{" "}
                <span className="bg-gradient-to-r from-accent-300 to-brand-300 bg-clip-text text-transparent">
                  Start now.
                </span>
              </h2>
              <p className="mt-3 text-ink-200 text-base sm:text-lg">
                Free forever. No card. 500 DMs / month on the house.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register" className="btn-premium">
                  Start free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/guide"
                  className="btn bg-white/10 border border-white/15 text-white hover:bg-white/15"
                >
                  Read the setup guide
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
