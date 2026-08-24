import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import ChannelWall from "@/components/ChannelWall";
import { CHANNEL_TOTAL_LABEL } from "@/data/otaChannels";
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
  MessageCircle,
  Send,
  Sparkles,
  Zap,
  Bot,
  Users,
  Users2,
  TrendingUp,
  Droplet,
  Megaphone,
  Heart,
  Shield,
  Rocket,
  PlayCircle,
  Mail,
  Star,
  LayoutDashboard,
  Inbox,
  BarChart3,
  Instagram,
  Crown,
  Building2,
  BedDouble,
  CalendarDays,
  LineChart,
  Globe,
  RefreshCw,
  PlugZap,
  ConciergeBell,
  Terminal,
  Layers,
  BadgePercent,
  Sparkle,
  Settings as SettingsIcon,
  DoorOpen,
  KeyRound,
  SprayCan,
  Minus,
  Home,
  Link2 as LinkIcon,
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
import BotlifyMark from "@/components/BotlifyMark";
import SupportChat from "@/components/SupportChat";

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
  { label: "Platform", href: "#features" },
  { label: "What it replaces", href: "#replaces" },
  { label: "Results", href: "#results" },
  { label: "Pricing", to: "/pricing" },
  { label: "Consultants", to: "/consultants" },
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
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur border border-brand-200 shadow-sm text-xs font-bold text-ink-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              60+ channels · Booking engine · AI
            </span>

            <h1 className="mt-5 text-[2.7rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem] font-black tracking-tighter text-ink-950">
              Every booking channel,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                  run by AI
                </span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="10"
                  viewBox="0 0 300 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7 C 80 2, 220 2, 298 6"
                    stroke="#ff5722"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink-600 max-w-2xl leading-relaxed">
              Botlify replaces your channel manager, booking engine, revenue
              manager and front desk — and runs them with AI. Booking.com,
              Airbnb, Agoda, Expedia, Traveloka and{" "}
              <b className="text-ink-800">55 more booking channels</b> — plus
              WhatsApp, Instagram and your own direct page — in one calendar,
              one inbox, one guest list.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition-all shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5"
              >
                Start free — connect your channels
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white border border-ink-200 text-ink-800 font-bold text-[15px] hover:border-brand-300 hover:text-brand-600 transition"
              >
                <PlayCircle className="w-4 h-4" /> See the whole platform
              </a>
            </div>

            {/* Punchy proof stats */}
            <div className="mt-9 grid grid-cols-3 gap-3 max-w-lg">
              {[
                { n: "0%", l: "Commission on OTA bookings" },
                { n: "60+", l: "Booking channels synced" },
                { n: "24/7", l: "Selling and answering" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl border border-ink-100 bg-white/70 backdrop-blur px-3 py-3 text-center"
                >
                  <p className="text-xl sm:text-2xl font-black text-ink-950">
                    {s.n}
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5 font-medium">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-500" /> Free plan — no card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-500" /> 10% only on bookings the bot closes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-500" /> No code needed
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
            60+ booking channels · Every booking lands in one calendar
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2.5 text-ink-800">
              <Globe className="w-6 h-6" style={{ color: "#003b95" }} />
              <span className="font-bold text-lg">Booking.com</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-800">
              <Home className="w-6 h-6" style={{ color: "#ff5a5f" }} />
              <span className="font-bold text-lg">Airbnb</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-800">
              <MessageCircle className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-lg">WhatsApp</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-800">
              <InstagramMark className="w-6 h-6 text-brand-500" />
              <span className="font-bold text-lg">Instagram</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-800">
              <LinkIcon className="w-6 h-6 text-brand-500" />
              <span className="font-bold text-lg">Your direct page</span>
            </div>
          </div>
          <ChannelWall
            variant="bare"
            size="compact"
            align="center"
            className="mt-6 pt-6 border-t border-ink-100"
            subtitle={
              <>
                Booking.com, Airbnb, Agoda, Expedia, Traveloka, Tiket.com and{" "}
                <b className="text-ink-800">50 more</b> through our connectivity
                partner. OTA sync is{" "}
                <b className="text-ink-800">free — 0% commission</b>: sell a
                room anywhere and every channel updates instantly.
              </>
            }
          />
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

/* Guest booking conversation data */
const IG_MESSAGES = [
  { from: "them", text: "hi! do you have a room free this weekend?" },
  {
    from: "me",
    text: (
      <>
        Hi 👋 Yes! Our Deluxe Double (sea view) is free Fri–Sun — <b>$79/night</b>,
        breakfast included.
      </>
    ),
  },
  { from: "them", text: "can you do 2 nights for 2 adults?" },
  { from: "me", text: "Of course — 2 nights × $79 = $158 total. Shall I book it? 🛎️" },
  { from: "them", text: "yes please!" },
  { from: "me", text: "Booked ✅ Confirmation #BK-2417. Need an airport pickup too?" },
  { from: "them", text: "wow that was fast 🤯 yes!" },
  { from: "me", text: "Pickup arranged ✈️ See you Friday — that's Botlify, 24/7." },
];

/* Instagram DM phone mockup */
function IgChatMockup() {
  return (
    <div className="relative h-[460px] sm:h-[540px] flex items-center justify-center">
      {/* Mascot peeking above the phone — kept clear of the AI-replied badge */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-10 right-2 sm:right-0 z-0 animate-float drop-shadow-xl"
      >
        <BotlifyMark size={112} className="sm:hidden" />
        <BotlifyMark size={128} className="hidden sm:block" />
      </div>

      {/* Phone */}
      <div className="relative z-10 w-[288px] sm:w-[320px] rounded-[2.4rem] bg-ink-950 p-2.5 shadow-2xl ring-1 ring-black/5">
        {/* notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink-950 rounded-b-2xl z-20" />
        <div className="rounded-[1.9rem] overflow-hidden bg-white">
          {/* IG DM header */}
          <div className="flex items-center gap-3 px-3.5 pt-6 pb-2.5 border-b border-ink-100 bg-white">
            <ChevronLeft className="w-5 h-5 text-ink-900 shrink-0" />
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-white ring-1 ring-ink-200 flex items-center justify-center overflow-hidden">
                <BotlifyMark size={30} />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-900 truncate leading-tight">
                yourhotel
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
              <div className="w-12 h-12 rounded-full bg-white ring-1 ring-ink-100 flex items-center justify-center">
                <BotlifyMark size={38} />
              </div>
              <p className="text-xs font-bold text-ink-800">yourhotel</p>
              <p className="text-[10px] text-ink-400">
                Concierge · Automated by Botlify
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
                        <span className="w-5 h-5 rounded-full bg-white ring-1 ring-ink-100 shrink-0 flex items-center justify-center overflow-hidden">
                          <BotlifyMark size={16} />
                        </span>
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
            Direct bookings <span className="text-[8px] text-ink-300 normal-case">(demo)</span>
          </p>
          <p className="text-sm font-black text-ink-900">
            +34% <span className="text-[10px] font-bold text-brand-600">this month</span>
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
  // Capability statements (true for every user) — no unverifiable metrics.
  const stats = [
    { value: "60+", label: "Booking channels synced" },
    { value: "0%", label: "Commission on OTA bookings" },
    { value: "$49", label: "Flat, per month" },
    { value: "10%", label: "Only on AI-closed bookings" },
  ];
  return (
    <section className="border-y border-ink-100 bg-brand-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <p className="text-center text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-ink-500">
          Channel manager (60+ OTAs) · Booking engine · Revenue manager ·
          Front desk · Guest CRM · AI
        </p>
        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-brand-100">
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
// The eight pillars of the platform, then the tools that sit under them.
const PLATFORM_PILLARS = [
  {
    icon: RefreshCw,
    title: "Channel manager",
    desc: "Booking.com, Airbnb, Agoda, Expedia, Traveloka and 55 more on one calendar. A room sells anywhere, availability drops everywhere — instantly.",
  },
  {
    icon: Globe,
    title: "Your own booking engine",
    desc: "A public direct-booking page at /book/your-hotel with live availability and instant confirmation. Commission-free.",
  },
  {
    icon: LineChart,
    title: "AI revenue manager",
    desc: "Watches occupancy, booking pace and your local market, then suggests a nightly rate. One tap pushes it to every channel.",
  },
  {
    icon: Terminal,
    title: "The Botlify Agent",
    desc: "Just tell it: \"change Deluxe to $95 next weekend\". It asks you to confirm, then does it.",
  },
  {
    icon: KeyRound,
    title: "Front desk (PMS)",
    desc: "Check-in, check-out, room assignment, housekeeping board and folio charges — the daily basics, done.",
  },
  {
    icon: Users,
    title: "Guest CRM",
    desc: "One profile per guest across every channel and OTA — stay history, preferences and lifetime value.",
  },
  {
    icon: ConciergeBell,
    title: "AI concierge",
    desc: "Answers guests on WhatsApp and Instagram 24/7 with real availability, and books the room.",
  },
  {
    icon: Star,
    title: "Reputation",
    desc: "Reviews collected in one place, with AI-drafted replies waiting for your approval.",
  },
];

const IG_FEATURES = [
  {
    icon: CalendarDays,
    title: "One live calendar",
    desc: "Every room, every night, every channel — in a single 30-day grid.",
  },
  {
    icon: Zap,
    title: "Instant availability push",
    desc: "Sell a room on any of 60+ channels and all the others update in seconds.",
  },
  {
    icon: BadgePercent,
    title: "0% on OTA bookings",
    desc: "We never take a cut of an OTA reservation — on any of the 60+ channels.",
  },
  {
    icon: Send,
    title: "Direct bookings",
    desc: "Your own page and in-chat booking — no OTA fee on either.",
  },
  {
    icon: TrendingUp,
    title: "Rate suggestions",
    desc: "Plain-language pricing advice: what to charge, and why.",
  },
  {
    icon: DoorOpen,
    title: "Check-in & check-out",
    desc: "Assign rooms, arrive guests and settle folios from the Today screen.",
  },
  {
    icon: SprayCan,
    title: "Housekeeping board",
    desc: "Clean, dirty, inspected — the whole floor at a glance.",
  },
  {
    icon: Layers,
    title: "Folio & extras",
    desc: "Breakfast, minibar, late check-out — charged straight to the room.",
  },
  {
    icon: Heart,
    title: "Guest profiles",
    desc: "Stays, preferences and lifetime value, merged across channels.",
  },
  {
    icon: Rocket,
    title: "Airport transfers",
    desc: "The AI arranges pickups & drop-offs — your car or a vetted partner.",
  },
  {
    icon: Inbox,
    title: "Unified inbox",
    desc: "WhatsApp and Instagram in one place — take over from the AI anytime.",
  },
  {
    icon: Megaphone,
    title: "Broadcasts",
    desc: "Fill low-season gaps with offers to past guests in one click.",
  },
  {
    icon: Droplet,
    title: "Pre-arrival messages",
    desc: "Automatic confirmations, directions and upsells before check-in.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Bookings, revenue, occupancy and channel mix — in real time.",
  },
  {
    icon: Building2,
    title: "Multi-property",
    desc: "Run several properties from a single Botlify workspace.",
  },
  {
    icon: Users2,
    title: "Team & permissions",
    desc: "Front desk, managers, owners — each with the right access.",
  },
];

function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>The whole operation</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Eight products your hotel pays for.{" "}
            <span className="text-brand-500">One platform.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-600">
            Channel manager, booking engine, revenue manager, front desk, guest
            CRM, reputation — plus an AI concierge and an agent you can just
            talk to. Built to run a hotel, not to chat.
          </p>
        </div>

        {/* Eight pillars */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORM_PILLARS.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative p-6 rounded-2xl border border-ink-100 hover:border-brand-300 bg-white transition-all duration-200 shadow-sm hover:shadow-glow hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-4 text-base font-black text-ink-950 leading-tight">
                  {f.title}
                </p>
                <p className="text-sm text-ink-600 mt-1.5 leading-snug">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-14 text-center text-[11px] uppercase tracking-[0.2em] font-bold text-ink-400">
          And everything underneath them
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <Rocket className="w-4 h-4" /> Start free — connect your channels
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * What Botlify replaces — the stack-collapse comparison
 * ──────────────────────────────────────────────────────────── */
const REPLACED_STACK = [
  {
    icon: RefreshCw,
    tool: "Channel manager",
    typical: "SiteMinder / Cloudbeds-style connectivity",
    note: "Monthly fee per property, per channel",
  },
  {
    icon: Globe,
    tool: "Booking engine",
    typical: "A direct-booking widget for your website",
    note: "Monthly fee, often plus a % of direct bookings",
  },
  {
    icon: LineChart,
    tool: "Revenue manager",
    typical: "A pricing tool — or a consultant on retainer",
    note: "The line item most small hotels skip entirely",
  },
  {
    icon: KeyRound,
    tool: "PMS / front desk",
    typical: "Check-in, housekeeping, folio software",
    note: "Monthly fee, usually per room",
  },
  {
    icon: Users,
    tool: "Guest CRM",
    typical: "A separate list of guests and their history",
    note: "Or, more often, a spreadsheet",
  },
  {
    icon: Bot,
    tool: "Chatbot / concierge",
    typical: "A widget that answers FAQs",
    note: "Usually can't see real availability",
  },
];

function WhatItReplaces() {
  return (
    <section id="replaces" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>What Botlify replaces</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Six subscriptions,{" "}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              one line item.
            </span>
          </h2>
          <p className="mt-4 text-ink-600">
            Most hotels stitch this stack together from separate vendors, each
            with its own login, its own bill and its own idea of what your
            availability is. Botlify is all of it, in one place.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-5 gap-6 items-start">
          {/* The old stack */}
          <div className="lg:col-span-3 rounded-2xl border border-ink-200 bg-ink-50/50 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-white border border-ink-200 text-ink-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </span>
              <p className="text-sm font-black uppercase tracking-wider text-ink-500">
                The usual stack
              </p>
            </div>
            <ul className="space-y-2.5">
              {REPLACED_STACK.map((r) => {
                const Icon = r.icon;
                return (
                  <li
                    key={r.tool}
                    className="flex items-start gap-3 rounded-xl bg-white border border-ink-100 px-4 py-3"
                  >
                    <span className="w-8 h-8 rounded-lg bg-ink-100 text-ink-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink-800">{r.tool}</p>
                      <p className="text-xs text-ink-500 leading-snug">
                        {r.typical}
                      </p>
                    </div>
                    <span className="hidden sm:block text-[11px] text-ink-400 text-right max-w-[10rem] leading-snug shrink-0">
                      {r.note}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-xs text-ink-400">
              <Minus className="w-3.5 h-3.5" /> Separate logins, separate bills,
              and availability that drifts out of sync.
            </p>
          </div>

          {/* Botlify */}
          <div className="lg:col-span-2 relative rounded-2xl bg-ink-950 text-white p-6 sm:p-7 shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-brand-500/25 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <BotlifyMark size={34} />
                <p className="text-sm font-black uppercase tracking-wider text-brand-300">
                  Botlify
                </p>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter">$49</span>
                <span className="text-white/60 text-sm">/ month, flat</span>
              </div>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                All six, plus the Botlify Agent, on one login and one calendar.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "0% commission on all OTA bookings — 60+ channels",
                  "10% only on bookings the AI closes for you",
                  "No per-room or per-channel pricing",
                  "Free plan available — start without a card",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-brand-300 shrink-0 mt-0.5" />
                    <span className="text-white/85 leading-snug">{p}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-6 flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition shadow-glow"
              >
                Replace the stack <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Competitor products are named to describe the category, not to compare
          prices — every vendor prices differently.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Every channel you sell on — the full channel wall
 * ──────────────────────────────────────────────────────────── */
function ChannelCoverage() {
  return (
    <section id="channels" className="py-16 sm:py-24 bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300">
            <Globe className="w-3.5 h-3.5" />
            Channel coverage
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            Every channel you sell on.{" "}
            <span className="text-brand-400">
              {CHANNEL_TOTAL_LABEL} of them.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/60">
            Botlify connects to the world's booking channels through our
            connectivity partner — one connection, two-way sync, and{" "}
            <b className="text-white">0% commission</b> from us on every one of
            them.
          </p>
        </div>

        <div className="mt-10">
          <ChannelWall
            variant="bare"
            align="center"
            dark
            subtitle="Plus 50 more — including regional channels across Asia, Europe and the Americas."
          />
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: RefreshCw,
              title: "Two-way, all of them",
              desc: "Rooms, rates and availability push out; reservations pull in. A sale anywhere drops availability everywhere.",
            },
            {
              icon: Globe,
              title: "Built for Indonesia too",
              desc: "Traveloka and Tiket.com sit alongside the global OTAs, so domestic travellers find you where they already book.",
            },
            {
              icon: BadgePercent,
              title: "0% commission, always",
              desc: "One flat monthly fee — never a cut of an OTA reservation, and never a per-channel charge.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
            >
              <span className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center">
                <c.icon className="w-5 h-5" />
              </span>
              <p className="mt-3 font-black text-[15px]">{c.title}</p>
              <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          Channels are connected through our connectivity partner. Availability
          of an individual channel depends on your property being eligible to
          list on it. Brand names are used to identify the channel only.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * The Botlify Agent — tell your hotel what to do
 * ──────────────────────────────────────────────────────────── */
const AGENT_TURNS = [
  {
    you: "Change Deluxe Double to $95 for next weekend",
    bot: "Deluxe Double, Fri 29 – Sun 31 Aug: $79 → $95. This pushes to all 60+ connected channels and your direct page. Confirm?",
    tag: "Needs confirmation",
  },
  {
    you: "Who checks in today?",
    bot: "4 arrivals: Ahmed K. (Deluxe 204, 2 nights), the Rossi family (Suite 301), Mia L. (Twin 108) and one Airbnb arrival with no ETA yet.",
    tag: "Read-only",
  },
  {
    you: "Block room 3 tomorrow — the AC is out",
    bot: "Room 3 blocked for Mon 25 Aug and pulled from every channel. Confirm?",
    tag: "Needs confirmation",
  },
  {
    you: "How did we do last month?",
    bot: "68% occupancy (up from 61%), $14.2k revenue, ADR $86. Direct bookings were 31% of the total — your best month for direct so far.",
    tag: "Read-only",
  },
];

function BotlifyAgent() {
  const [turn, setTurn] = useState(0);
  const active = AGENT_TURNS[turn];
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-white via-brand-50/40 to-white">
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-0 mx-auto h-72 max-w-4xl rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>The Botlify Agent</Eyebrow>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
              Just tell your hotel{" "}
              <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                what to do.
              </span>
            </h2>
            <p className="mt-4 text-lg text-ink-600 leading-relaxed">
              No menus, no extranets, no hunting for the right screen. Type it
              the way you'd say it to a manager — rates, blocks, arrivals,
              last month's numbers — and the agent does it across every channel.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ["Plain language", "\"Drop the Twin to $60 midweek\" is a valid instruction."],
                ["Confirms before it acts", "Anything that changes money or availability asks you first."],
                ["Reaches every channel", "One instruction updates all 60+ connected channels and your direct page."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm text-ink-700 leading-snug">
                    <b className="text-ink-900">{t}</b> — {d}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Agent console */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-brand-500/10 to-accent-500/10 blur-2xl" />
            <div className="relative rounded-2xl border border-ink-200/60 bg-ink-950 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <Terminal className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-black text-white">
                  Botlify Agent
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="p-4 space-y-3 min-h-[15rem]">
                <div className="flex justify-end">
                  <span className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500 text-white text-sm px-4 py-2.5 leading-snug">
                    {active.you}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <BotlifyMark size={18} />
                  </span>
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.07] border border-white/10 px-4 py-2.5">
                    <p className="text-sm text-white/85 leading-snug">
                      {active.bot}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">
                      <Shield className="w-3 h-3" /> {active.tag}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt chips */}
              <div className="border-t border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/35 mb-2 px-1">
                  Try one
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_TURNS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setTurn(i)}
                      className={`text-left text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition ${
                        i === turn
                          ? "bg-brand-500 text-white"
                          : "bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {t.you}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Results / Charts
 * ──────────────────────────────────────────────────────────── */
const replyData = [
  { d: "Mon", auto: 62, manual: 41 },
  { d: "Tue", auto: 68, manual: 44 },
  { d: "Wed", auto: 71, manual: 46 },
  { d: "Thu", auto: 76, manual: 48 },
  { d: "Fri", auto: 88, manual: 55 },
  { d: "Sat", auto: 94, manual: 61 },
  { d: "Sun", auto: 85, manual: 52 },
];
const conversionData = [
  { m: "Wk 1", before: 74, after: 79 },
  { m: "Wk 2", before: 76, after: 84 },
  { m: "Wk 3", before: 75, after: 89 },
  { m: "Wk 4", before: 78, after: 96 },
];

function Results() {
  return (
    <section id="results" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>One dashboard, not five extranets</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Occupancy, rate and channel mix — live.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-600">
            Because every channel writes to the same calendar, your numbers are
            one number. Occupancy, ADR, revenue and where each booking came from
            — without opening a single OTA extranet.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400 bg-ink-50 border border-ink-100 rounded-full px-3 py-1">
            <Info className="w-3 h-3" /> Example dashboard · illustrative data
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          {/* Replies area chart */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500 flex items-center gap-1.5">
                  Occupancy this week, by night
                  <span className="text-[9px] text-ink-400 bg-ink-100 rounded px-1.5 py-0.5 normal-case tracking-normal">Example</span>
                </p>
                <p className="text-2xl font-black text-ink-950 mt-1">
                  78% <span className="text-brand-600 text-sm">avg occupancy</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  This week
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-300" />
                  Same week last year
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
                <p className="text-[11px] uppercase font-bold tracking-wider text-ink-500 flex items-center gap-1.5">
                  Average nightly rate — base vs. AI-suggested
                  <span className="text-[9px] text-ink-400 bg-ink-100 rounded px-1.5 py-0.5 normal-case tracking-normal">Example</span>
                </p>
                <p className="text-2xl font-black text-ink-950 mt-1">
                  $96 <span className="text-brand-500 text-sm">ADR after approvals</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-300" />
                  Base rate
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Approved
                </span>
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
      title: "Connect your channels",
      desc: "Link Booking.com, Airbnb, Agoda, Expedia, Traveloka and 55 more through our connectivity partner — plus WhatsApp and Instagram. One calendar starts filling up.",
      icon: PlugZap,
    },
    {
      n: "02",
      title: "Import your rooms & rates",
      desc: "Pull your room types, rates and photos straight from your OTA listing — or add them by hand in a few minutes. Your direct booking page goes live with them.",
      icon: BedDouble,
    },
    {
      n: "03",
      title: "The platform runs it",
      desc: "Availability syncs everywhere, the revenue manager suggests rates, the concierge answers guests, and the front desk handles arrivals — you approve the calls that matter.",
      icon: Sparkle,
    },
  ];
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-white via-ink-50/50 to-white">
      {/* soft brand glow behind the section */}
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-0 mx-auto h-64 max-w-3xl rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Your whole stack, live in{" "}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              three steps.
            </span>
          </h2>
          <p className="mt-4 text-ink-600">
            No code, no migration project, no implementation fee. Connect,
            import, and your channel manager, booking engine and front desk are
            all running before checkout time.
          </p>
        </div>

        <div className="relative mt-16">
          {/* connecting line across the three cards (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden md:block">
            <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* floating number + icon badge */}
                  <div className="relative mb-6">
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30 ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                      <Icon className="h-8 w-8 text-white" strokeWidth={2.2} />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-xs font-black text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                  </div>

                  <div className="w-full rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:shadow-card-lg">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
                      Step {s.n}
                    </span>
                    <h3 className="mt-2 text-lg font-black text-ink-950">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Product showcase — realistic dashboard mockups in a browser frame
 * ──────────────────────────────────────────────────────────── */

// A macOS-style browser chrome wrapper for product shots.
function BrowserFrame({ url = "botlify.site/dashboard", children, className = "" }) {
  return (
    <div
      className={`group relative rounded-2xl border border-ink-200/60 bg-white shadow-[0_30px_70px_-25px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.03] overflow-hidden transition-transform duration-500 hover:-translate-y-1 ${className}`}
    >
      {/* top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      {/* toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-ink-50 to-ink-100/70 border-b border-ink-100">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57] ring-1 ring-black/5" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e] ring-1 ring-black/5" />
        <span className="w-3 h-3 rounded-full bg-[#28c840] ring-1 ring-black/5" />
        <div className="ml-2 hidden sm:flex items-center gap-1 text-ink-300">
          <ChevronLeft className="w-3.5 h-3.5" />
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
        <div className="ml-2 flex-1 max-w-sm">
          <div className="flex items-center gap-1.5 rounded-lg bg-white border border-ink-200/80 px-3 py-1 text-[11px] text-ink-400 truncate shadow-sm">
            <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
            {url}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

// The Botlify sidebar, reproduced faithfully for the mockup.
function MockSidebar({ active = "Today" }) {
  const groups = [
    {
      title: null,
      items: [
        ["Today", LayoutDashboard],
        ["Bookings", BedDouble],
        ["Calendar", CalendarDays],
        ["Guests", Users],
        ["Settings", SettingsIcon],
      ],
    },
  ];
  return (
    <div className="w-48 shrink-0 bg-ink-950 text-white/80 py-3 hidden sm:flex flex-col">
      <div className="flex items-center gap-2 px-4 pb-3 mb-1 border-b border-white/5">
        <BotlifyMark size={24} />
        <div className="leading-none">
          <div className="text-white font-black text-[13px]">Botlify</div>
          <div className="text-[7px] uppercase tracking-wider text-white/40">
            Hotel Platform
          </div>
        </div>
      </div>
      <div className="flex-1">
        {groups.map((g, gi) => (
          <div key={gi} className="px-2 mt-2.5">
            {g.title && (
              <div className="px-2 text-[8px] font-bold uppercase tracking-widest text-white/25 mb-1">
                {g.title}
              </div>
            )}
            {g.items.map(([label, Icon]) => {
              const on = label === active;
              return (
                <div
                  key={label}
                  className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium mb-0.5 transition ${
                    on
                      ? "bg-brand-500/15 text-white"
                      : "text-white/55"
                  }`}
                >
                  {on && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-brand-500" />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${on ? "text-brand-400" : ""}`}
                  />
                  {label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* mini plan card */}
      <div className="mx-2 mt-2 rounded-lg bg-white/[0.04] border border-white/10 p-2">
        <div className="flex items-center gap-1 text-[9px] font-bold text-white/80">
          <Crown className="w-2.5 h-2.5 text-brand-400" /> PRO PLAN
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-accent-400" />
        </div>
      </div>
    </div>
  );
}

function ProductShowcase() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-ink-950">
      {/* glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] rounded-full bg-brand-500/20 blur-[130px]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-wider text-brand-200">
            See it in action
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
            One calendar. Every channel.{" "}
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Always true.
            </span>
          </h2>
          <p className="mt-4 text-white/60">
            All 60+ channels, your direct page and the AI all write to the
            same grid — so the availability you see is the availability that
            exists.
          </p>
        </div>

        {/* Main product shot — the shared calendar */}
        <BrowserFrame className="mx-auto max-w-5xl" url="botlify.site/dashboard/calendar">
          <div className="flex bg-ink-50/60 h-[420px]">
            <MockSidebar active="Calendar" />
            <div className="flex-1 min-w-0 overflow-hidden">
              <MockCalendar />
            </div>
          </div>
        </BrowserFrame>

        {/* Secondary shots row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 max-w-5xl mx-auto">
          <BrowserFrame url="botlify.site/dashboard">
            <div className="h-56 bg-white">
              <MockToday />
            </div>
          </BrowserFrame>
          <BrowserFrame url="botlify.site/dashboard/calendar">
            <div className="h-56 bg-white">
              <MockRevenue />
            </div>
          </BrowserFrame>
          <BrowserFrame url="botlify.site/book/seaview-hotel">
            <div className="h-56 bg-white">
              <MockBookingPage />
            </div>
          </BrowserFrame>
          <BrowserFrame url="botlify.site/dashboard/analytics">
            <div className="h-56 bg-white">
              <MockAnalytics />
            </div>
          </BrowserFrame>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Product screens — illustrative data
          </span>
        </div>
      </div>
    </section>
  );
}

// Calendar mock — one grid, bookings from every channel.
const CAL_ROWS = [
  {
    room: "Deluxe Double",
    rate: "$95",
    cells: [
      { span: 3, src: "bkg", label: "Booking.com" },
      { span: 2, src: null },
      { span: 4, src: "direct", label: "Direct" },
      { span: 3, src: null },
      { span: 2, src: "ai", label: "AI" },
    ],
  },
  {
    room: "Sea View Suite",
    rate: "$140",
    cells: [
      { span: 2, src: null },
      { span: 4, src: "abnb", label: "Airbnb" },
      { span: 3, src: null },
      { span: 5, src: "bkg", label: "Booking.com" },
    ],
  },
  {
    room: "Twin Standard",
    rate: "$62",
    cells: [
      { span: 4, src: "direct", label: "Direct" },
      { span: 2, src: null },
      { span: 3, src: "bkg", label: "Booking.com" },
      { span: 5, src: null },
    ],
  },
  {
    room: "Family Room",
    rate: "$120",
    cells: [
      { span: 3, src: null },
      { span: 5, src: "ai", label: "AI concierge" },
      { span: 6, src: null },
    ],
  },
];

const CAL_COLORS = {
  bkg: "bg-[#003b95] text-white",
  abnb: "bg-[#ff5a5f] text-white",
  direct: "bg-brand-500 text-white",
  ai: "bg-ink-900 text-white",
};

function MockCalendar() {
  return (
    <div className="p-4 text-left h-full flex flex-col bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-sm font-black text-ink-900">Calendar</div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-ink-400">
          Aug 2026 · all channels
        </span>
        <div className="ml-auto flex items-center gap-2.5 text-[8px] font-bold">
          {[
            ["Booking.com", "bg-[#003b95]"],
            ["Airbnb", "bg-[#ff5a5f]"],
            ["Direct", "bg-brand-500"],
            ["AI", "bg-ink-900"],
          ].map(([l, c]) => (
            <span key={l} className="inline-flex items-center gap-1 text-ink-500">
              <span className={`w-2 h-2 rounded-sm ${c}`} /> {l}
            </span>
          ))}
        </div>
      </div>

      {/* day header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-24 shrink-0" />
        <div
          className="flex-1 grid gap-px"
          style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="text-[7px] text-center font-bold text-ink-300"
            >
              {18 + i}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 flex-1">
        {CAL_ROWS.map((r) => (
          <div key={r.room} className="flex items-center gap-2">
            <div className="w-24 shrink-0">
              <div className="text-[9px] font-bold text-ink-800 truncate">
                {r.room}
              </div>
              <div className="text-[8px] text-ink-400">{r.rate} / night</div>
            </div>
            <div
              className="flex-1 grid gap-px h-6"
              style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
            >
              {r.cells.map((c, i) =>
                c.src ? (
                  <div
                    key={i}
                    style={{ gridColumn: `span ${c.span} / span ${c.span}` }}
                    className={`rounded-[3px] flex items-center px-1.5 text-[7px] font-bold truncate ${CAL_COLORS[c.src]}`}
                  >
                    {c.label}
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{ gridColumn: `span ${c.span} / span ${c.span}` }}
                    className="rounded-[3px] bg-ink-50 border border-dashed border-ink-100"
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-2 flex items-center gap-2">
        <LineChart className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <p className="text-[9px] text-ink-700 leading-snug flex-1">
          <b>Sep 3–5 is 30% booked</b> — usually 70% this close. Drop Deluxe
          Double to $85?
        </p>
        <span className="text-[8px] font-bold text-white bg-brand-500 rounded px-2 py-1 shrink-0">
          Approve
        </span>
      </div>
    </div>
  );
}

// Today mock — front desk arrivals / departures / housekeeping.
function MockToday() {
  return (
    <div className="p-3 text-left h-full flex flex-col">
      <div className="text-xs font-black text-ink-900 mb-2">Today</div>
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {[
          ["Arrivals", "4", DoorOpen],
          ["Departures", "3", KeyRound],
          ["In house", "11", BedDouble],
        ].map(([l, v, Icon]) => (
          <div key={l} className="rounded-lg border border-ink-100 p-1.5">
            <div className="flex items-center gap-1 text-[7px] text-ink-400 uppercase font-bold">
              <Icon className="w-2.5 h-2.5" /> {l}
            </div>
            <div className="text-sm font-black text-ink-900">{v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1 flex-1">
        {[
          ["Ahmed K.", "Deluxe 204 · 2 nights", "Check in", "bkg"],
          ["Rossi family", "Suite 301 · 4 nights", "Check in", "direct"],
          ["Mia L.", "Twin 108 · departing", "Check out", "abnb"],
        ].map(([n, d, a, src]) => (
          <div
            key={n}
            className="flex items-center gap-2 rounded-lg border border-ink-100 px-2 py-1.5"
          >
            <span
              className={`w-1.5 h-6 rounded-full shrink-0 ${CAL_COLORS[src].split(" ")[0]}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-ink-800 truncate">
                {n}
              </div>
              <div className="text-[8px] text-ink-400 truncate">{d}</div>
            </div>
            <span className="text-[8px] font-bold text-brand-600 bg-brand-50 rounded px-1.5 py-0.5 shrink-0">
              {a}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-ink-50 px-2 py-1.5">
        <SprayCan className="w-3 h-3 text-ink-400 shrink-0" />
        <span className="text-[8px] text-ink-500">
          Housekeeping · 3 dirty, 2 inspected, 6 clean
        </span>
      </div>
    </div>
  );
}

// Revenue manager mock — rate suggestions awaiting approval.
function MockRevenue() {
  const recs = [
    ["Sep 3–5", "Deluxe Double", "$95 → $85", "30% booked · usually 70%"],
    ["Sep 12–14", "Sea View Suite", "$140 → $165", "Local event · demand up"],
    ["Sep 20", "Twin Standard", "$62 → $55", "Midweek gap"],
  ];
  return (
    <div className="p-3 text-left h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-2">
        <LineChart className="w-3.5 h-3.5 text-brand-500" />
        <div className="text-xs font-black text-ink-900">Revenue manager</div>
        <span className="ml-auto text-[8px] font-bold text-brand-600 bg-brand-50 rounded px-1.5 py-0.5">
          3 suggestions
        </span>
      </div>
      <div className="space-y-1.5 flex-1">
        {recs.map(([d, room, change, why]) => (
          <div key={d} className="rounded-lg border border-ink-100 p-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-ink-800">{d}</span>
              <span className="text-[8px] text-ink-400 truncate">{room}</span>
              <span className="ml-auto text-[9px] font-black text-brand-600 shrink-0">
                {change}
              </span>
            </div>
            <div className="text-[8px] text-ink-400 mt-0.5">{why}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <button className="flex-1 rounded-lg bg-brand-500 text-white text-[10px] font-bold py-1.5">
          Approve all
        </button>
        <button className="rounded-lg border border-ink-200 text-ink-500 text-[10px] font-bold px-3 py-1.5">
          Review
        </button>
      </div>
    </div>
  );
}

// Direct booking page mock — the hotel's own OTA.
function MockBookingPage() {
  return (
    <div className="text-left h-full flex flex-col bg-white">
      <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5 text-brand-500" />
        <span className="text-[11px] font-black text-ink-900">
          Seaview Hotel
        </span>
        <span className="ml-auto text-[8px] font-bold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
          Book direct
        </span>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <div className="flex gap-1 mb-2">
          {["Check in", "Check out", "2 guests"].map((f) => (
            <div
              key={f}
              className="flex-1 rounded-md border border-ink-200 px-1.5 py-1 text-[8px] text-ink-500 truncate"
            >
              {f}
            </div>
          ))}
        </div>
        <div className="space-y-1.5 flex-1">
          {[
            ["Deluxe Double", "$95", "2 left", true],
            ["Sea View Suite", "$140", "1 left", true],
            ["Twin Standard", "$62", "Sold out", false],
          ].map(([n, p, avail, free]) => (
            <div
              key={n}
              className="flex items-center gap-2 rounded-lg border border-ink-100 p-1.5"
            >
              <span className="w-8 h-8 rounded bg-ink-100 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold text-ink-800 truncate">
                  {n}
                </div>
                <div
                  className={`text-[8px] ${free ? "text-emerald-600" : "text-ink-300"}`}
                >
                  {avail}
                </div>
              </div>
              <div className="text-[10px] font-black text-ink-900 shrink-0">
                {p}
              </div>
              <span
                className={`text-[8px] font-bold rounded px-1.5 py-0.5 shrink-0 ${
                  free
                    ? "bg-brand-500 text-white"
                    : "bg-ink-100 text-ink-300"
                }`}
              >
                Book
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[8px] text-ink-400">
          <BadgePercent className="w-2.5 h-2.5 text-brand-500" />
          No OTA commission — the guest books you directly.
        </div>
      </div>
    </div>
  );
}

// AI concierge mock — setup + live-availability test.
function MockAiBot() {
  return (
    <div className="p-4 space-y-3 text-left">
      <div className="rounded-xl bg-gradient-to-r from-ink-900 to-ink-800 text-white px-4 py-3 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
          <Bot className="w-4 h-4 text-brand-300" />
        </span>
        <div>
          <div className="text-sm font-bold flex items-center gap-1.5">
            AI concierge
            <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-brand-200">
              WhatsApp &amp; Instagram
            </span>
          </div>
          <div className="text-[10px] text-white/60">
            Reads your live calendar, quotes real availability, books the room.
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      <div className="rounded-xl border border-ink-100 bg-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-black text-ink-900">Concierge setup</span>
          <span className="ml-auto text-[9px] font-bold text-white bg-gradient-to-r from-brand-500 to-accent-500 px-2 py-1 rounded-lg inline-flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Auto-draft
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-[10px] text-ink-600">
            <b className="text-ink-800">Role:</b> Concierge for Seaview Hotel —
            quote only rooms free on the live calendar…
          </div>
          <div className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-[10px] text-ink-600">
            <b className="text-rose-600">Guardrails:</b> never overbook; hold
            the room while confirming; hand off complaints…
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-ink-100 bg-white overflow-hidden">
        <div className="px-3 py-2 bg-gradient-to-r from-brand-50/60 to-accent-50/40 border-b border-ink-100 text-xs font-black text-ink-900 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-brand-500" /> Test the
          concierge
        </div>
        <div className="p-2.5 space-y-1.5 bg-ink-50/40">
          <div className="flex justify-end">
            <span className="bg-brand-500 text-white text-[10px] rounded-lg rounded-br-sm px-2.5 py-1.5">
              Do you have a double room for Friday?
            </span>
          </div>
          <div className="flex justify-start">
            <span className="bg-white border border-ink-100 text-ink-800 text-[10px] rounded-lg rounded-bl-sm px-2.5 py-1.5">
              Yes — Deluxe Double, $95/night 😊 Book it?
              <span className="block mt-1 text-[8px] font-bold uppercase text-brand-500">
                live calendar · 2 rooms free
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockInbox() {
  const chats = [
    ["sara.travels", "Is breakfast included?", true],
    ["mike_backpacks", "Room for 2 this weekend?", false],
    ["famtrip.pk", "Do you do airport pickup?", false],
    ["Ahmed K.", "Can I check in early?", false],
  ];
  return (
    <div className="flex h-full text-left">
      <div className="w-40 border-r border-ink-100 shrink-0">
        <div className="px-3 py-2 text-xs font-black text-ink-900 border-b border-ink-100">
          Guest inbox
        </div>
        {chats.map(([u, m, active], i) => (
          <div
            key={i}
            className={`px-3 py-2 border-b border-ink-50 ${active ? "bg-brand-50/60" : ""}`}
          >
            <div className="text-[11px] font-bold text-ink-800">@{u}</div>
            <div className="text-[9px] text-ink-500 truncate">{m}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col bg-ink-50/40">
        <div className="p-2.5 space-y-1.5 flex-1">
          <div className="flex justify-start">
            <span className="bg-white border border-ink-100 text-[10px] rounded-lg px-2.5 py-1.5">
              Is breakfast included?
            </span>
          </div>
          <div className="flex justify-end">
            <span className="bg-brand-500 text-white text-[10px] rounded-lg px-2.5 py-1.5">
              Yes! Free breakfast 7–10am 🥐
              <span className="block text-[7px] opacity-70">
                ⚡ AI replied
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockAnalytics() {
  const bars = [40, 65, 50, 80, 60, 95, 75];
  return (
    <div className="p-3 text-left h-full flex flex-col">
      <div className="text-xs font-black text-ink-900 mb-2">Performance</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          ["Occupancy", "78%"],
          ["ADR", "$96"],
          ["Direct", "31%"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-ink-100 p-2">
            <div className="text-[8px] text-ink-400 uppercase font-bold">
              {l}
            </div>
            <div className="text-sm font-black text-ink-900">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-end gap-1.5 px-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-brand-500 to-brand-400"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Smart Automations mock — trigger cards.
function MockAutomations() {
  const rows = [
    ["Booking.com", "Rates & availability · two-way", RefreshCw, true],
    ["Airbnb", "Rates & availability · two-way", RefreshCw, true],
    ["Direct booking page", "/book/seaview-hotel · live", Globe, true],
    ["Agoda", "Rates & availability · two-way", RefreshCw, true],
    ["+ 57 more channels", "Expedia, Traveloka, Tiket.com…", PlugZap, false],
  ];
  return (
    <div className="p-3 text-left h-full">
      <div className="text-xs font-black text-ink-900 mb-2">
        Connected channels
      </div>
      <div className="space-y-2">
        {rows.map(([t, s, Icon, on], i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg border border-ink-100 p-2"
          >
            <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-ink-800">{t}</div>
              <div className="text-[9px] text-ink-400 truncate">{s}</div>
            </div>
            <span
              className={`w-8 h-4 rounded-full relative shrink-0 ${on ? "bg-emerald-500" : "bg-ink-200"}`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${on ? "left-4" : "left-0.5"}`}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * What we provide — alternating feature rows with dashboard shots
 * ──────────────────────────────────────────────────────────── */
function WhatWeProvide() {
  const features = [
    {
      icon: RefreshCw,
      tag: "Channel manager",
      title: "Sell the same room everywhere, safely",
      desc: "Booking.com, Airbnb, Agoda, Expedia, Vrbo, Traveloka, Tiket.com, Trip.com, Hostelworld and Google Hotel Ads — plus 50 more through our connectivity partner, 60+ channels on one calendar. The moment a room sells on any channel, availability drops on all of them, so the double-booking phone call stops happening. Rates and restrictions push out the same way.",
      points: [
        "60+ channels, two-way sync — rooms, rates, availability",
        "0% commission from us on OTA bookings",
        "No per-channel or per-room fees",
      ],
      Mock: MockAutomations,
      url: "botlify.site/dashboard/settings",
      nav: "Settings",
    },
    {
      icon: Globe,
      tag: "Booking engine",
      title: "Your own OTA, at your own address",
      desc: "Every hotel gets a public booking page at /book/your-hotel — real photos, real live availability and instant confirmation. Put it on your Instagram bio, your WhatsApp replies and your website, and take the booking without paying anyone 15%.",
      points: [
        "Live availability from the same calendar",
        "Instant confirmation, no back-and-forth",
        "Commission-free direct bookings",
      ],
      Mock: MockBookingPage,
      url: "botlify.site/book/seaview-hotel",
      nav: "Calendar",
    },
    {
      icon: LineChart,
      tag: "Revenue manager",
      title: "Pricing advice in plain English",
      desc: "It watches your occupancy against your booking pace and what's happening locally, then tells you what to change and why: “Sep 3–5 is 30% booked, usually 70% this close — drop to $85?” One tap approves it and the new rate lands on every channel at once.",
      points: [
        "Reasons you can actually check",
        "You approve — nothing changes on its own",
        "Approved rates push everywhere instantly",
      ],
      Mock: MockRevenue,
      url: "botlify.site/dashboard/calendar",
      nav: "Calendar",
    },
    {
      icon: KeyRound,
      tag: "Front desk",
      title: "Run the day from one screen",
      desc: "Arrivals, departures and who's in house, with room assignment, check-in and check-out in a click. Housekeeping tracks clean, dirty and inspected, and anything the guest adds — breakfast, late check-out, the minibar — goes onto the folio.",
      points: [
        "Check-in, check-out, room assignment",
        "Housekeeping board",
        "Folio & extras charged to the room",
      ],
      Mock: MockToday,
      url: "botlify.site/dashboard",
      nav: "Today",
    },
    {
      icon: ConciergeBell,
      tag: "AI concierge",
      title: "Answers guests, and can close the booking",
      desc: "On WhatsApp and Instagram, 24/7, in your hotel's voice. Because it reads the same calendar as everything else, it quotes real availability rather than guessing — then books the room, arranges the airport pickup and sells the upgrade. Your front desk can take over mid-conversation.",
      points: [
        "Quotes live availability, not canned answers",
        "Books rooms, transfers and extras",
        "Human takeover anytime",
      ],
      Mock: MockAiBot,
      url: "botlify.site/dashboard/settings",
      nav: "Settings",
    },
    {
      icon: Users,
      tag: "Guest CRM & reputation",
      title: "One profile per guest, whatever the channel",
      desc: "The same person who booked on Booking.com last year and messaged you on WhatsApp this year is one guest, with one history, one set of preferences and a lifetime value you can see. Reviews land in the same place, with replies drafted for you to approve.",
      points: [
        "Merged across every channel and OTA",
        "Stay history, preferences, lifetime value",
        "AI-drafted review replies for approval",
      ],
      Mock: MockInbox,
      url: "botlify.site/dashboard/guests",
      nav: "Guests",
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow>Inside the platform</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Six products, and they all read the{" "}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              same calendar.
            </span>
          </h2>
          <p className="mt-4 text-ink-600">
            That's the part separate tools can't do. Here's each one, as it
            actually looks.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {features.map((f, i) => {
            const Icon = f.icon;
            const Mock = f.Mock;
            const flip = i % 2 === 1;
            return (
              <div
                key={f.tag}
                className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center"
              >
                {/* Copy */}
                <div className={flip ? "lg:order-2" : ""}>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                    <Icon className="w-3.5 h-3.5" /> {f.tag}
                  </span>
                  <h3 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-ink-950">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-ink-600 leading-relaxed">{f.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {f.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2.5 text-sm font-medium text-ink-800"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mock shot */}
                <div className={`relative ${flip ? "lg:order-1" : ""}`}>
                  {/* soft brand glow behind the frame */}
                  <div
                    className={`pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr ${
                      flip
                        ? "from-accent-500/10 to-brand-500/10"
                        : "from-brand-500/10 to-accent-500/10"
                    } blur-2xl`}
                  />
                  <BrowserFrame url={f.url} className="relative">
                    <div className="h-64 bg-ink-50/40 flex">
                      <div className="hidden md:block">
                        <MockSidebar active={f.nav} />
                      </div>
                      <div className="flex-1 min-w-0 bg-white overflow-hidden">
                        <Mock />
                      </div>
                    </div>
                  </BrowserFrame>
                </div>
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
  // Factual use cases (who Botlify is for + what it does) — no fabricated
  // reviews or customer counts.
  const items = [
    {
      icon: Building2,
      role: "Boutique hotels",
      quote:
        "One calendar behind all 60+ channels and your direct page — so the double-booking panic stops, and the revenue manager nudges the rate up on the nights you'd have undersold.",
    },
    {
      icon: BedDouble,
      role: "Guesthouses & B&Bs",
      quote:
        "No channel manager subscription, no booking-engine plugin, no PMS. Rooms, rates, arrivals and guest messages all live in the same place — and the agent handles the admin you'd otherwise do at 11pm.",
    },
    {
      icon: Users,
      role: "Hotel groups",
      quote:
        "Every property on one login, with a guest profile that follows the guest between them — plus team permissions and occupancy, ADR and channel mix across all locations.",
    },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Who it's for</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            Built for every kind of stay.
          </h2>
          <p className="mt-3 text-ink-600 text-base sm:text-lg">
            Independent properties that need the whole stack, without paying for
            it five times over.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400 bg-ink-50 border border-ink-100 rounded-full px-3 py-1">
            <Info className="w-3 h-3" /> Illustrative use cases, not customer
            quotes
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <t.icon className="w-5 h-5" />
              </div>
              <p className="mt-4 text-sm font-black uppercase tracking-wider text-brand-600">
                {t.role}
              </p>
              <p className="mt-2 text-ink-700 leading-relaxed">{t.quote}</p>
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
      name: "Launch (Free)",
      usd: 0,
      desc: "Get all 60+ channels synced and start taking bookings.",
      features: [
        "Channel manager — 60+ OTA channels",
        "0% commission on OTA bookings",
        "Your direct booking page",
        "One calendar, 1 property, unlimited rooms",
        "Front desk: check-in, check-out, folio",
        "AI concierge on WhatsApp",
        "10% only on bookings the AI closes",
      ],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Botlify for Hotels",
      usd: 49,
      desc: "The whole platform — flat, per month.",
      features: [
        "Everything in Launch",
        "AI revenue manager & rate approvals",
        "The Botlify Agent — run it by typing",
        "AI concierge on WhatsApp & Instagram",
        "Guest CRM across every channel",
        "Reviews with AI-drafted replies",
        "Airport transfers & upsells",
        "Broadcasts, team access & priority support",
        "3-day free trial",
      ],
      cta: "Start 3-day trial",
      highlight: true,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-ink-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>Simple pricing</Eyebrow>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-950">
            $49 for the whole stack.
          </h2>
          <p className="mt-3 text-ink-600">
            Flat monthly price — not per room, not per channel. We take{" "}
            <b className="text-ink-900">0%</b> on your OTA
            bookings, and <b className="text-ink-900">10%</b> only on bookings
            the AI closes for you — well under the 15–18% an OTA charges for
            the same reservation. Cancel anytime.
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
                    ${usd}
                  </span>
                  <span className={`text-sm ${t.highlight ? "text-white/60" : "text-ink-500"}`}>{sub}</span>
                </div>
                <p className={`mt-1 text-sm ${t.highlight ? "text-white/70" : "text-ink-500"}`}>
                  {isYearly && t.usd ? "Billed yearly — 2 months free" : t.desc}
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
        {/* Commission model — stated plainly, including how it's settled */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-ink-100 bg-ink-50/60">
              <p className="text-sm font-black text-ink-900 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-brand-500" />
                And the commission, in full
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                On top of the flat subscription — three lines, no small print.
              </p>
            </div>

            <ul className="divide-y divide-ink-100">
              {[
                {
                  icon: Check,
                  source: "OTA bookings — all 60+ channels",
                  rate: "0%",
                  cls: "bg-emerald-50 border-emerald-100 text-emerald-700",
                  why: "OTA sync is completely free. We never take a cut of a reservation that arrived through an OTA.",
                },
                {
                  icon: BadgePercent,
                  source: "Bookings the AI closes",
                  sub: "WhatsApp · Instagram · Messenger · Telegram · your direct page",
                  rate: "10%",
                  cls: "bg-brand-50 border-brand-200 text-brand-700",
                  why: "OTAs charge 15–18% for the same reservation — this is cheaper, and it's on revenue you wouldn't otherwise have had.",
                },
                {
                  icon: Rocket,
                  source: "Airport transfers",
                  sub: "Only when we arrange one through our partner network",
                  rate: "~5–10%",
                  cls: "bg-ink-100 border-ink-200 text-ink-700",
                  why: "A small partner margin. Hotels with their own driver keep 100%.",
                },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <li key={r.source} className="px-5 sm:px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-ink-50 text-ink-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-ink-900 leading-snug">
                            {r.source}
                          </p>
                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${r.cls}`}
                          >
                            {r.rate}
                          </span>
                        </div>
                        {r.sub && (
                          <p className="mt-0.5 text-[11px] text-ink-400 leading-snug">
                            {r.sub}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
                          {r.why}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="px-5 sm:px-6 py-4 bg-brand-50/50 border-t border-brand-100">
              <p className="text-sm font-black text-ink-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-500" />
                Tracked automatically, settled manually
              </p>
              <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
                Every commissionable booking is recorded in a ledger in your
                dashboard as it happens, and we email you a statement each
                month. You settle it by bank transfer or invoice.{" "}
                <b className="text-ink-900">
                  Botlify never takes money out of your account and never sits
                  between your guest and your payments
                </b>{" "}
                — the hotel always collects from the guest directly.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Free plan needs no card · Paid plan includes a 3-day free trial ·
          No setup fee, no per-room pricing · Cancel anytime
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
    q: "What exactly is Botlify?",
    a: "A complete operating platform for a hotel. It is your channel manager (60+ booking channels on one calendar), your booking engine (your own direct-booking page), your revenue manager (AI rate suggestions you approve), your front desk (check-in, check-out, housekeeping, folio), your guest CRM and your reputation inbox — plus an AI concierge on WhatsApp and Instagram and an agent you can simply give instructions to. One login, one calendar, one bill.",
  },
  {
    q: "Do I still need a channel manager?",
    a: "No — Botlify is the channel manager. Your rooms, rates and availability sync two-way with your OTAs, and the instant a room sells anywhere, availability drops everywhere. There is nothing else to subscribe to and nothing to wire the two products together.",
  },
  {
    q: "Do I need a separate booking engine for my website?",
    a: "No. Every property gets a public booking page at /book/your-hotel with your real photos, live availability from the same calendar, and instant confirmation. Link it from your website, your Instagram bio or a WhatsApp reply — those bookings are commission-free.",
  },
  {
    q: "What does it cost?",
    a: "$49 a month, flat — not per room and not per channel. We take 0% commission on bookings that come through any of the 60+ OTA channels, and 10% only on bookings the AI closes for you in chat, which is well below the 15–18% an OTA takes for the same reservation. There is a free plan you can start on today with no card, and the paid plan has a 3-day free trial.",
  },
  {
    q: "Which OTAs do you connect to?",
    a: "Booking.com, Airbnb, Agoda, Expedia, Vrbo, Traveloka, Tiket.com, Trip.com, Hostelworld and Google Hotel Ads — plus 50+ more, so 60+ booking channels in total, all through one connection with our connectivity partner. Traveloka and Tiket.com matter especially for Indonesian domestic travellers. Your rooms, rates and availability stay in sync in both directions on every connected channel, and OTA sync costs 0% commission.",
  },
  {
    q: "Does it replace my PMS?",
    a: "For the front-desk basics, yes: check-in and check-out, room assignment, a housekeeping board (clean / dirty / inspected) and a folio so extras like breakfast, late check-out or the minibar get charged to the room. If you run a large property that depends on deep accounting, interfaces or night-audit workflows, treat Botlify as your day-to-day front desk rather than a full enterprise PMS replacement.",
  },
  {
    q: "How does the AI revenue manager work?",
    a: "It compares your occupancy against your booking pace and what is happening in your local market, then suggests a nightly rate in plain language — for example, “Sep 3–5 is 30% booked, usually 70% this close to the date — drop to $85?” Nothing changes until you approve it. When you do, the new rate is pushed to every connected channel and your direct page at once.",
  },
  {
    q: "What is the Botlify Agent?",
    a: "It is the platform's command line in plain language. Type “change Deluxe to $95 next weekend”, “who checks in today?”, “block room 3 tomorrow” or “how did we do last month?” and it does it or answers it. Anything that changes a rate, an availability or a booking asks you to confirm first.",
  },
  {
    q: "Where does the AI concierge work?",
    a: "WhatsApp and Instagram. Because it reads the same live calendar as the rest of the platform, it quotes availability that is actually true — then books the room, arranges an airport transfer and sells extras. Your front desk can take over any conversation mid-way.",
  },
  {
    q: "Will it double-book my rooms?",
    a: "No. Every channel writes to one calendar, availability is synced two-way with your OTAs, and both the booking page and the AI check live availability before confirming anything.",
  },
  {
    q: "How long does setup take?",
    a: "About 10 minutes. Connect your channels, import your rooms and rates from your OTA listing (or add them by hand), and your calendar, direct booking page and front desk are live. No migration project and no setup fee.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime. Manage or cancel your subscription in one click from the Billing page. If you cancel, you keep access until the end of your current period.",
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
          <p className="mt-3 text-ink-600">
            What it replaces, what it costs, and where the edges are.
          </p>
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
            <div
              aria-hidden="true"
              className="mx-auto w-fit mb-5 animate-float drop-shadow-2xl"
            >
              <BotlifyMark size={104} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
              Cancel four subscriptions. Keep one calendar.
            </h2>
            <p className="mt-4 text-white/70 text-base sm:text-lg max-w-xl mx-auto">
              Connect your channels, import your rooms, and your channel
              manager, booking engine, revenue manager and front desk are all
              running by this afternoon — for $49 a month.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition shadow-glow"
              >
                Start free — connect your channels{" "}
                <ArrowRight className="w-4 h-4" />
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
              The complete hotel platform. Channel manager, booking engine, AI
              revenue manager, front desk and guest CRM — with Booking.com,
              Airbnb, WhatsApp and Instagram on one calendar.
            </p>
            <div className="mt-4 flex items-center gap-3 text-ink-500">
              <InstagramMark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/consultants" className="hover:text-white">Consultant Program</Link></li>
              <li><Link to="/guide" className="hover:text-white">Guide</Link></li>
              <li><a href="#features" className="hover:text-white">Platform</a></li>
              <li><a href="#replaces" className="hover:text-white">What it replaces</a></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              <li>
                <a href="mailto:contactus@botlify.site" className="hover:text-white inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Botlify. All rights reserved.</p>
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
      <WhatItReplaces />
      <ChannelCoverage />
      <ProductShowcase />
      <WhatWeProvide />
      <BotlifyAgent />
      <Results />
      <HowItWorks />
      <Testimonials />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
      <SupportChat />
    </div>
  );
}
