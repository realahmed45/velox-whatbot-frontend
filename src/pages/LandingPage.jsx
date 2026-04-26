import { Link } from "react-router-dom";
import { useState } from "react";
import {
  MessageCircle,
  Zap,
  Sparkles,
  Hash,
  Send,
  Target,
  Heart,
  Share2,
  Link as LinkIcon,
  Clock,
  Users,
  BarChart3,
  Check,
  ArrowRight,
  Instagram,
  CircleDot,
  Star,
  Shield,
  Bot,
  Plug,
  Rocket,
  PlayCircle,
  ChevronDown,
  Mail,
  BookOpen,
  MessagesSquare,
  Quote,
  X,
  TrendingUp,
} from "lucide-react";
import Logo from "@/components/Logo";

/* ────────────────────────────────────────────────────────────
 * Data
 * ──────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Welcome DM",
    desc: "Auto-greet anyone messaging your account for the first time.",
  },
  {
    icon: Hash,
    title: "Comment keywords",
    desc: "Comments like 'info' trigger a private DM with the link.",
  },
  {
    icon: MessageCircle,
    title: "DM keywords",
    desc: "Reply to 'price', 'link' & FAQs in under one second.",
  },
  {
    icon: Heart,
    title: "Story replies & mentions",
    desc: "Every reaction & tag converts into a personal DM.",
  },
  {
    icon: Share2,
    title: "Share-to-story → DM",
    desc: "Thank fans who share your post — automatically.",
  },
  {
    icon: LinkIcon,
    title: "Tracked ad links",
    desc: "Per-campaign links so you know what drove each lead.",
  },
  {
    icon: Send,
    title: "Live-stream auto-replies",
    desc: "Type 'buy' mid-live → instant DM with checkout.",
  },
  {
    icon: Target,
    title: "Chat starter buttons",
    desc: "Quick CTAs at the top of every new conversation.",
  },
  {
    icon: CircleDot,
    title: "Fallback reply",
    desc: "A polite catch-all when no other rule matches.",
  },
  {
    icon: Clock,
    title: "Business hours",
    desc: "Friendly 'we're away' message when your team is offline.",
  },
  {
    icon: Sparkles,
    title: "AI conversation bot",
    desc: "GPT-powered chats that sound like you.",
    premium: true,
  },
  {
    icon: Users,
    title: "Team inbox",
    desc: "Assign chats, leave notes, reply together.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Replies, conversions and best-performing triggers.",
  },
  {
    icon: Zap,
    title: "One-click bot pause",
    desc: "Agent jumps in → bot steps back. No double replies.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Botlify replaced ManyChat for half the price and twice the polish. My DMs convert 3× now.",
    name: "Aisha Khan",
    role: "Beauty creator · 280k",
  },
  {
    quote:
      "Setup was honestly six minutes. The story-mention auto-DM alone pays for the whole plan.",
    name: "Daniyal Ahmed",
    role: "Coaching agency",
  },
  {
    quote:
      "Clean inbox, no double-replies, and the analytics actually tell you what's working.",
    name: "Mira Patel",
    role: "Boutique founder",
  },
];

const FAQS = [
  {
    q: "Do I need a Business or Creator account?",
    a: "Yes. Instagram's Graph API only works with Business or Creator accounts. Switching is free, takes 30 seconds, and doesn't change anything for your followers.",
  },
  {
    q: "Will my account get banned?",
    a: "No. Botlify only uses the official Meta Graph API and stays inside Instagram's published rate limits and 24-hour messaging window — the same APIs every Meta-approved tool uses.",
  },
  {
    q: "How fast can I go live?",
    a: "Most users are running their first auto-reply in under 6 minutes. Connect Instagram, pick a trigger, write a reply, hit save.",
  },
  {
    q: "What happens after my 500 free DMs?",
    a: "The bot keeps your account safe by pausing replies until next month, or you can upgrade in one click. No lockouts, no overage fees.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel from your billing page any time. You keep access until the end of the current period. No questions asked.",
  },
];

const COMPARE_ROWS = [
  ["Welcome DM", true, true, true],
  ["Comment-to-DM keyword", true, true, true],
  ["Story-mention auto-DM", true, false, true],
  ["AI conversation bot", true, false, false],
  ["Team inbox + notes", true, true, false],
  ["Tracked ad links", true, false, false],
  ["Live-stream auto-replies", true, false, false],
  ["Transparent on Meta limits", true, false, false],
  ["Free 500 DMs / month", true, false, false],
];

/* ────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink-900 antialiased">
      <TopNav />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <ProductPreview />
      <Comparison />
      <Testimonials />
      <Limits />
      <FAQ />
      <Support />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Sections
 * ──────────────────────────────────────────────────────────── */

