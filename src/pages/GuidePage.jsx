import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Instagram,
  Bot,
  Mail,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Target,
  Rocket,
  Settings as SettingsIcon,
  HelpCircle,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: Instagram,
    title: "Connect your Instagram account",
    eyebrow: "1 min",
    description:
      "Connect your Instagram Business or Creator account via the official Meta OAuth. It takes under a minute — no app review required.",
    bullets: [
      "Click 'Connect Instagram' from the dashboard.",
      "Authorize Botlify to manage messages and comments.",
      "Your account goes live immediately after connecting.",
    ],
    cta: {
      label: "Connect Instagram",
      to: "/onboarding/instagram",
    },
    helpLink: "/dashboard/settings",
  },
  {
    id: 2,
    icon: Target,
    title: "Pick your first trigger",
    eyebrow: "5 min",
    description:
      "A trigger kicks off automation. The fastest win on Instagram is Comment → DM on a high-traffic post or reel.",
    bullets: [
      "Comment → DM — auto-DM anyone who comments a keyword.",
      "DM keyword reply — instant reply for 'price', 'link', 'sizes'.",
      "Story reply — respond automatically to story interactions.",
    ],
    cta: { label: "Create a trigger", to: "/dashboard/automation" },
    helpLink: "/dashboard/automation",
  },
  {
    id: 3,
    icon: Bot,
    title: "Set up your business profile",
    eyebrow: "10 min",
    description:
      "Add your business details, FAQs, and brand tone so automated replies stay accurate and on-brand — 24/7 on Instagram.",
    bullets: [
      "Add your website and business details.",
      "Pick a tone (friendly, professional, witty).",
      "Set handoff keywords when a team member should take over.",
    ],
    cta: { label: "Open business profile", to: "/dashboard/ai-bot" },
    helpLink: "/dashboard/ai-bot",
  },
  {
    id: 4,
    icon: Zap,
    title: "Test it on yourself",
    eyebrow: "3 min",
    description:
      "Before going live, DM your account from another Instagram. Watch it land in your Inbox, watch the AI reply, and tweak if anything feels off.",
    bullets: [
      "DM your brand account from a personal IG account.",
      "Check the Inbox to see how messages are handled.",
      "Adjust your profile if needed — changes apply instantly.",
    ],
    cta: { label: "Open Inbox", to: "/dashboard/inbox" },
    helpLink: "/dashboard/inbox",
  },
  {
    id: 5,
    icon: Rocket,
    title: "Go live & scale",
    eyebrow: "Ongoing",
    description:
      "Turn automation ON, drive traffic, and watch automated DMs roll in. Check Analytics weekly to see which triggers convert best.",
    bullets: [
      "Toggle automations Active from the Automations page.",
      "Drive traffic — story polls, Reels, paid ads, link-in-bio.",
      "Review Analytics → optimize winning triggers.",
    ],
    cta: { label: "View Analytics", to: "/dashboard/analytics" },
    helpLink: "/dashboard/analytics",
  },
];

