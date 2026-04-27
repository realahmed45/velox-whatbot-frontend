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
    icon: Bot,
    title: "AI conversation bot",
    desc: "GPT-powered chats that sound exactly like you — answers off-script questions and only pings you when it's something real.",
    bullets: [
      "Trains on your FAQs, offers, and tone",
      "Multi-turn context — remembers the whole chat",
      "Smart hand-off to human when stuck",
    ],
    premium: true,
    hero: true,
  },
  {
    icon: Hash,
    title: "Comment → DM",
    desc: "When followers comment a keyword on your post or Reel, Botlify slides into their DMs with the link, offer or info — instantly.",
    bullets: [
      "Per-post or account-wide triggers",
      "Multiple keyword variations supported",
      "Public reply + private DM combo",
    ],
  },
  {
    icon: MessageCircle,
    title: "DM keyword auto-reply",
    desc: "Reply to common questions like 'price', 'link', 'sizes' in under one second — no human required.",
    bullets: [
      "Unlimited keyword rules per account",
      "Rich replies with buttons and links",
      "Pause auto-reply when human jumps in",
    ],
  },
  {
    icon: MessageCircle,
    title: "Welcome DM",
    desc: "Auto-greet anyone who messages you for the first time with a warm intro, your menu, or a discount code.",
    bullets: [
      "Personalised first-touch experience",
      "Quick-reply buttons to qualify leads",
      "Stops repeating itself on returning chats",
    ],
  },
  {
    icon: Heart,
    title: "Story replies & mentions",
    desc: "Every story reaction, sticker reply or @mention converts into a personal DM — turning passive engagement into conversation.",
    bullets: [
      "Story reaction triggers",
      "Story mention triggers",
      "Share-to-story → DM thank you",
    ],
  },
  {
    icon: Share2,
    title: "Share-to-story → DM",
    desc: "Thank fans who share your post to their story — automatically. Builds loyalty and drives word-of-mouth.",
    bullets: [
      "Auto-DM with a thank-you + link",
      "Optional discount code for sharers",
      "Tracks which posts get shared most",
    ],
  },
  {
    icon: LinkIcon,
    title: "Tracked ad links (Ref-URL)",
    desc: "Per-campaign deep links so you know exactly which ad, post or Reel drove every single lead.",
    bullets: [
      "Unlimited tracked URLs",
      "Drop directly into Meta ads",
      "Per-link analytics on conversion",
    ],
  },
  {
    icon: Send,
    title: "Live-stream auto-replies",
    desc: "Type a keyword in a live comment → instant DM with the checkout link. Convert hype into sales mid-stream.",
    bullets: [
      "Real-time live-comment listener",
      "Multi-keyword support",
      "Works on creator and business lives",
    ],
  },
  {
    icon: Target,
    title: "Conversation starter buttons",
    desc: "Quick CTA buttons that show at the top of every new chat — guide people to the action you want.",
    bullets: [
      "Up to 4 starter buttons",
      "Customisable copy and links",
      "Drives 2-3× higher response rate",
    ],
  },
  {
    icon: CircleDot,
    title: "Fallback reply",
    desc: "A polite, on-brand catch-all when no other rule matches — never leave a DM on read.",
    bullets: [
      "Custom fallback per workspace",
      "Optional auto-handoff after fallback",
      "AI-generated fallback (Scale plan)",
    ],
  },
  {
    icon: Clock,
    title: "Business hours",
    desc: "A friendly 'we're away' DM during off-hours so customers always know when to expect a real reply.",
    bullets: [
      "Per-day schedule with timezone",
      "Custom away message",
      "Stops AI bot or routes to human queue",
    ],
  },
  {
    icon: Users,
    title: "Team inbox",
    desc: "Assign DMs to teammates, leave private notes, and reply together without stepping on each other.",
    bullets: [
      "Internal notes (only your team sees)",
      "Assignments + read receipts",
      "Up to 10 seats on Scale",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics that matter",
    desc: "Replies, conversions, best-performing triggers — and which ad sent the lead. Numbers that actually drive decisions.",
    bullets: [
      "Per-trigger conversion rate",
      "Funnel: comment → DM → click → sale",
      "Export CSV any time",
    ],
  },
  {
    icon: Zap,
    title: "One-click bot pause",
    desc: "When you (or a teammate) jump into a conversation, the bot steps back instantly. No double-replies, no awkwardness.",
    bullets: [
      "Auto-detects human typing",
      "Resumes after configurable idle time",
      "Per-conversation override toggle",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Botlify replaced ManyChat for half the price and twice the polish. My DMs convert 3× now.",
    name: "Aisha Khan",
    handle: "@aisha.style",
    role: "Beauty creator · 280k",
    avatar: "https://i.pravatar.cc/120?img=47",
    metric: "+317% reply rate",
  },
  {
    quote:
      "The AI bot is the magic. It answers product questions in my voice while I sleep. Real revenue, real difference.",
    name: "Daniyal Ahmed",
    handle: "@daniyal.coach",
    role: "Coaching agency",
    avatar: "https://i.pravatar.cc/120?img=12",
    metric: "PKR 1.4M / mo via DMs",
  },
  {
    quote:
      "Setup was honestly six minutes. The story-mention auto-DM alone pays for the whole plan.",
    name: "Mira Patel",
    handle: "@mira.boutique",
    role: "Boutique founder",
    avatar: "https://i.pravatar.cc/120?img=49",
    metric: "−18hrs / week saved",
  },
  {
    quote:
      "Clean inbox, no double replies, the analytics actually tell you what's working. Best $30 I spend.",
    name: "Hamza Iqbal",
    handle: "@hamza.fitness",
    role: "Personal trainer · 88k",
    avatar: "https://i.pravatar.cc/120?img=33",
    metric: "+62 leads / week",
  },
  {
    quote:
      "The team inbox + AI hand-off is unreal. My VAs only see the chats that actually need a human.",
    name: "Sana Riaz",
    handle: "@sana.skin",
    role: "Skincare brand",
    avatar: "https://i.pravatar.cc/120?img=44",
    metric: "94% AI resolution",
  },
  {
    quote:
      "The comment-to-DM trigger on a viral Reel got me 1,200 leads in 24 hours. I almost cried.",
    name: "Faraz Malik",
    handle: "@faraz.builds",
    role: "DTC founder",
    avatar: "https://i.pravatar.cc/120?img=15",
    metric: "1.2k leads / Reel",
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
      <PlatformDarkSection />
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
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/70 backdrop-blur border border-brand-200 text-xs font-semibold text-brand-700 shadow-sm">
            <Sparkles className="w-3 h-3" />
            AI Instagram automation, finally simple
          </span>

          <h1 className="mt-6 text-4xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            An AI bot that{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              replies to every Instagram DM
            </span>{" "}
            in your voice — instantly.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-ink-600 max-w-2xl mx-auto leading-relaxed">
            Train Botlify on your FAQs, offers and tone. The AI answers DMs
            24/7, qualifies leads, sends links, and only pings you when it's
            something real.
            <span className="block mt-2 text-sm text-ink-500">
              Plus: comment-to-DM, story replies, story mentions, broadcasts &
              more.
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="btn-primary !px-7 !py-3.5 text-base shadow-glow"
            >
              Try the AI bot free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/guide" className="btn-secondary !px-7 !py-3.5 text-base">
              <PlayCircle className="w-4 h-4" /> See how it works
            </Link>
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
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-lg opacity-30 blur-2xl" />
            <div className="relative rounded-lg bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 p-1 backdrop-blur-xl border border-white/40 shadow-hero">
              <div className="rounded-md bg-white overflow-hidden">
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
              className="rounded-md bg-white border border-ink-100 p-3 shadow-card"
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

        {/* Real-looking line+area chart */}
        <div className="rounded-md bg-white border border-ink-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-ink-700 block">
                DMs handled by AI · last 30 days
              </span>
              <span className="text-[10px] text-ink-400">
                Powered by Botlify AI bot
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> +247%
            </span>
          </div>
          <svg
            viewBox="0 0 600 140"
            className="w-full h-24 sm:h-28"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lpAreaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="lpLineG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* gridlines */}
            {[28, 56, 84, 112].map((y) => (
              <line
                key={y}
                x1="0"
                x2="600"
                y1={y}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}
            {/* area + line: 30 points smooth curve */}
            <path
              d="M0,120 C30,118 50,115 70,112 C90,108 110,103 140,98 C170,93 195,90 220,85 C245,80 268,78 290,72 C310,66 330,60 360,55 C385,51 410,48 430,42 C455,35 478,30 500,24 C525,18 555,14 600,10 L600,140 L0,140 Z"
              fill="url(#lpAreaG)"
            />
            <path
              d="M0,120 C30,118 50,115 70,112 C90,108 110,103 140,98 C170,93 195,90 220,85 C245,80 268,78 290,72 C310,66 330,60 360,55 C385,51 410,48 430,42 C455,35 478,30 500,24 C525,18 555,14 600,10"
              fill="none"
              stroke="url(#lpLineG)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* end dot */}
            <circle cx="600" cy="10" r="4" fill="#ec4899" />
            <circle cx="600" cy="10" r="9" fill="#ec4899" fillOpacity="0.18" />
          </svg>
          <div className="flex justify-between text-[9px] text-ink-400 mt-1">
            <span>Day 1</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Today</span>
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
  const logos = [
    "Bloom",
    "Maya Studio",
    "Northwind",
    "PulseGym",
    "Lumen",
    "Halo Beauty",
    "Vanta",
    "Stride",
    "Atlas Co.",
    "Nova",
    "Orbit",
    "Crest",
  ];
  return (
    <section className="py-14 border-y border-ink-100 bg-gradient-to-b from-white to-ink-50/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.l} className="relative group">
            <div className="text-4xl sm:text-5xl font-black tracking-tighter text-gradient-animated">
              {s.v}
            </div>
            <div className="text-xs sm:text-sm text-ink-500 mt-1.5 font-medium uppercase tracking-wider">
              {s.l}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 relative">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] font-bold text-ink-400 mb-6">
          Trusted by 2,500+ brands & creators
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="marquee gap-12">
            {[...logos, ...logos].map((l, i) => (
              <span
                key={i}
                className="text-2xl font-black text-ink-400/70 tracking-tight whitespace-nowrap"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 relative">
      <div className="absolute inset-0 bg-grid-light bg-grid-48 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Every feature, in detail"
          title={
            <>
              Everything you need to{" "}
              <span className="text-gradient-animated">automate Instagram</span>
            </>
          }
          subtitle="14 features. One platform. We tell you exactly what each one does, so you know what you're getting before you commit."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-12 sm:mt-16">
          {FEATURES.map(
            ({ icon: Icon, title, desc, bullets, premium, hero }) => (
              <div
                key={title}
                className={`group relative p-5 sm:p-6 rounded-lg backdrop-blur-md border transition-all duration-500 shine-on-hover overflow-hidden ${
                  hero
                    ? "sm:col-span-2 lg:col-span-3 bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 text-white border-accent-400/30 shadow-hero hover:-translate-y-1"
                    : "bg-white/70 border-ink-100 hover:border-transparent hover:shadow-glow-lg hover:-translate-y-1.5"
                }`}
              >
                {!hero && (
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/0 via-violet-500/0 to-pink-500/0 group-hover:from-indigo-500/15 group-hover:via-violet-500/15 group-hover:to-pink-500/15 blur-2xl transition-all duration-500" />
                )}
                {hero && (
                  <>
                    <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-accent-500/30 blur-3xl" />
                    <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-brand-500/30 blur-3xl" />
                  </>
                )}
                <div
                  className={`relative ${hero ? "grid lg:grid-cols-[auto,1fr] gap-6 items-start" : ""}`}
                >
                  <div
                    className={`relative ${hero ? "w-14 h-14" : "w-12 h-12"} rounded-md flex items-center justify-center ${
                      premium
                        ? "bg-gradient-to-br from-amber-400 via-rose-500 to-pink-600"
                        : "bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500"
                    } shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${hero ? "" : "mb-4"}`}
                  >
                    <Icon
                      className={`${hero ? "w-7 h-7" : "w-6 h-6"} text-white`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`relative font-bold flex items-center gap-2 ${hero ? "text-2xl sm:text-3xl text-white" : "text-base text-ink-900"}`}
                    >
                      {title}
                      {premium && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                          {hero ? "Headline AI feature" : "Premium"}
                        </span>
                      )}
                    </h3>
                    <p
                      className={`relative mt-2 leading-relaxed ${hero ? "text-base text-ink-200 max-w-2xl" : "text-sm text-ink-500"}`}
                    >
                      {desc}
                    </p>
                    {bullets && (
                      <ul
                        className={`mt-3 space-y-1.5 ${hero ? "grid sm:grid-cols-3 gap-x-4 gap-y-1.5 mt-4" : ""}`}
                      >
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            className={`flex items-start gap-2 text-xs leading-snug ${hero ? "text-ink-300" : "text-ink-600"}`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${hero ? "text-accent-400" : "text-brand-500"}`}
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {hero && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link to="/register" className="btn-premium">
                          Try the AI bot free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          to="/guide"
                          className="btn bg-white/10 text-white border border-white/15 hover:bg-white/15"
                        >
                          How training works
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function PlatformDarkSection() {
  const stats = [
    { v: "6 min", l: "From signup to first auto-DM" },
    { v: "24/7", l: "Always-on auto replies" },
    { v: "0.8s", l: "Average response latency" },
  ];
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-ink-950 text-white">
      <div className="absolute inset-0 bg-mesh-dark" />
      <div className="absolute inset-0 bg-grid-dark bg-grid-48 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-brand-500/15 blur-[140px] animate-blob" />
      <div
        className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-pink-500/15 blur-[140px] animate-blob"
        style={{ animationDelay: "5s" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-xs font-semibold text-brand-200">
            <Rocket className="w-3 h-3" /> Built for scale
          </span>
          <h2 className="mt-5 text-4xl sm:text-6xl font-black tracking-tighter text-balance">
            One platform.
            <br />
            <span className="text-gradient-animated">
              Every Instagram surface.
            </span>
          </h2>
          <p className="mt-5 text-ink-300 text-lg leading-relaxed">
            Botlify connects to Meta's Graph API and listens to every signal —
            so the moment a follower reacts to your story, comments on your post
            or sends you a DM, we reply.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <div
              key={s.l}
              className="glass-dark rounded-lg p-7 text-center hover:-translate-y-1 transition-all duration-500 perspective-1500 group"
            >
              <div className="text-5xl sm:text-6xl font-black tracking-tighter text-gradient-animated">
                {s.v}
              </div>
              <div className="mt-2 text-sm text-ink-300">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Platform pillars */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              title: "Real-time webhooks",
              desc: "Sub-second delivery on Meta events.",
            },
            {
              icon: Shield,
              title: "Enterprise security",
              desc: "AES-256 encrypted tokens at rest.",
            },
            {
              icon: Bot,
              title: "AI conversations",
              desc: "GPT-powered replies in your voice.",
            },
            {
              icon: BarChart3,
              title: "Attribution built-in",
              desc: "See which trigger drove each sale.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-dark rounded-lg p-5 group hover:bg-white/10 transition"
            >
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-neon-violet group-hover:scale-110 transition">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="mt-4 font-bold text-white text-sm">{title}</p>
              <p className="text-xs text-ink-400 mt-1 leading-relaxed">
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
              className="relative bg-white rounded-lg border border-ink-100 p-7 text-center shadow-card hover:shadow-glow hover:-translate-y-1 transition"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-white shadow-glow relative">
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
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-lg blur-3xl" />
          <div className="relative rounded-lg border border-ink-100 bg-white shadow-card-lg overflow-hidden">
            <ChatMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatMockup() {
  return (
    <div className="bg-gradient-to-br from-ink-50 to-white">
      {/* IG-style header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-ink-100 bg-white">
        <img
          src="https://i.pravatar.cc/80?img=47"
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink-900">@maya.fits</p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active now
          </p>
        </div>
        <Instagram className="w-4 h-4 text-ink-400" />
      </div>

      {/* Conversation */}
      <div className="px-5 py-5 space-y-2.5 max-h-[460px] overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(236,72,153,0.05),transparent_60%)]">
        <div className="text-[10px] text-center text-ink-400 mb-1">
          Today · 2:14 pm
        </div>

        <Bubble side="them" text="hey! is the linen dress still in stock? 👀" />
        <Bubble side="them" text="saw it on your reel yesterday, obsessed 😍" />

        <Bubble
          side="bot"
          text="Hi Maya! 💛 Yes — last 3 in size M. The linen midi is PKR 4,800 and ships free above 5k."
        />
        <Bubble side="bot" text="Here's the direct checkout 👇" />
        <Bubble side="bot" text="🔗 botlify.shop/linen-dress" link />

        <Bubble side="them" text="omg perfect. do you take cash on delivery?" />

        <Bubble
          side="bot"
          text="Yep — COD across PK, 2-3 day delivery. Want me to reserve one for you?"
        />

        <Bubble side="them" text="yes pls reserve M 🙌" />

        {/* Typing dots */}
        <div className="flex justify-end">
          <div className="px-3.5 py-2 rounded-md rounded-br-sm bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 shadow-sm">
            <div className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce"
                style={{ animationDelay: "240ms" }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-400 pl-1 pt-2 border-t border-ink-100/60 mt-3">
          <Bot className="w-3 h-3 text-brand-500" />
          <span>
            Auto-replied by{" "}
            <span className="font-semibold text-brand-600">Botlify AI</span> ·
            avg 0.8s · 12 replies today
          </span>
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
        className={`max-w-[80%] px-3.5 py-2 rounded-md text-sm leading-snug ${
          them
            ? "bg-white border border-ink-100 text-ink-800 rounded-bl-sm shadow-sm"
            : "bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white rounded-br-sm shadow-sm"
        }`}
      >
        {link ? (
          <span className="underline decoration-white/60">{text}</span>
        ) : (
          text
        )}
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
        <div className="mt-12 rounded-lg border border-ink-100 bg-white shadow-card overflow-hidden">
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
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
          subtitle="2,500+ creators and brands trust Botlify with their Instagram inbox."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="relative p-6 rounded-lg border border-ink-100 bg-white hover:shadow-glow hover:-translate-y-1 hover:border-brand-200 transition group"
            >
              <Quote className="absolute top-5 right-5 w-7 h-7 text-brand-100 group-hover:text-brand-200 transition" />
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-ink-700 leading-relaxed text-[15px]">
                "{t.quote}"
              </p>

              {t.metric && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                  <TrendingUp className="w-3 h-3" /> {t.metric}
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-ink-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900 truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-ink-500 truncate">
                    {t.handle && (
                      <span className="text-brand-600 font-medium">
                        {t.handle}
                      </span>
                    )}
                    {t.handle && " · "}
                    {t.role}
                  </p>
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
              className="p-5 rounded-lg bg-white border border-ink-100"
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
                className={`w-full text-left rounded-lg border transition ${active ? "border-brand-300 bg-gradient-to-br from-brand-50 to-white shadow-sm" : "border-ink-100 bg-white hover:border-ink-200"}`}
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
              className="group p-7 rounded-lg border border-ink-100 bg-white hover:border-brand-200 hover:shadow-glow hover:-translate-y-1 transition"
            >
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-md mb-4">
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
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-mesh-dark" />
      <div className="absolute inset-0 bg-grid-dark bg-grid-48 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] rounded-full bg-brand-500/25 blur-[140px] animate-blob" />
      <div
        className="absolute -bottom-40 left-1/4 w-[28rem] h-[28rem] rounded-full bg-pink-500/20 blur-[120px] animate-blob"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark text-xs font-semibold text-brand-200">
          <Sparkles className="w-3 h-3" /> Limited launch pricing — locked
          forever
        </span>
        <h2 className="mt-6 text-5xl sm:text-7xl font-black text-white tracking-tighter leading-[0.95] text-balance">
          Ready to never <br className="hidden sm:block" />
          <span className="text-gradient-animated">miss a DM again?</span>
        </h2>
        <p className="mt-6 text-ink-300 text-lg max-w-xl mx-auto leading-relaxed">
          Join 2,500+ creators automating Instagram with Botlify. Start free —
          upgrade when you outgrow it.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="btn-primary shine-on-hover !px-9 !py-4 text-base shadow-glow-lg"
          >
            Get started — it's free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pricing"
            className="btn glass-dark !text-white hover:!bg-white/10 !px-9 !py-4 text-base"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-400 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" /> No credit card required · Cancel
          anytime
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