function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-ink-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600">
          <a href="#features" className="hover:text-brand-600 transition">
            Features
          </a>
          <a href="#how" className="hover:text-brand-600 transition">
            How it works
          </a>
          <a href="#compare" className="hover:text-brand-600 transition">
            Why Botlify
          </a>
          <Link to="/pricing" className="hover:text-brand-600 transition">
            Pricing
          </Link>
          <a href="#faq" className="hover:text-brand-600 transition">
            FAQ
          </a>
          <a href="#support" className="hover:text-brand-600 transition">
            Support
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm shadow-glow">
            Start free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            className="md:hidden p-2 -mr-2 text-ink-700"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <ChevronDown
              className={`w-5 h-5 transition ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white">
          <div className="px-4 py-3 flex flex-col gap-3 text-sm font-medium text-ink-700">
            <a href="#features" onClick={() => setOpen(false)}>
              Features
            </a>
            <a href="#how" onClick={() => setOpen(false)}>
              How it works
            </a>
            <a href="#compare" onClick={() => setOpen(false)}>
              Why Botlify
            </a>
            <Link to="/pricing" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <a href="#faq" onClick={() => setOpen(false)}>
              FAQ
            </a>
            <a href="#support" onClick={() => setOpen(false)}>
              Support
            </a>
            <Link to="/login" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-400/30 blur-[120px] animate-float pointer-events-none" />
      <div
        className="absolute top-20 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent-400/30 blur-[120px] animate-float pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-brand-200 text-xs font-semibold text-brand-700 shadow-sm">
            <Sparkles className="w-3 h-3" />
            Your all-in-one Instagram automation platform
          </span>

          <h1 className="mt-6 text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            Stop missing leads.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              Start closing them.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto leading-relaxed">
            Botlify auto-DMs every comment, story-reply and mention so you turn
            engagement into revenue —
            <span className="font-semibold text-ink-900">
              {" "}
              24/7, hands-free.
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="btn-primary !px-7 !py-3.5 text-base shadow-glow"
            >
              Start free — no card <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="btn-secondary !px-7 !py-3.5 text-base">
              <PlayCircle className="w-4 h-4" /> Watch 60-sec demo
            </a>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> 500 free DMs /
              month
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Setup in 6
              minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Meta-approved
              API
            </span>
          </div>
        </div>

        {/* Hero product preview */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-3xl opacity-30 blur-2xl" />
            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 p-1 backdrop-blur-xl border border-white/40 shadow-hero">
              <div className="rounded-[20px] bg-white overflow-hidden">
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="grid grid-cols-12 min-h-[360px] sm:min-h-[440px]">
      {/* Sidebar */}
      <div className="hidden sm:flex col-span-3 border-r border-ink-100 bg-ink-50/60 flex-col p-4 gap-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-gradient" />
          <span className="font-bold text-ink-900 text-sm">Botlify</span>
        </div>
        {[
          "Dashboard",
          "Inbox",
          "Automation",
          "Broadcasts",
          "Contacts",
          "Analytics",
          "Settings",
        ].map((label, i) => (
          <div
            key={label}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? "bg-brand-gradient text-white shadow-sm" : "text-ink-500"}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="col-span-12 sm:col-span-9 p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-600 font-bold">
              Good morning
            </p>
            <p className="text-base sm:text-lg font-bold text-ink-900">
              Welcome back, Aisha 👋
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-gradient" />
            <span className="text-xs font-semibold text-ink-700">
              @aisha.style
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { v: "12,840", l: "DMs sent", c: "from-indigo-500 to-violet-500" },
            { v: "94%", l: "Reply rate", c: "from-emerald-500 to-teal-500" },
            { v: "3,127", l: "New leads", c: "from-pink-500 to-rose-500" },
            { v: "1.2s", l: "Avg response", c: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl bg-white border border-ink-100 p-3 shadow-card"
            >
              <div
                className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}
              >
                {s.v}
              </div>
              <div className="text-[10px] sm:text-xs text-ink-500 mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* mini chart */}
        <div className="rounded-xl bg-white border border-ink-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink-700">
              DMs this week
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +24%
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {[40, 65, 50, 80, 70, 90, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500 to-pink-500"
                style={{ height: `${h}%`, opacity: 0.5 + i * 0.07 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialProof() {
  const stats = [
    { v: "10M+", l: "DMs delivered" },
    { v: "2,500+", l: "Active creators" },
    { v: "99.9%", l: "Uptime" },
    { v: "<1s", l: "Avg reply time" },
  ];
  return (
    <section className="py-14 border-y border-ink-100 bg-ink-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              {s.v}
            </div>
            <div className="text-xs sm:text-sm text-ink-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                automate Instagram
              </span>
            </>
          }
          subtitle="14 triggers. One inbox. Infinite scale. No flow-charts required — click, write your reply, hit save."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {FEATURES.map(({ icon: Icon, title, desc, premium }) => (
            <div
              key={title}
              className="group relative p-6 rounded-2xl border border-ink-100 bg-white hover:border-brand-200 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${premium ? "bg-gradient-to-br from-amber-400 to-rose-500" : "bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500"} shadow-md group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-ink-900 flex items-center gap-2 text-base">
                {title}
                {premium && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 text-white">
                    Premium
                  </span>
                )}
              </h3>
              <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: "Connect Instagram",
      desc: "Secure Meta-approved OAuth. We never see your password.",
      icon: Plug,
    },
    {
      n: 2,
      title: "Pick your triggers",
      desc: "Choose what should auto-reply: keywords, comments, stories, mentions.",
      icon: Target,
    },
    {
      n: 3,
      title: "Go live",
      desc: "Botlify replies 24/7. You watch the leads roll in.",
      icon: Rocket,
    },
  ];
  return (
    <section
      id="how"
      className="py-24 sm:py-28 bg-gradient-to-b from-ink-50/60 to-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Live in three simple steps"
          subtitle="Most users are sending their first auto-DM in under six minutes — no developer, no complicated flow charts."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-pink-200" />
          {steps.map(({ n, title, desc, icon: Icon }) => (
            <div
              key={n}
              className="relative bg-white rounded-2xl border border-ink-100 p-7 text-center shadow-card hover:shadow-glow hover:-translate-y-1 transition"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-white shadow-glow relative">
                <Icon className="w-7 h-7" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-brand-500 text-brand-700 text-xs font-bold flex items-center justify-center">
                  {n}
                </span>
              </div>
              <h3 className="mt-5 font-bold text-ink-900 text-lg">{title}</h3>
              <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview() {
  const items = [
    {
      icon: Bot,
      title: "AI that sounds like you",
      desc: "Train on your past messages. The AI replies in your voice — premium plan.",
    },
    {
      icon: MessagesSquare,
      title: "Unified inbox",
      desc: "Every comment, DM and story-reply in one place. Assign, note, resolve.",
    },
    {
      icon: BarChart3,
      title: "Analytics that matter",
      desc: "Which trigger drives sales? What ad sent the lead? See it in plain English.",
    },
    {
      icon: Shield,
      title: "Meta-compliant by design",
      desc: "We never bend the rules. Your account stays safe — always.",
    },
  ];
  return (
    <section className="py-24 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">
            Built for results
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-ink-900 leading-[1.1]">
            Designed by creators.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              Engineered to convert.
            </span>
          </h2>
          <p className="mt-5 text-ink-600 text-lg leading-relaxed">
            Every pixel, every API call and every word in our auto-reply
            templates is optimised for one thing: turning Instagram engagement
            into paying customers.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-5">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{title}</p>
                  <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
          <div className="relative rounded-3xl border border-ink-100 bg-white shadow-card-lg overflow-hidden">
            <ChatMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatMockup() {
  return (
    <div className="bg-gradient-to-br from-ink-50 to-white p-6 sm:p-8">
      <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400" />
        <div>
          <p className="text-sm font-bold text-ink-900">@maya.fits</p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
            now
          </p>
        </div>
      </div>
      <div className="space-y-3 mt-5">
        <Bubble side="them" text="hey! is the linen dress still in stock? 👀" />
        <Bubble
          side="bot"
          text="Hi Maya! Yes — last 3 in size M. Here's the link 👇"
        />
        <Bubble side="bot" text="🔗 botlify.shop/linen-dress" link />
        <Bubble side="them" text="omg perfect, ordering rn 🔥" />
        <div className="flex items-center gap-2 text-[11px] text-ink-400 pl-1">
          <Bot className="w-3 h-3" /> Auto-replied by Botlify · 0.8s
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, text, link }) {
  const them = side === "them";
  return (
    <div className={`flex ${them ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
          them
            ? "bg-ink-100 text-ink-800 rounded-bl-sm"
            : "bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white rounded-br-sm shadow-sm"
        }`}
      >
        {link ? <span className="underline">{text}</span> : text}
      </div>
    </div>
  );
}

function Comparison() {
  return (
    <section
      id="compare"
      className="py-24 sm:py-28 bg-gradient-to-b from-white via-ink-50/60 to-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why Botlify"
          title="The honest comparison"
          subtitle="We don't promise features Instagram's API can't deliver. Here's exactly what you get vs the others."
        />
        <div className="mt-12 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
          <div className="grid grid-cols-4 bg-ink-50 text-xs font-bold uppercase tracking-wider text-ink-500">
            <div className="px-4 sm:px-6 py-4">Feature</div>
            <div className="px-4 sm:px-6 py-4 text-center bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white">
              Botlify
            </div>
            <div className="px-4 sm:px-6 py-4 text-center">ManyChat</div>
            <div className="px-4 sm:px-6 py-4 text-center">Inflact</div>
          </div>
          {COMPARE_ROWS.map(([feat, b, m, i], idx) => (
            <div
              key={feat}
              className={`grid grid-cols-4 text-sm ${idx % 2 ? "bg-ink-50/40" : "bg-white"}`}
            >
              <div className="px-4 sm:px-6 py-3.5 font-medium text-ink-800">
                {feat}
              </div>
              <Cell on={b} highlight />
              <Cell on={m} />
              <Cell on={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cell({ on, highlight }) {
  return (
    <div className="px-4 sm:px-6 py-3.5 flex items-center justify-center">
      {on ? (
        <Check
          className={`w-5 h-5 ${highlight ? "text-emerald-500" : "text-ink-400"}`}
        />
      ) : (
        <X className="w-5 h-5 text-ink-300" />
      )}
    </div>
  );
}

function Testimonials() {
  return (
    <section className="py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Loved by creators"
          title={
            <>
              Real businesses.{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                Real revenue.
              </span>
            </>
          }
          subtitle="2,500+ creators trust Botlify with their Instagram inbox."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="relative p-7 rounded-2xl border border-ink-100 bg-white hover:shadow-glow hover:-translate-y-1 transition"
            >
              <Quote className="absolute top-5 right-5 w-7 h-7 text-brand-100" />
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-ink-700 leading-relaxed text-[15px]">
                "{t.quote}"
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Limits() {
  const items = [
    {
      title: "No follow-trigger DMs",
      desc: "Instagram's API doesn't expose a follow webhook. Tools claiming this either guess wrong or break Meta's rules.",
    },
    {
      title: "24-hour messaging window",
      desc: "You can only DM users who messaged, commented or replied within 24h. Cold DMs aren't permitted by Meta.",
    },
    {
      title: "Business / Creator only",
      desc: "Personal accounts can't use Graph API. Switching to Business is free and takes 30 seconds.",
    },
    {
      title: "No bulk cold blasts",
      desc: "Broadcasts only reach contacts who have an open 24-hour window with you. No spamming random audiences.",
    },
  ];
  return (
    <section className="py-24 sm:py-28 bg-ink-50/60 border-y border-ink-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Honest disclosure"
          title={
            <>
              What Instagram{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                doesn't let us do
              </span>
            </>
          }
          subtitle="We tell you upfront, so you pick Botlify for what it actually does."
        />
        <div className="grid sm:grid-cols-2 gap-4 mt-12">
          {items.map((it) => (
            <div
              key={it.title}
              className="p-5 rounded-2xl bg-white border border-ink-100"
            >
              <p className="font-bold text-ink-900 text-sm">{it.title}</p>
              <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">
                {it.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-400 text-center mt-7">
          The moment Meta opens new endpoints, Botlify ships them within a week.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Can't find what you need? Email us — we reply same-day."
        />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const active = open === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(active ? -1 : i)}
                className={`w-full text-left rounded-2xl border transition ${active ? "border-brand-300 bg-gradient-to-br from-brand-50 to-white shadow-sm" : "border-ink-100 bg-white hover:border-ink-200"}`}
              >
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="font-semibold text-ink-900 text-[15px]">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-500 flex-shrink-0 transition-transform ${active ? "rotate-180 text-brand-600" : ""}`}
                  />
                </div>
                {active && (
                  <p className="px-5 pb-5 text-sm text-ink-600 leading-relaxed">
                    {f.a}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Support() {
  const cards = [
    {
      icon: Mail,
      title: "Email support",
      desc: "We answer every email same-day, 7 days a week.",
      cta: "support@botlify.site",
      href: "mailto:support@botlify.site",
    },
    {
      icon: BookOpen,
      title: "Help center",
      desc: "Step-by-step guides, video walkthroughs, troubleshooting.",
      cta: "Browse docs",
      href: "#",
    },
    {
      icon: MessagesSquare,
      title: "Community",
      desc: "Join 2,500+ creators sharing flows and templates.",
      cta: "Join Discord",
      href: "#",
    },
  ];
  return (
    <section
      id="support"
      className="py-24 sm:py-28 bg-gradient-to-b from-white to-ink-50/60"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Support"
          title="We've got your back"
          subtitle="Real humans. Fast replies. No bots — well, no support bots anyway."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {cards.map(({ icon: Icon, title, desc, cta, href }) => (
            <a
              key={title}
              href={href}
              className="group p-7 rounded-2xl border border-ink-100 bg-white hover:border-brand-200 hover:shadow-glow hover:-translate-y-1 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-md mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-ink-900 text-base">{title}</h3>
              <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">
                {desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 group-hover:gap-2 transition-all">
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-dark-mesh" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-brand-500/20 blur-[140px]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
          Ready to never miss a DM again?
        </h2>
        <p className="mt-5 text-ink-300 text-lg max-w-xl mx-auto">
          Join 2,500+ creators automating Instagram with Botlify. Start free —
          upgrade when you outgrow it.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="btn-primary !px-8 !py-3.5 text-base shadow-glow"
          >
            Get started — it's free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pricing"
            className="btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !px-8 !py-3.5 text-base"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-400">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        ["Features", "#features"],
        ["How it works", "#how"],
        ["Why Botlify", "#compare"],
        ["Pricing", "/pricing"],
      ],
    },
    {
      title: "Resources",
      links: [
        ["Help center", "#"],
        ["FAQ", "#faq"],
        ["Community", "#"],
        ["Status", "#"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About", "#"],
        ["Blog", "#"],
        ["Careers", "#"],
        ["Contact", "mailto:support@botlify.site"],
      ],
    },
    {
      title: "Legal",
      links: [
        ["Privacy", "/privacy"],
        ["Terms", "/terms"],
        ["Data deletion", "#"],
        ["Security", "#"],
      ],
    },
  ];
  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Logo size="md" className="text-white" />
          <p className="mt-4 text-sm text-ink-400 max-w-xs leading-relaxed">
            Your all-in-one Instagram automation platform. Built for creators,
            agencies and brands who refuse to miss a lead.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-ink-500">
            <Shield className="w-3.5 h-3.5" /> Meta-approved · GDPR compliant
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-bold text-white">{c.title}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {c.links.map(([l, h]) => (
                <li key={l}>
                  {h.startsWith("/") ? (
                    <Link to={h} className="hover:text-white transition">
                      {l}
                    </Link>
                  ) : (
                    <a href={h} className="hover:text-white transition">
                      {l}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} Botlify. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Made with <Heart className="w-3 h-3 text-pink-500 fill-current" />{" "}
            for creators
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────
 * Atoms
 * ──────────────────────────────────────────────────────────── */

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-ink-900 leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-ink-500 text-base sm:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
