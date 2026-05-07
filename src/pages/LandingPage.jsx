import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Hash,
  MessageCircle,
  Send,
  Sparkles,
  Zap,
  Bot,
  Users,
  TrendingUp,
  ShoppingBag,
  Megaphone,
  Heart,
  Share2,
  Clock,
  Shield,
  Rocket,
  PlayCircle,
  Mail,
  Phone,
  Star,
  LayoutDashboard,
  Workflow,
  Inbox,
  BarChart3,
  Image as ImageIcon,
  AtSign,
  Reply,
  Tag,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Logo from "@/components/Logo";

/* ────────────────────────────────────────────────────────────
 * Brand inline marks
 * ──────────────────────────────────────────────────────────── */
function WhatsAppMark({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.05 4.91A10 10 0 0 0 4.94 19.04L4 23l4.06-1.06a10 10 0 0 0 14.94-9A9.94 9.94 0 0 0 19.05 4.91zM12 21.02a8 8 0 0 1-4.08-1.12l-.29-.17l-2.41.63l.65-2.35l-.19-.3A8 8 0 1 1 20.02 13a7.94 7.94 0 0 1-8.02 8.02zm4.61-5.83c-.25-.13-1.49-.74-1.72-.82c-.23-.08-.4-.13-.57.13c-.17.25-.65.82-.8 1c-.15.17-.3.19-.55.06c-.25-.13-1.06-.39-2.02-1.24a7.6 7.6 0 0 1-1.4-1.74c-.15-.25 0-.39.11-.51c.11-.11.25-.3.38-.45c.13-.15.17-.25.25-.42c.08-.17 0-.32-.04-.45c-.06-.13-.57-1.38-.78-1.89c-.21-.5-.42-.43-.57-.44h-.49c-.17 0-.45.06-.69.32c-.23.25-.9.88-.9 2.15c0 1.27.92 2.5 1.05 2.67c.13.17 1.81 2.77 4.39 3.88c.61.26 1.09.42 1.46.54c.61.19 1.17.17 1.61.1c.49-.07 1.49-.61 1.7-1.2c.21-.6.21-1.11.15-1.21c-.06-.1-.23-.16-.48-.29z"
      />
    </svg>
  );
}
function InstagramMark({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA77" />
          <stop offset="35%" stopColor="#F58529" />
          <stop offset="65%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#8134AF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#igGrad)"
        d="M12 2.16c3.2 0 3.58 0 4.85.07c1.17.05 1.8.25 2.23.41c.56.22.96.48 1.38.9c.42.42.68.82.9 1.38c.16.42.36 1.06.41 2.23c.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41c-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23c-.07-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23c.22-.56.48-.96.9-1.38c.42-.42.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07a8.94 8.94 0 0 0-2.96.57a5.96 5.96 0 0 0-2.16 1.4A5.96 5.96 0 0 0 .54 4.2a8.94 8.94 0 0 0-.57 2.95C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95a8.94 8.94 0 0 0 .57 2.96a5.96 5.96 0 0 0 1.4 2.16a5.96 5.96 0 0 0 2.16 1.4a8.94 8.94 0 0 0 2.95.57C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07a8.94 8.94 0 0 0 2.96-.57a6.22 6.22 0 0 0 3.56-3.56a8.94 8.94 0 0 0 .57-2.95c.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95a8.94 8.94 0 0 0-.57-2.96a5.96 5.96 0 0 0-1.4-2.16a5.96 5.96 0 0 0-2.16-1.4a8.94 8.94 0 0 0-2.95-.57C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12A6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4a4 4 0 0 1-4 4m6.41-11.85a1.44 1.44 0 1 0 1.44 1.44a1.44 1.44 0 0 0-1.44-1.44"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Top nav
 * ──────────────────────────────────────────────────────────── */
function TopNav() {
  const token = useAuthStore((s) => s.token);
  const isAuthed = !!token;
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600">
          <a href="#platforms" className="hover:text-ink-900">
            Platforms
          </a>
          <a href="#automations" className="hover:text-ink-900">
            Automations
          </a>
          <a href="#results" className="hover:text-ink-900">
            Results
          </a>
          <Link to="/pricing" className="hover:text-ink-900">
            Pricing
          </Link>
          <Link to="/guide" className="hover:text-ink-900">
            Guide
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link to="/dashboard" className="btn-primary text-sm shadow-glow">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex btn-ghost text-sm"
              >
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Start free
              </Link>
            </>
          )}
          <button
            className="md:hidden ml-1 p-2 rounded-md hover:bg-ink-50"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            <ChevronDown
              className={`w-5 h-5 transition ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white px-4 py-3 space-y-2 text-sm font-medium text-ink-700">
          <a
            href="#platforms"
            onClick={() => setOpen(false)}
            className="block py-1.5"
          >
            Platforms
          </a>
          <a
            href="#automations"
            onClick={() => setOpen(false)}
            className="block py-1.5"
          >
            Automations
          </a>
          <a
            href="#results"
            onClick={() => setOpen(false)}
            className="block py-1.5"
          >
            Results
          </a>
          <Link to="/pricing" className="block py-1.5">
            Pricing
          </Link>
          <Link to="/guide" className="block py-1.5">
            Guide
          </Link>
        </div>
      )}
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-32 w-[36rem] h-[36rem] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute top-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0)_0%,#fff_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Copy */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-ink-200 shadow-sm text-xs font-semibold text-ink-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Your go-to automation platform
              <span className="ml-1 text-ink-400">·</span>
              <WhatsAppMark className="w-3.5 h-3.5 text-emerald-600" />
              <InstagramMark className="w-3.5 h-3.5" />
            </span>

            <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-ink-950 leading-[1.02]">
              Turn every{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                WhatsApp
              </span>
              <br className="hidden sm:block" /> &{" "}
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
                Instagram
              </span>{" "}
              chat into a customer.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink-600 max-w-2xl leading-relaxed">
              Botlify is the automation platform that runs your DMs, comments,
              broadcasts and AI replies — on autopilot. Set up once. Sells while
              you sleep.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-ink-950 text-white font-bold text-sm hover:bg-ink-900 transition shadow-xl"
              >
                Start free — 14 days
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#automations"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-white border border-ink-200 text-ink-800 font-bold text-sm hover:border-ink-400 transition"
              >
                <PlayCircle className="w-4 h-4" /> See what it automates
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> No credit
                card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Connect both
                channels separately
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Cancel
                anytime
              </span>
            </div>
          </div>

          {/* Phone mockups */}
          <div className="lg:col-span-5 relative">
            <ChatMockups />
          </div>
        </div>

        {/* Supported platforms strip */}
        <div
          id="platforms"
          className="mt-16 sm:mt-20 rounded-2xl border border-ink-100 bg-white/70 backdrop-blur p-5 sm:p-6 shadow-card"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink-500 text-center">
            Supported platforms
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2.5 text-ink-800">
              <WhatsAppMark className="w-7 h-7 text-emerald-600" />
              <span className="font-bold text-lg">WhatsApp</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Cloud API
              </span>
            </div>
            <div className="h-8 w-px bg-ink-100 hidden sm:block" />
            <div className="flex items-center gap-2.5 text-ink-800">
              <InstagramMark className="w-7 h-7" />
              <span className="font-bold text-lg">Instagram</span>
              <span className="text-[10px] uppercase font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                Graph API
              </span>
            </div>
            <div className="h-8 w-px bg-ink-100 hidden sm:block" />
            <div className="flex items-center gap-2 text-ink-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="italic">Messenger & Telegram coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Phone chat mockups (WA + IG side by side) */
function ChatMockups() {
  return (
    <div className="relative h-[460px] sm:h-[520px]">
      {/* WhatsApp phone */}
      <div className="absolute left-0 top-6 w-[230px] sm:w-[260px] rotate-[-6deg] rounded-[2rem] bg-ink-950 p-2 shadow-2xl">
        <div className="rounded-[1.6rem] overflow-hidden bg-[#ECE5DD]">
          <div className="bg-emerald-600 text-white px-3 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-400/40 flex items-center justify-center">
              <WhatsAppMark className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Your Business</p>
              <p className="text-[10px] text-emerald-100">
                online · auto-reply
              </p>
            </div>
          </div>
          <div className="p-3 space-y-2 h-[260px] sm:h-[300px] overflow-hidden">
            <Bubble side="in">Hi! Do you ship to Karachi?</Bubble>
            <Bubble side="out" green>
              Yes! Free delivery 🚚 over Rs 2,000. What product are you looking
              for?
            </Bubble>
            <Bubble side="in">The black sneakers</Bubble>
            <Bubble side="out" green>
              Got it 👟 Sizes 7–11 in stock. Want me to send the link?
            </Bubble>
            <Bubble side="in">yes pls</Bubble>
            <Bubble side="out" green>
              <span className="underline">botlify.site/p/sneakers</span>
            </Bubble>
          </div>
        </div>
      </div>

      {/* Instagram phone */}
      <div className="absolute right-0 top-0 w-[230px] sm:w-[260px] rotate-[5deg] rounded-[2rem] bg-ink-950 p-2 shadow-2xl">
        <div className="rounded-[1.6rem] overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-3 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center">
              <InstagramMark className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">@yourbrand</p>
              <p className="text-[10px] text-white/80">Active now · Bot on</p>
            </div>
          </div>
          <div className="p-3 space-y-2 h-[260px] sm:h-[300px] overflow-hidden bg-white">
            <Bubble side="in">commented "PRICE" on your reel</Bubble>
            <Bubble side="out">
              Hey 👋 thanks for the comment! Here's the link & today's 15% off
              code: <b>BOT15</b>
            </Bubble>
            <Bubble side="in">do you have it in red?</Bubble>
            <Bubble side="out">
              Yes 🔴 — small/medium/large all in stock. Want me to reserve one?
            </Bubble>
            <Bubble side="in">yes!</Bubble>
            <Bubble side="out">
              Reserved ✅ I'll DM the checkout link in 1 min.
            </Bubble>
          </div>
        </div>
      </div>

      {/* floating stat */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-ink-100 px-4 py-2.5 flex items-center gap-3 z-10">
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-ink-500 tracking-wider">
            Reply rate
          </p>
          <p className="text-sm font-black text-ink-900">
            98%{" "}
            <span className="text-[10px] font-bold text-emerald-600">+42%</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, green, children }) {
  if (side === "in") {
    return (
      <div className="flex">
        <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-1.5 text-[11px] text-ink-800 shadow-sm max-w-[85%]">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div
        className={`rounded-2xl rounded-br-sm px-3 py-1.5 text-[11px] shadow-sm max-w-[85%] ${
          green
            ? "bg-[#DCF8C6] text-ink-800"
            : "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Two-channel section — Build separately, run together
 * ──────────────────────────────────────────────────────────── */
function TwoChannels() {
  return (
    <section id="automations" className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-ink-200 text-[11px] font-bold uppercase tracking-wider text-ink-700">
            Two channels · One platform
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Set up WhatsApp and Instagram{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-pink-500 bg-clip-text text-transparent">
              separately
            </span>
            . Or both.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-600">
            Pick the channel you want to start with — Botlify handles the rest.
            Add the other anytime from the same dashboard.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <ChannelCard
            tone="wa"
            icon={<WhatsAppMark className="w-7 h-7 text-white" />}
            title="WhatsApp automation"
            tagline="The world's most-used messaging app — fully automated."
            items={[
              {
                icon: Bot,
                title: "AI chatbot",
                desc: "Answers FAQs, qualifies leads, books orders 24/7.",
              },
              {
                icon: MessageCircle,
                title: "Keyword auto-reply",
                desc: "Reply to 'price', 'menu', 'address' instantly.",
              },
              {
                icon: Megaphone,
                title: "Bulk broadcasts",
                desc: "Send promos & updates to thousands at once.",
              },
              {
                icon: ShoppingBag,
                title: "E-commerce flows",
                desc: "Cart recovery, order confirmations, COD reminders.",
              },
              {
                icon: Workflow,
                title: "Drag-drop flow builder",
                desc: "Visual conversation flows with buttons & lists.",
              },
              {
                icon: Tag,
                title: "Contact tagging & lists",
                desc: "Segment customers and target the right offers.",
              },
            ]}
            cta="/register?channel=whatsapp"
            ctaLabel="Set up WhatsApp"
          />
          <ChannelCard
            tone="ig"
            icon={<InstagramMark className="w-7 h-7" />}
            title="Instagram automation"
            tagline="Comments, DMs, stories — every touchpoint, automated."
            items={[
              {
                icon: Hash,
                title: "Comment → DM",
                desc: "Auto-DM anyone who comments your keyword on a post or reel.",
              },
              {
                icon: Bot,
                title: "AI chatbot",
                desc: "Smart conversations that close sales in your DMs.",
              },
              {
                icon: Heart,
                title: "Story replies & mentions",
                desc: "Auto-respond when someone replies to or tags your story.",
              },
              {
                icon: Reply,
                title: "DM keywords",
                desc: "Instant replies for 'price', 'sizes', 'link in bio'.",
              },
              {
                icon: Share2,
                title: "Share-to-story trigger",
                desc: "Reward customers who share your post to their story.",
              },
              {
                icon: AtSign,
                title: "Mention tracker",
                desc: "Catch every brand mention and reply automatically.",
              },
            ]}
            cta="/register?channel=instagram"
            ctaLabel="Set up Instagram"
          />
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/register?channel=both"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-ink-950 text-white font-bold text-sm hover:bg-ink-900 transition"
          >
            <Rocket className="w-4 h-4" /> Or set up both at once
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ChannelCard({ tone, icon, title, tagline, items, cta, ctaLabel }) {
  const isWa = tone === "wa";
  return (
    <div
      className={`relative rounded-3xl overflow-hidden border ${
        isWa ? "border-emerald-100" : "border-pink-100"
      } bg-white shadow-card p-7 sm:p-8 hover:shadow-glow-lg transition`}
    >
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 ${
          isWa
            ? "bg-emerald-300"
            : "bg-gradient-to-br from-pink-300 via-fuchsia-300 to-purple-300"
        }`}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            isWa
              ? "bg-emerald-500"
              : "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black text-ink-950 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-ink-500">{tagline}</p>
        </div>
      </div>

      <div className="relative mt-6 grid sm:grid-cols-2 gap-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div
              key={i}
              className={`group flex gap-3 p-3 rounded-xl border ${
                isWa
                  ? "border-emerald-50 hover:border-emerald-200"
                  : "border-pink-50 hover:border-pink-200"
              } bg-white/60 transition`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isWa
                    ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                    : "bg-pink-50 text-pink-600 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-orange-400 group-hover:text-white"
                } transition-colors`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink-900 leading-tight">
                  {it.title}
                </p>
                <p className="text-xs text-ink-500 mt-0.5 leading-snug">
                  {it.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        to={cta}
        className={`relative mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-md font-bold text-sm transition ${
          isWa
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white"
        }`}
      >
        {ctaLabel} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Results / Charts
 * ──────────────────────────────────────────────────────────── */
const replyData = [
  { d: "Mon", auto: 240, manual: 90 },
  { d: "Tue", auto: 310, manual: 120 },
  { d: "Wed", auto: 480, manual: 110 },
  { d: "Thu", auto: 520, manual: 100 },
  { d: "Fri", auto: 690, manual: 130 },
  { d: "Sat", auto: 820, manual: 95 },
  { d: "Sun", auto: 760, manual: 80 },
];
const channelMix = [
  { name: "WhatsApp", value: 62, color: "#22c55e" },
  { name: "Instagram", value: 38, color: "#ec4899" },
];
const conversionData = [
  { m: "Wk 1", before: 2.1, after: 2.4 },
  { m: "Wk 2", before: 2.0, after: 3.6 },
  { m: "Wk 3", before: 1.9, after: 4.8 },
  { m: "Wk 4", before: 2.1, after: 6.1 },
];

function Results() {
  return (
    <section id="results" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-ink-200 text-[11px] font-bold uppercase tracking-wider text-ink-700">
            Results that show up
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Numbers that matter, in real time.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-600">
            Track every reply, click and sale across both channels — without
            opening five tabs.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          {/* Replies area chart */}
          <div className="lg:col-span-2 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500">
                  Replies this week
                </p>
                <p className="text-2xl font-black text-ink-950 mt-1">
                  3,820 <span className="text-emerald-600 text-sm">+38%</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Auto-replies
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  Manual
                </span>
              </div>
            </div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={replyData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="d"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="auto"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#g1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="manual"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#g2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Channel mix donut */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500">
              Channel mix
            </p>
            <p className="text-2xl font-black text-ink-950 mt-1">12.4k msgs</p>
            <div style={{ width: "100%", height: 200 }} className="mt-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={channelMix}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {channelMix.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion bar */}
          <div className="lg:col-span-3 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500">
                  Conversion rate (before vs. after Botlify)
                </p>
                <p className="text-2xl font-black text-ink-950 mt-1">
                  +2.9× <span className="text-pink-500 text-sm">avg lift</span>
                </p>
              </div>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={conversionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="m"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="before" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  <Bar
                    dataKey="after"
                    fill="url(#barGrad)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * How it works
 * ──────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Pick your channel",
      desc: "WhatsApp, Instagram, or both. Connect securely in under a minute.",
      icon: Phone,
    },
    {
      n: "02",
      title: "Build automations",
      desc: "AI chatbot, comment → DM, broadcasts — drag, drop, done.",
      icon: Workflow,
    },
    {
      n: "03",
      title: "Go live & grow",
      desc: "Botlify replies 24/7. You watch the leads (and money) roll in.",
      icon: Rocket,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            From zero to automated in three steps.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
              >
                <p className="text-5xl font-black text-ink-100 leading-none">
                  {s.n}
                </p>
                <div className="mt-3 w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mt-4 font-bold text-ink-950 text-lg">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Testimonials
 * ──────────────────────────────────────────────────────────── */
function Testimonials() {
  const items = [
    {
      name: "Sara K.",
      role: "Founder, Karachi Skincare",
      quote:
        "Comment-to-DM alone tripled our DM lead flow. Botlify pays for itself in two days.",
      tone: "ig",
    },
    {
      name: "Hamza R.",
      role: "Owner, FitMart Gym",
      quote:
        "WhatsApp broadcasts + AI replies at midnight. We close sales while we sleep.",
      tone: "wa",
    },
    {
      name: "Zoya M.",
      role: "Boutique owner",
      quote:
        "Set both channels up in one evening. Customers message wherever — we never miss.",
      tone: "both",
    },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Loved by busy founders.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-ink-800 leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 pt-4 border-t border-ink-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {t.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.role}</p>
                </div>
                {t.tone === "wa" && (
                  <WhatsAppMark className="w-5 h-5 text-emerald-600" />
                )}
                {t.tone === "ig" && <InstagramMark className="w-5 h-5" />}
                {t.tone === "both" && (
                  <div className="flex -space-x-1.5">
                    <WhatsAppMark className="w-5 h-5 text-emerald-600" />
                    <InstagramMark className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Pricing teaser
 * ──────────────────────────────────────────────────────────── */
function PricingTeaser() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      desc: "For trying things out.",
      features: ["1 channel", "500 auto-replies/mo", "Botlify AI · Standard"],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Growth",
      price: "Rs 2,500",
      sub: "/ month",
      desc: "For growing brands.",
      features: [
        "Both channels",
        "10,000 auto-replies/mo",
        "Botlify AI · Premium",
        "Broadcasts & flows",
      ],
      cta: "Start Growth",
      highlight: true,
    },
    {
      name: "Pro",
      price: "Rs 6,500",
      sub: "/ month",
      desc: "For scale.",
      features: [
        "Unlimited replies",
        "Multi-workspace",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Talk to us",
      highlight: false,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            One price. Both channels.
          </h2>
          <p className="mt-3 text-ink-600">
            No per-channel surcharge. No per-message fees. Cancel anytime.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 sm:p-7 border transition ${
                t.highlight
                  ? "bg-ink-950 text-white border-ink-950 shadow-2xl scale-[1.02]"
                  : "bg-white border-ink-100 shadow-card hover:border-ink-300"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-pink-400 text-white">
                  Most popular
                </span>
              )}
              <p
                className={`text-xs uppercase font-bold tracking-wider ${
                  t.highlight ? "text-white/70" : "text-ink-500"
                }`}
              >
                {t.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter">
                  {t.price}
                </span>
                {t.sub && (
                  <span
                    className={`text-sm ${
                      t.highlight ? "text-white/60" : "text-ink-500"
                    }`}
                  >
                    {t.sub}
                  </span>
                )}
              </div>
              <p
                className={`mt-1 text-sm ${
                  t.highlight ? "text-white/70" : "text-ink-500"
                }`}
              >
                {t.desc}
              </p>
              <ul className="mt-5 space-y-2.5">
                {t.features.map((f, k) => (
                  <li key={k} className="flex items-center gap-2 text-sm">
                    <Check
                      className={`w-4 h-4 ${
                        t.highlight ? "text-emerald-300" : "text-emerald-500"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className={`mt-6 block text-center px-4 py-3 rounded-md font-bold text-sm transition ${
                  t.highlight
                    ? "bg-white text-ink-950 hover:bg-white/90"
                    : "bg-ink-950 text-white hover:bg-ink-900"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * FAQ
 * ──────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Do I have to set up WhatsApp and Instagram together?",
    a: "Nope. Pick one and start. Add the other anytime — they live in the same dashboard but run as fully separate automations.",
  },
  {
    q: "Is the AI chatbot the only thing Botlify does?",
    a: "Far from it. Botlify is the automation platform — AI replies are one feature. You also get comment → DM, story replies, mention triggers, broadcasts, drag-drop flows, contact tagging, drip campaigns, analytics, and more.",
  },
  {
    q: "Will Meta ban my account?",
    a: "Botlify uses official Meta WhatsApp Cloud API and Instagram Graph API. Both are 100% Meta-approved — your accounts stay safe.",
  },
  {
    q: "How long does setup take?",
    a: "About 6 minutes. Connect the channel, add your first trigger, flip the switch — done.",
  },
  {
    q: "What does the AI run on?",
    a: "Botlify AI · Standard is free for everyone. Premium tiers get faster, smarter responses and longer memory. Either way, the AI is trained on your business — not generic.",
  },
  {
    q: "Can I send broadcasts on WhatsApp without getting blocked?",
    a: "Yes — we use the official Cloud API with template-message compliance. We guide you through approving your first template in 2 minutes.",
  },
  {
    q: "Does Botlify work with my existing CRM / Shopify / Stripe?",
    a: "Webhooks are open out of the box. Native integrations are rolling out monthly — first up: Shopify, Zapier, Make.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Forever-free Starter plan with 500 auto-replies/month on one channel. No card required.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-ink-200 text-[11px] font-bold uppercase tracking-wider text-ink-700">
            Frequently asked
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            The small-print questions, answered.
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left rounded-xl border border-ink-100 bg-white px-5 py-4 hover:border-ink-300 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-ink-900 text-sm sm:text-base">
                  {f.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-ink-400 flex-shrink-0 transition ${
                    open === i ? "rotate-180 text-ink-900" : ""
                  }`}
                />
              </div>
              {open === i && (
                <p className="mt-3 text-sm text-ink-600 leading-relaxed">
                  {f.a}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Final CTA
 * ──────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-10 sm:p-16 text-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-pink-500 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
              Stop replying. Start automating.
            </h2>
            <p className="mt-4 text-white/70 text-base sm:text-lg max-w-xl mx-auto">
              Pick a channel. Build your first automation. Watch DMs turn into
              customers — on autopilot.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md bg-white text-ink-950 font-bold text-sm hover:bg-white/95 transition shadow-2xl"
              >
                Start free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition"
              >
                Read the guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Footer
 * ──────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-3 text-sm max-w-xs">
              Your go-to automation platform for WhatsApp & Instagram. Set up
              once. Sells while you sleep.
            </p>
            <div className="mt-4 flex items-center gap-3 text-ink-500">
              <WhatsAppMark className="w-5 h-5" />
              <InstagramMark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white">
                  Guide
                </Link>
              </li>
              <li>
                <a href="#automations" className="hover:text-white">
                  Automations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@botlify.site"
                  className="hover:text-white inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Botlify. Built for creators.</p>
          <p className="text-ink-500">Made with care · Karachi · Pakistan</p>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink-900">
      <TopNav />
      <Hero />
      <TwoChannels />
      <Results />
      <HowItWorks />
      <Testimonials />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
