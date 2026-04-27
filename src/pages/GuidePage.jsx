import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Instagram,
  Bot,
  PlayCircle,
  Mail,
  MessageSquare,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Target,
  Rocket,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: Instagram,
    title: "Connect your Instagram",
    eyebrow: "2 min",
    description:
      "We use Meta's official Graph API. Your Instagram must be a Business or Creator account, linked to a Facebook Page. Botlify never stores your password — we use Meta's secure OAuth flow.",
    bullets: [
      "Switch to Business / Creator account inside the IG app (free).",
      "Link it to a Facebook Page you manage.",
      "Click Connect Instagram in your dashboard and approve the permissions.",
    ],
    cta: { label: "Connect Instagram", to: "/dashboard/automation" },
    helpLink: "/dashboard/integrations",
  },
  {
    id: 2,
    icon: Target,
    title: "Pick your first trigger",
    eyebrow: "5 min",
    description:
      "A trigger is what kicks off automation. The fastest win for most accounts is a comment-to-DM trigger on a high-traffic post — comment a keyword, get a DM with your link or offer.",
    bullets: [
      "Choose Comment → DM, Keyword DM, or Story Reply.",
      "Pick the post (or all posts) and the keyword(s).",
      "Set a friendly opening message.",
    ],
    cta: { label: "Create a trigger", to: "/dashboard/automation" },
    helpLink: "/dashboard/flow-builder",
  },
  {
    id: 3,
    icon: Bot,
    title: "Configure the AI bot",
    eyebrow: "10 min",
    description:
      "This is where Botlify shines. Train the AI in your own voice — paste your FAQs, your offers, your refund policy, your tone. The bot replies to every DM 24/7, answering questions, qualifying leads, and routing only complex chats to you.",
    bullets: [
      "Paste your business info, FAQs, and pricing.",
      "Pick a tone (friendly, professional, witty).",
      "Set fallback rules — when to hand off to a human.",
    ],
    cta: { label: "Open AI Bot setup", to: "/dashboard/ai-bot" },
    helpLink: "/dashboard/ai-bot",
  },
  {
    id: 4,
    icon: Zap,
    title: "Test it on yourself",
    eyebrow: "3 min",
    description:
      "Before you go live, send a DM from a test account (or a friend's IG). Watch it land in your Inbox, watch the AI reply, and tweak the responses if anything feels off.",
    bullets: [
      "DM your account from another phone or a friend.",
      "Watch the live conversation in Inbox.",
      "Edit the bot's training if needed — changes apply instantly.",
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
      "Turn the trigger ON, post about it on your story (\"Comment 'PRICE' to get details\"), and watch automated DMs roll in. Check Analytics weekly to see what's converting.",
    bullets: [
      "Toggle the automation Active.",
      "Drive traffic — story polls, Reels, paid ads.",
      "Review Analytics → optimise winning triggers.",
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
            Five focused steps. We'll walk you from connecting Instagram all the
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

      {/* Video placeholder */}
      <div className="relative overflow-hidden rounded-lg border border-ink-200 bg-white shadow-card">
        <div className="grid md:grid-cols-[1.2fr,1fr]">
          <div className="relative aspect-video md:aspect-auto bg-gradient-to-br from-ink-900 to-brand-900 flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-dark opacity-20" />
            <button
              type="button"
              className="relative group flex flex-col items-center gap-3 text-white"
              disabled
              aria-label="Walkthrough video coming soon"
            >
              <span className="w-20 h-20 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center group-hover:scale-105 transition shadow-glow">
                <PlayCircle className="w-10 h-10" />
              </span>
              <span className="text-xs uppercase tracking-wider text-white/70">
                Coming soon
              </span>
            </button>
          </div>
          <div className="p-6 sm:p-8">
            <span className="badge badge-brand">Video walkthrough</span>
            <h2 className="mt-3 text-2xl font-bold text-ink-900">
              60-second setup video
            </h2>
            <p className="mt-2 text-ink-600 text-sm leading-relaxed">
              We're filming a tight, jargon-free walkthrough that takes you from
              sign-up to your first automated reply. While we wrap that up,
              follow the written steps below — they're step-for-step identical.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-ink-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Drops next week. Bookmark this page.</span>
            </div>
          </div>
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

                  {/* Screenshot placeholder */}
                  <div className="mt-5 rounded-md border border-dashed border-ink-200 bg-ink-50 px-4 py-6 text-center text-xs text-ink-400">
                    <Icon className="w-5 h-5 mx-auto mb-1 text-ink-300" />
                    Screenshot — coming with the video walkthrough
                  </div>

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
              href="mailto:hello@botlify.site"
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
                  hello@botlify.site — we reply within a few hours
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              href="https://wa.me/923000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-md border border-ink-200 bg-white hover:border-brand-400 hover:shadow-glow transition group"
            >
              <span className="w-10 h-10 rounded-md bg-emerald-500 flex items-center justify-center shadow">
                <MessageSquare className="w-5 h-5 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900">
                  Chat with founder
                </div>
                <div className="text-xs text-ink-500 truncate">
                  WhatsApp — fastest way to get unstuck
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