export default function GuidePage() {
  const [done, setDone] = useState({});
  const completedCount = Object.values(done).filter(Boolean).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const toggle = (id) => setDone((d) => ({ ...d, [id]: !d[id] }));

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 p-6 sm:p-10 text-white shadow-hero">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-300 bg-white/10 backdrop-blur px-3 py-1 rounded-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Guide me
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
            From zero to your first automated DM —{" "}
            <span className="bg-gradient-to-r from-accent-300 to-brand-300 bg-clip-text text-transparent">
              in under 30 minutes.
            </span>
          </h1>
          <p className="mt-4 text-ink-200 max-w-2xl text-base sm:text-lg">
            Five focused steps. We'll walk you from picking a channel all the
            way to your AI bot replying to real DMs in your voice. Need help any
            step of the way? Scroll down — we're one click away.
          </p>

          {/* Progress */}
          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-xs text-ink-300 mb-2">
              <span>
                Step {completedCount} of {STEPS.length}
              </span>
              <span className="font-semibold text-white">{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-md overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-400 to-brand-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* What you'll set up — quick orientation */}
      <div className="rounded-lg border border-ink-200 bg-white shadow-card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-ink-900">
          What you'll set up
        </h2>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-2xl">
          Botlify turns your Instagram into a 24/7 sales and support channel.
          Follow the five steps below in order — each links straight to the page
          where you'll do it, and you can tick them off as you go. No prior
          experience needed.
        </p>
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {[
            { icon: Instagram, label: "Connect Instagram" },
            { icon: Zap, label: "Turn on automations" },
            { icon: Bot, label: "Teach your AI bot" },
          ].map(({ icon: I, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-ink-50/60 px-3.5 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                <I className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-ink-800">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 sm:space-y-5">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = !!done[step.id];
          return (
            <div
              key={step.id}
              className={`group relative rounded-lg border bg-white shadow-card transition ${
                isDone
                  ? "border-emerald-300 ring-1 ring-emerald-200"
                  : "border-ink-200 hover:border-brand-300 hover:shadow-glow"
              }`}
            >
              <div className="grid md:grid-cols-[auto,1fr,auto] gap-5 p-5 sm:p-7">
                <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2">
                  <div
                    className={`w-12 h-12 rounded-md flex items-center justify-center font-bold text-lg ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-brand-gradient text-white shadow-glow"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                  </div>
                  <div className="hidden md:flex flex-col items-center text-[10px] text-ink-400 uppercase tracking-wider">
                    <Icon className="w-4 h-4 mb-1" />
                    {step.eyebrow}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-ink-900">
                      {step.title}
                    </h3>
                    <span className="md:hidden text-[10px] uppercase tracking-wider text-ink-400 bg-ink-100 px-2 py-0.5 rounded-md">
                      {step.eyebrow}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {step.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-ink-700"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={step.cta.to} className="btn-primary">
                      {step.cta.label} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggle(step.id)}
                      className={
                        isDone
                          ? "btn bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "btn-secondary"
                      }
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Marked done
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" /> Mark as done
                        </>
                      )}
                    </button>
                    <Link
                      to={step.helpLink}
                      className="btn-ghost text-ink-500 hover:text-brand-600"
                    >
                      <HelpCircle className="w-4 h-4" /> Need help?
                    </Link>
                  </div>
                </div>

                <div className="hidden md:flex items-start">
                  <div className="text-[10px] uppercase tracking-wider text-ink-300">
                    Step {idx + 1}/{STEPS.length}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact card */}
      <div className="relative overflow-hidden rounded-lg border border-ink-200 bg-gradient-to-br from-white to-brand-50/40 p-6 sm:p-10 shadow-card">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="badge badge-brand">Stuck somewhere?</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-ink-900">
              We'll set it up <span className="gradient-text">with you</span>.
            </h2>
            <p className="mt-2 text-ink-600 text-sm sm:text-base leading-relaxed">
              Email us, drop a chat, or hop on a quick call — we'll personally
              walk through your account, help you pick the right first trigger,
              and tune the AI bot to your voice. No upsell, no pressure.
            </p>
          </div>
          <div className="space-y-3">
            <a
              href="mailto:botlify.support@gmail.com"
              className="flex items-center gap-3 p-4 rounded-md border border-ink-200 bg-white hover:border-brand-400 hover:shadow-glow transition group"
            >
              <span className="w-10 h-10 rounded-md bg-brand-gradient flex items-center justify-center shadow-glow">
                <Mail className="w-5 h-5 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900">
                  Email us
                </div>
                <div className="text-xs text-ink-500 truncate">
                  botlify.support@gmail.com — we reply within a few hours
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              href="mailto:botlify.support@gmail.com"
              className="flex items-center gap-3 p-4 rounded-md border border-ink-200 bg-white hover:border-brand-400 hover:shadow-glow transition group"
            >
              <span className="w-10 h-10 rounded-md bg-brand-400 flex items-center justify-center shadow">
                <Mail className="w-5 h-5 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900">
                  Email support
                </div>
                <div className="text-xs text-ink-500 truncate">
                  botlify.support@gmail.com — we reply fast
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
            </a>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 p-4 rounded-md border border-ink-200 bg-white hover:border-brand-400 hover:shadow-glow transition group"
            >
              <span className="w-10 h-10 rounded-md bg-ink-900 flex items-center justify-center shadow">
                <SettingsIcon className="w-5 h-5 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900">
                  Account settings
                </div>
                <div className="text-xs text-ink-500 truncate">
                  Workspace, team & notifications
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
