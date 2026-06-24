import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  Phone,
  Video,
  Camera,
  Mic,
  Image as ImageIcon,
  Smile,
  Info,
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
  Star,
  LayoutDashboard,
  Workflow,
  Inbox,
  BarChart3,
  AtSign,
  Reply,
  Tag,
  Instagram,
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
} from "recharts";
import * as THREE from "three";
import Logo from "@/components/Logo";

// vanta.net reads `window.THREE` at module-evaluation time, so it MUST exist
// before the vanta module is imported. We set it here, then dynamically import
// vanta inside the effect (so it evaluates after this runs).
if (typeof window !== "undefined") window.THREE = THREE;

/* ────────────────────────────────────────────────────────────
 * Instagram brand mark SVG
 * ──────────────────────────────────────────────────────────── */
function InstagramMark({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.16c3.2 0 3.58 0 4.85.07c1.17.05 1.8.25 2.23.41c.56.22.96.48 1.38.9c.42.42.68.82.9 1.38c.16.42.36 1.06.41 2.23c.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41c-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23c-.07-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23c.22-.56.48-.96.9-1.38c.42-.42.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07a8.94 8.94 0 0 0-2.96.57a5.96 5.96 0 0 0-2.16 1.4A5.96 5.96 0 0 0 .54 4.2a8.94 8.94 0 0 0-.57 2.95C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95a8.94 8.94 0 0 0 .57 2.96a5.96 5.96 0 0 0 1.4 2.16a5.96 5.96 0 0 0 2.16 1.4a8.94 8.94 0 0 0 2.95.57C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07a8.94 8.94 0 0 0 2.96-.57a6.22 6.22 0 0 0 3.56-3.56a8.94 8.94 0 0 0 .57-2.95c.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95a8.94 8.94 0 0 0-.57-2.96a5.96 5.96 0 0 0-1.4-2.16a5.96 5.96 0 0 0-2.16-1.4a8.94 8.94 0 0 0-2.95-.57C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12A6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4a4 4 0 0 1-4 4m6.41-11.85a1.44 1.44 0 1 0 1.44 1.44a1.44 1.44 0 0 0-1.44-1.44"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Top nav
 * ──────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Results", href: "#results" },
  { label: "Pricing", to: "/pricing" },
  { label: "Guide", to: "/guide" },
];

function TopNav() {
  const token = useAuthStore((s) => s.token);
  const isAuthed = !!token;
  const [open, setOpen] = useState(false);

  const NavItem = ({ link, onClick, className = "" }) =>
    link.to ? (
      <Link to={link.to} onClick={onClick} className={className}>
        {link.label}
      </Link>
    ) : (
      <a href={link.href} onClick={onClick} className={className}>
        {link.label}
      </a>
    );

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        {/* Left: logo */}
        <Link to="/" className="flex items-center shrink-0">
          <Logo size="lg" />
        </Link>

        {/* Right: links + actions, grouped & aligned */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          <nav className="flex items-center gap-7 lg:gap-9 text-[15px] font-semibold text-ink-600">
            {NAV_LINKS.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                className="relative py-1 transition-colors hover:text-ink-900 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-all hover:after:w-full"
              />
            ))}
          </nav>
          <div className="flex items-center gap-3 pl-2 border-l border-ink-100">
            {isAuthed ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition shadow-glow"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[15px] font-semibold text-ink-700 hover:text-ink-900 transition px-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition shadow-glow"
                >
                  Start free <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -mr-2 rounded-lg text-ink-700 hover:bg-ink-50 transition"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white px-4 sm:px-6 py-4">
          <nav className="flex flex-col text-base font-semibold text-ink-800">
            {NAV_LINKS.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                onClick={() => setOpen(false)}
                className="py-3 border-b border-ink-50 hover:text-brand-600 transition"
              />
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5">
            {isAuthed ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-500 text-white font-bold hover:bg-brand-600 transition shadow-glow"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-ink-200 text-ink-800 font-bold hover:border-brand-300 hover:text-brand-600 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-500 text-white font-bold hover:bg-brand-600 transition shadow-glow"
                >
                  Start free <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
 * Vanta NET animated background — orange points on white.
 * Uses the bundled three + vanta packages (self-contained, no CDN).
 * ──────────────────────────────────────────────────────────── */
function VantaNetBackground({ className = "" }) {
  const ref = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    // vanta.net captures window.THREE at module-eval time — set it before importing.
    if (typeof window !== "undefined") window.THREE = THREE;
    import("vanta/dist/vanta.net.min")
      .then((mod) => {
        const NET = mod.default || mod;
        if (cancelled || !ref.current || effectRef.current) return;
        effectRef.current = NET({
          el: ref.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          points: 12.0, // moderate density — present but not noisy
          maxDistance: 23.0, // generous line reach for a connected web
          spacing: 18.0, // airy gaps so the text/phone stay the focus
          color: 0xff5722, // brand orange — dots + connecting lines
          backgroundColor: 0xffffff, // white
        });
        const cv = ref.current.querySelector("canvas");
        console.info(
          `[VantaNet] initialized — canvas ${cv ? cv.width + "x" + cv.height : "MISSING"}`
        );
      })
      .catch((e) => console.error("[VantaNet] failed to initialize:", e));

    return () => {
      cancelled = true;
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={className} />;
}

/* ────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden isolate">
      <div className="absolute inset-0 -z-10">
        {/* Vanta NET animated network */}
        <VantaNetBackground className="absolute inset-0" />
        {/* readability overlays: crisp text on the left, net visible on the right, fade to white at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-200 shadow-sm text-xs font-semibold text-ink-700">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Instagram automation platform
              <span className="ml-1 text-ink-400">·</span>
              <InstagramMark className="w-3.5 h-3.5 text-brand-500" />
            </span>

            <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-ink-950 leading-[1.02]">
              Turn every Instagram{" "}
              <span className="text-brand-500">chat into a customer.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink-600 max-w-2xl leading-relaxed">
              Botlify automates your DMs, comments, story replies, broadcasts and AI replies — on autopilot. Set up once. Sells while you sleep.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition shadow-glow"
              >
                Start free — 3 days
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white border border-ink-200 text-ink-800 font-bold text-sm hover:border-brand-300 hover:text-brand-600 transition"
              >
                <PlayCircle className="w-4 h-4" /> See what it automates
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-500" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-500" /> 3-day free trial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-500" /> Cancel anytime
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <IgChatMockup />
          </div>
        </div>

        {/* Platform strip */}
        <div
          id="platform"
          className="mt-16 sm:mt-20 rounded-2xl border border-ink-100 bg-white/70 backdrop-blur p-5 sm:p-6 shadow-card"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink-500 text-center">
            Supported platform
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2.5 text-ink-800">
              <InstagramMark className="w-7 h-7 text-brand-500" />
              <span className="font-bold text-lg">Instagram</span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Official API
              </span>
            </div>
            <div className="h-8 w-px bg-ink-100 hidden sm:block" />
            <div className="flex items-center gap-2 text-ink-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="italic">More channels coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Instagram's real DM colors */
const IG_SENT_GRADIENT =
  "linear-gradient(135deg, #5B51D8 0%, #9C2CB5 50%, #D62976 100%)";
const IG_RECEIVED_BG = "#efefef";
const IG_RECEIVED_TEXT = "#262626";

/* Instagram DM conversation data */
const IG_MESSAGES = [
  { from: "them", text: 'commented "PRICE" on your reel' },
  {
    from: "me",
    text: (
      <>
        Hey 👋 thanks for the comment! Here's the link &amp; today's 15% off
        code: <b>BOT15</b>
      </>
    ),
  },
  { from: "them", text: "do you have it in red?" },
  { from: "me", text: "Yes 🔴 — small / medium / large all in stock. Reserve one?" },
  { from: "them", text: "yes!" },
  { from: "me", text: "Reserved ✅ I'll DM the checkout link in 1 min." },
  { from: "them", text: "wow that was fast 🤯" },
  { from: "me", text: "That's Botlify — always on, never sleeping." },
];

/* Instagram DM phone mockup */
function IgChatMockup() {
  return (
    <div className="relative h-[460px] sm:h-[540px] flex items-center justify-center">
      {/* Mascot peeking above the phone — kept clear of the AI-replied badge */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-10 right-2 sm:right-0 w-24 sm:w-32 object-contain z-0 animate-float drop-shadow-xl"
      />

      {/* Phone */}
      <div className="relative z-10 w-[288px] sm:w-[320px] rounded-[2.4rem] bg-ink-950 p-2.5 shadow-2xl ring-1 ring-black/5">
        {/* notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink-950 rounded-b-2xl z-20" />
        <div className="rounded-[1.9rem] overflow-hidden bg-white">
          {/* IG DM header */}
          <div className="flex items-center gap-3 px-3.5 pt-6 pb-2.5 border-b border-ink-100 bg-white">
            <ChevronLeft className="w-5 h-5 text-ink-900 shrink-0" />
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt=""
                className="w-9 h-9 rounded-full object-contain bg-white ring-1 ring-ink-200 p-0.5"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-900 truncate leading-tight">
                yourbrand
              </p>
              <p className="text-[11px] text-ink-400 leading-tight">Active now</p>
            </div>
            <Phone className="w-5 h-5 text-ink-800 shrink-0" />
            <Video className="w-5 h-5 text-ink-800 shrink-0" />
            <Info className="w-5 h-5 text-ink-800 shrink-0" />
          </div>

          {/* Thread */}
          <div className="px-3 py-3 h-[330px] sm:h-[392px] overflow-hidden bg-white flex flex-col">
            {/* meta row */}
            <div className="flex flex-col items-center gap-1.5 pb-3 text-center">
              <img
                src="/logo.png"
                alt=""
                className="w-12 h-12 rounded-full object-contain bg-white ring-1 ring-ink-100 p-1"
              />
              <p className="text-xs font-bold text-ink-800">yourbrand</p>
              <p className="text-[10px] text-ink-400">
                Instagram · Automated by Botlify
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-end gap-0.5">
              {IG_MESSAGES.map((m, i) => {
                const isMe = m.from === "me";
                const prev = IG_MESSAGES[i - 1];
                const next = IG_MESSAGES[i + 1];
                const firstInGroup = !prev || prev.from !== m.from;
                const lastInGroup = !next || next.from !== m.from;
                return (
                  <div
                    key={i}
                    className={`flex items-end gap-1.5 ${
                      isMe ? "justify-end" : "justify-start"
                    } ${firstInGroup ? "mt-2" : ""}`}
                  >
                    {!isMe &&
                      (lastInGroup ? (
                        <img
                          src="/logo.png"
                          alt=""
                          className="w-5 h-5 rounded-full object-contain bg-white ring-1 ring-ink-100 shrink-0"
                        />
                      ) : (
                        <span className="w-5 shrink-0" />
                      ))}
                    <div
                      className={`max-w-[78%] px-3.5 py-2 text-[12px] leading-snug rounded-[20px] ${
                        isMe
                          ? "text-white " + (lastInGroup ? "rounded-br-md" : "")
                          : lastInGroup
                          ? "rounded-bl-md"
                          : ""
                      }`}
                      style={
                        isMe
                          ? { background: IG_SENT_GRADIENT }
                          : { background: IG_RECEIVED_BG, color: IG_RECEIVED_TEXT }
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IG message input bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-ink-100 bg-white">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ background: IG_SENT_GRADIENT }}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div className="flex-1 flex items-center justify-between gap-2 rounded-full bg-ink-100 pl-3.5 pr-3 py-2">
              <span className="text-[12px] text-ink-400">Message…</span>
              <div className="flex items-center gap-2.5 text-ink-500">
                <Mic className="w-4 h-4" />
                <ImageIcon className="w-4 h-4" />
                <Smile className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating: AI replied — top-left, away from the mascot */}
      <div className="absolute top-10 -left-3 sm:-left-6 bg-white rounded-xl shadow-xl border border-ink-100 px-3 py-2 flex items-center gap-2 z-20">
        <Bot className="w-4 h-4 text-brand-500" />
        <p className="text-xs font-bold text-ink-800">AI replied · 0.3 s</p>
      </div>

      {/* floating: conversion stat — bottom-right */}
      <div className="absolute bottom-8 -right-3 sm:-right-6 bg-white rounded-xl shadow-2xl border border-ink-100 px-4 py-2.5 flex items-center gap-3 z-20">
        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-ink-500 tracking-wider">
            DM conv. rate
          </p>
          <p className="text-sm font-black text-ink-900">
            34% <span className="text-[10px] font-bold text-brand-600">+3×</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Shared section eyebrow label (uniform across all sections)
 * ──────────────────────────────────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-bold uppercase tracking-wider text-brand-600">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
 * Trust / social-proof bar
 * ──────────────────────────────────────────────────────────── */
function TrustBar() {
  const stats = [
    { value: "1,200+", label: "Creators & brands" },
    { value: "2M+", label: "DMs automated" },
    { value: "34%", label: "Avg DM conversion" },
    { value: "24/7", label: "Always-on replies" },
  ];
  return (
    <section className="border-y border-ink-100 bg-brand-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-brand-100">
          {stats.map((s, i) => (
            <div key={i} className="text-center px-2">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-brand-500">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-ink-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Instagram features section
 * ──────────────────────────────────────────────────────────── */
const IG_FEATURES = [
  {
    icon: Hash,
    title: "Comment → DM",
    desc: "Auto-DM anyone who comments your keyword on a post or reel.",
  },
  {
    icon: Heart,
    title: "Story replies & mentions",
    desc: "Auto-respond when someone replies to or tags your story.",
  },
  {
    icon: Bot,
    title: "AI chatbot",
    desc: "Smart conversations that close sales in your DMs.",
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
  {
    icon: Megaphone,
    title: "Bulk broadcasts",
    desc: "Send promos & updates to thousands of DM subscribers.",
  },
  {
    icon: Workflow,
    title: "Visual flow builder",
    desc: "Drag-and-drop conversation flows — no coding needed.",
  },
  {
    icon: Tag,
    title: "Contact tagging",
    desc: "Segment followers and send targeted campaigns.",
  },
  {
    icon: BarChart3,
    title: "Advanced analytics",
    desc: "Track replies, leads and sales in real time.",
  },
  {
    icon: ShoppingBag,
    title: "Smart orders",
    desc: "Take orders via DM with COD / delivery tracking built in.",
  },
  {
    icon: Inbox,
    title: "Team inbox",
    desc: "Hand off conversations to your human agents seamlessly.",
  },
];

function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>Everything in one platform</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Every Instagram touchpoint,{" "}
            <span className="text-brand-500">automated.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-600">
            Comments, DMs, stories, broadcasts — Botlify handles every interaction so you never miss a lead.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {IG_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group flex gap-3.5 p-5 rounded-2xl border border-ink-100 hover:border-brand-300 bg-white transition-all duration-200 shadow-sm hover:shadow-glow hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900 leading-tight">{f.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition shadow-glow"
          >
            <Rocket className="w-4 h-4" /> Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
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
          <Eyebrow>Results that show up</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Numbers that matter, in real time.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-600">
            Track every reply, click and sale from your Instagram — without opening five tabs.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          {/* Replies area chart */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500">
                  Replies this week
                </p>
                <p className="text-2xl font-black text-ink-950 mt-1">
                  3,820 <span className="text-brand-600 text-sm">+38%</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Auto-replies
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-300" />
                  Manual
                </span>
              </div>
            </div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={replyData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5722" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ff5722" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="auto" stroke="#ff5722" strokeWidth={2.5} fill="url(#g1)" />
                  <Area type="monotone" dataKey="manual" stroke="#94a3b8" strokeWidth={2} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion bar */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500">
                  Conversion rate (before vs. after Botlify)
                </p>
                <p className="text-2xl font-black text-ink-950 mt-1">
                  +2.9× <span className="text-brand-500 text-sm">avg lift</span>
                </p>
              </div>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="before" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="after" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5722" />
                      <stop offset="100%" stopColor="#ffa470" />
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
      title: "Connect Instagram",
      desc: "Link your Instagram business account securely in under a minute.",
      icon: Instagram,
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
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            From zero to automated in three steps.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <p className="text-5xl font-black text-ink-100 leading-none">{s.n}</p>
                <div className="mt-3 w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mt-4 font-bold text-ink-950 text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed">{s.desc}</p>
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
      quote: "Comment-to-DM alone tripled our DM lead flow. Botlify pays for itself in two days.",
    },
    {
      name: "Hamza R.",
      role: "Owner, FitMart Gym",
      quote: "AI replies at midnight. We close Instagram sales while we sleep — every single night.",
    },
    {
      name: "Zoya M.",
      role: "Boutique owner",
      quote: "Set up in one evening. Customers DM us from reels and get answered instantly. Game changer.",
    },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Loved by creators</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Loved by busy founders.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <div className="flex items-center gap-1 text-brand-500">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-brand-500" />
                ))}
              </div>
              <p className="mt-4 text-ink-800 leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 pt-4 border-t border-ink-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                  {t.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.role}</p>
                </div>
                <InstagramMark className="w-5 h-5 text-brand-500" />
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
  const [cycle, setCycle] = useState("monthly");
  const isYearly = cycle === "yearly";
  const tiers = [
    {
      name: "Basic",
      usd: 8,
      pkr: 2240,
      desc: "For solo creators & small brands.",
      features: [
        "1 Instagram account",
        "1,000 conversations/month",
        "Comment → DM, story replies",
        "AI smart replies (200/day)",
        "Basic analytics",
        "3-day free trial",
      ],
      cta: "Start Basic",
      highlight: false,
    },
    {
      name: "Pro",
      usd: 19,
      pkr: 5499,
      desc: "For growing brands that never sleep.",
      features: [
        "Unlimited conversations",
        "Unlimited contacts",
        "Premium AI · context-aware",
        "Broadcasts + drip campaigns",
        "Advanced analytics",
        "Team inbox (3 seats)",
        "Remove Botlify branding",
        "3-day free trial",
      ],
      cta: "Start Pro",
      highlight: true,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Simple pricing</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            One price. All of Instagram.
          </h2>
          <p className="mt-3 text-ink-600">
            No per-message fees. No hidden charges. Cancel anytime.
          </p>
        </div>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-ink-200 shadow-sm">
            <button
              onClick={() => setCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${
                !isYearly ? "bg-ink-950 text-white" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition inline-flex items-center gap-1.5 ${
                isYearly ? "bg-ink-950 text-white" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              Yearly
              <span className="text-[10px] font-black uppercase tracking-wide bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
                2 months free
              </span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {tiers.map((t, i) => {
            const usd = isYearly ? t.usd * 10 : t.usd;
            const pkr = isYearly ? t.pkr * 10 : t.pkr;
            const sub = isYearly ? "/ year" : "/ month";
            return (
              <div
                key={i}
                className={`relative rounded-2xl p-6 sm:p-7 border transition ${
                  t.highlight
                    ? "bg-ink-950 text-white border-ink-950 shadow-2xl scale-[1.02]"
                    : "bg-white border-ink-100 shadow-card hover:border-ink-300"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white">
                    Most popular
                  </span>
                )}
                <p className={`text-xs uppercase font-bold tracking-wider ${t.highlight ? "text-white/70" : "text-ink-500"}`}>
                  {t.name}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tighter">
                    Rs {pkr.toLocaleString()}
                  </span>
                  <span className={`text-sm ${t.highlight ? "text-white/60" : "text-ink-500"}`}>{sub}</span>
                  <span className={`text-sm font-bold ${t.highlight ? "text-white/50" : "text-ink-400"}`}>· ${usd}</span>
                </div>
                <p className={`mt-1 text-sm ${t.highlight ? "text-white/70" : "text-ink-500"}`}>
                  {isYearly ? "Billed yearly — 2 months free" : t.desc}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {t.features.map((f, k) => (
                    <li key={k} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${t.highlight ? "text-brand-300" : "text-brand-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/pricing"
                  className={`mt-6 block text-center px-4 py-3 rounded-lg font-bold text-sm transition ${
                    t.highlight
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "bg-ink-950 text-white hover:bg-ink-900"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          Both plans include a 3-day free trial · No credit card required
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * FAQ
 * ──────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Is the AI chatbot the only thing Botlify does?",
    a: "Far from it. Botlify is the full automation platform — AI replies are one feature. You also get comment → DM, story replies, mention triggers, broadcasts, drag-drop flows, contact tagging, drip campaigns, analytics, and more.",
  },
  {
    q: "Will Meta ban my Instagram account?",
    a: "Botlify uses the official Instagram API — 100% Meta-approved. Your account stays safe.",
  },
  {
    q: "How long does setup take?",
    a: "About 6 minutes. Connect Instagram, add your first trigger, flip the switch — done.",
  },
  {
    q: "What does the AI run on?",
    a: "Basic plan gets AI · Standard. Pro unlocks faster, smarter responses with longer memory. Either way, the AI is trained on your business — not generic.",
  },
  {
    q: "Does Botlify work with my existing CRM / Shopify / Stripe?",
    a: "Webhooks are open out of the box. Native integrations are rolling out monthly — first up: Shopify, Zapier, Make.",
  },
  {
    q: "Is there a free plan?",
    a: "Every plan starts with a 3-day free trial — no card required. After that, pick Basic or Pro.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Frequently asked</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            The small-print questions, answered.
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left rounded-2xl border border-ink-100 bg-white px-5 py-4 hover:border-brand-300 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-ink-900 text-sm sm:text-base">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-ink-400 flex-shrink-0 transition ${open === i ? "rotate-180 text-ink-900" : ""}`} />
              </div>
              {open === i && (
                <p className="mt-3 text-sm text-ink-600 leading-relaxed">{f.a}</p>
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
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-500 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-600 blur-3xl" />
          </div>
          <div className="relative">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="mx-auto w-24 sm:w-28 object-contain mb-5 animate-float drop-shadow-2xl"
            />
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
              Stop replying. Start automating.
            </h2>
            <p className="mt-4 text-white/70 text-base sm:text-lg max-w-xl mx-auto">
              Connect Instagram. Build your first automation. Watch DMs turn into customers — on autopilot.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition shadow-glow"
              >
                Start free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition"
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
            <Logo size="md" dark />
            <p className="mt-3 text-sm max-w-xs">
              The Instagram automation platform for creators and brands. Set up once. Sells while you sleep.
            </p>
            <div className="mt-4 flex items-center gap-3 text-ink-500">
              <InstagramMark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/guide" className="hover:text-white">Guide</Link></li>
              <li><a href="#features" className="hover:text-white">Features</a></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              <li>
                <a href="mailto:support@botlify.site" className="hover:text-white inline-flex items-center gap-1.5">
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
      <TrustBar />
      <Features />
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
