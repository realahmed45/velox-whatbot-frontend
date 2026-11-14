/**
 * Botlify — landing page.
 *
 * Pitch (and nothing else): Botlify is the AI channel manager for hotels. It
 * syncs rooms, rates and availability across Airbnb, Booking.com and Expedia,
 * and its AI answers every guest message inside those OTA inboxes and on
 * WhatsApp — replacing the human work of guest messaging.
 *
 * Light, airy, fast. Motion is opacity/transform only (no animated blur, no
 * scroll-jacking, no custom cursor) so scrolling stays smooth on any laptop.
 * Honest claims: Booking.com, Airbnb and Expedia are named as live; the rest
 * are "coming".
 */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Globe2,
  Hand,
  Languages,
  Menu,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import BotlifyMark from "@/components/BotlifyMark";
import SupportChat from "@/components/SupportChat";
import OtaLogo from "@/components/OtaLogo";
import { WhatsAppMark } from "@/components/ChannelMarks";
import { Aurora, NumberTicker, Reveal, SlidingTabs, Spotlight } from "@/components/fx";

const EASE = [0.16, 1, 0.3, 1];

// ─────────────────────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────────────────────
const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Guide", to: "/guide" },
];

function Nav() {
  const isAuthed = !!useAuthStore((s) => s.token);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const Item = ({ l, className, onClick }) =>
    l.to ? (
      <Link to={l.to} className={className} onClick={onClick}>
        {l.label}
      </Link>
    ) : (
      <a href={l.href} className={className} onClick={onClick}>
        {l.label}
      </a>
    );

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-ink-900/[0.06] bg-white/80 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link to="/" aria-label="Botlify home" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Item
              key={l.label}
              l={l}
              className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-ink-600 transition-colors hover:bg-ink-900/[0.04] hover:text-ink-950"
            />
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link to="/dashboard" className="btn-primary px-4 py-2">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-ink-700 hover:text-ink-950">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
        <button
          className="btn-secondary p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-ink-900/[0.06] bg-white px-4 pb-4 pt-2 shadow-lg md:hidden"
          >
            {LINKS.map((l) => (
              <Item
                key={l.label}
                l={l}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-[15px] font-medium text-ink-800 hover:bg-ink-900/[0.04]"
              />
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {isAuthed ? (
                <Link to="/dashboard" className="btn-primary col-span-2">Open dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary">Sign in</Link>
                  <Link to="/register" className="btn-primary">Start free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <div aria-hidden className="absolute inset-0 -z-10 bg-dot-grid opacity-50 mask-fade-b" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:pb-28">
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-700 shadow-sm ring-1 ring-ink-900/[0.07]"
          >
            <Sparkles className="h-3.5 w-3.5 text-sunset-flame" />
            The AI channel manager for hotels
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            className="mt-6 font-display text-[2.6rem] font-semibold leading-[1] tracking-[-0.045em] text-ink-950 min-[400px]:text-5xl sm:text-6xl lg:text-[4.4rem]"
          >
            Your guests message on Airbnb.{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-sunset">Botlify answers.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600"
          >
            Botlify keeps Airbnb, Booking.com and Expedia in sync on one calendar — and its AI replies to
            every guest inside those inboxes and on WhatsApp. Instantly, in their language, around the
            clock. No more front-desk hours spent answering the same questions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/register" className="btn-primary px-6 py-3.5 text-[15px]">
              Start free — no card <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="btn-secondary px-6 py-3.5 text-[15px]">
              See how it works
            </a>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-500">
            {["Set up in 10 minutes", "0% commission on OTA bookings", "You approve anything sensitive"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          <UnifiedInbox />
        </motion.div>
      </div>
    </section>
  );
}

// The product in one picture: guests on three channels, one AI answering.
const THREADS = [
  {
    channel: "airbnb",
    label: "Airbnb",
    guest: "Maya · arriving Fri",
    q: "Hi! What time can we check in? We land at 11am 🙏",
    a: "Hi Maya! Check-in is from 2pm, but your room is free that morning — I've noted early check-in from 12pm at no charge. See you Friday!",
  },
  {
    channel: "booking",
    label: "Booking.com",
    guest: "Lukas · 3 nights",
    q: "Is breakfast included in my booking? And is there parking?",
    a: "Breakfast is included, served 7–10:30am by the pool. Free parking is right at the entrance — no need to reserve.",
  },
  {
    channel: "whatsapp",
    label: "WhatsApp",
    guest: "Sofia · new enquiry",
    q: "Any room for 2 this weekend? How much?",
    a: "Yes! The Ocean Deluxe is free Fri–Sun at $120/night with breakfast. Want me to book it for you?",
  },
];

function ChannelIcon({ channel, size = 22 }) {
  if (channel === "whatsapp") {
    return (
      <span className="grid shrink-0 place-items-center rounded-full bg-[#25D366]" style={{ width: size, height: size }}>
        <WhatsAppMark className="h-[60%] w-[60%] text-white" />
      </span>
    );
  }
  return <OtaLogo channelKey={channel} size={size} />;
}

function UnifiedInbox() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [replied, setReplied] = useState(!!reduce);

  useEffect(() => {
    if (reduce) return;
    setReplied(false);
    const t1 = setTimeout(() => setReplied(true), 1400);
    const t2 = setTimeout(() => setActive((i) => (i + 1) % THREADS.length), 6200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, reduce]);

  const t = THREADS[active];
  return (
    <div className="relative mx-auto max-w-[560px]">
      <div className="card overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-2 border-b border-ink-900/[0.06] bg-ink-50/70 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 text-xs font-medium text-ink-500">Botlify · Guest messages</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI on
          </span>
        </div>

        <div className="grid sm:grid-cols-[180px_1fr]">
          <div className="hidden border-r border-ink-900/[0.06] bg-white/60 p-2 sm:block">
            {THREADS.map((th, i) => (
              <button
                key={th.channel}
                onClick={() => setActive(i)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                  i === active ? "bg-white shadow-sm ring-1 ring-ink-900/[0.06]" : "hover:bg-white/70"
                }`}
              >
                <ChannelIcon channel={th.channel} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink-900">{th.guest.split(" · ")[0]}</span>
                  <span className="block truncate text-[11px] text-ink-500">{th.label}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex min-h-[340px] flex-col p-5">
            <div className="flex items-center gap-2.5">
              <ChannelIcon channel={t.channel} size={26} />
              <div>
                <p className="text-sm font-semibold text-ink-900">{t.guest}</p>
                <p className="text-[11px] text-ink-500">via {t.label} inbox</p>
              </div>
            </div>

            {/* Keyed on the thread so header and messages always switch together. */}
            <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-5 flex flex-1 flex-col gap-3"
              >
                <div className="max-w-[85%] self-start rounded-2xl rounded-tl-md bg-ink-100 px-3.5 py-2.5 text-[14px] text-ink-800">
                  {t.q}
                </div>
                {replied ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="max-w-[88%] self-end"
                  >
                    <div className="rounded-2xl rounded-tr-md bg-sunset px-3.5 py-2.5 text-[14px] leading-snug text-white shadow-[0_8px_20px_-10px_rgba(255,61,119,0.6)]">
                      {t.a}
                    </div>
                    <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-400">
                      <BotlifyMark size={12} /> Replied by Botlify AI · 4s
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex w-16 items-center justify-center gap-1 self-end rounded-2xl bg-ink-100 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-ink-400"
                        animate={reduce ? undefined : { y: [0, -3, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.12 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-4 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-[13px] font-medium text-ink-800 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.3)] ring-1 ring-ink-900/[0.06] sm:flex">
        <RefreshCw className="h-4 w-4 text-sunset-flame" /> Room sold on Airbnb · closed on Booking.com &amp; Expedia
      </div>
    </div>
  );
}

function ChannelStrip() {
  const items = [
    { key: "airbnb", name: "Airbnb" },
    { key: "booking", name: "Booking.com" },
    { key: "expedia", name: "Expedia" },
    { key: "whatsapp", name: "WhatsApp" },
  ];
  return (
    <section className="border-y border-ink-900/[0.06] bg-white/70 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-400">
          Answers guests and syncs rooms on
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((it) => (
            <span key={it.key} className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-ink-700">
              <ChannelIcon channel={it.key} size={28} />
              {it.name}
            </span>
          ))}
          <span className="text-sm text-ink-400">Agoda &amp; Traveloka coming soon</span>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared section heading
// ─────────────────────────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, accent, sub, center = true }) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl px-4 text-center sm:px-6" : "max-w-2xl"}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-sunset-flame">{eyebrow}</span>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-ink-950 sm:text-5xl">
        {title} {accent && <span className="font-serif font-normal italic text-sunset">{accent}</span>}
      </h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-ink-600">{sub}</p>}
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: Globe2,
      title: "Connect your booking sites",
      text: "Link Airbnb, Booking.com and Expedia, plus your WhatsApp number. Rooms, rates and availability sync onto one calendar.",
    },
    {
      icon: BedDouble,
      title: "Teach Botlify your hotel",
      text: "Check-in times, breakfast, parking, house rules, the spa menu. Answer once — the AI uses it in every reply.",
    },
    {
      icon: MessageSquareText,
      title: "The AI handles your guests",
      text: "Every message in your OTA inboxes and WhatsApp gets an accurate answer in seconds. Your team steps in only when it matters.",
    },
  ];
  return (
    <section id="how" className="relative scroll-mt-20 py-24 sm:py-32">
      <SectionHead
        eyebrow="How it works"
        title="Live in ten minutes."
        accent="Answering forever."
        sub="No new inbox to watch. Botlify works inside the channels your guests already use."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className="card-hover group h-full p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sunset-soft text-sunset-flame transition-transform duration-300 group-hover:-translate-y-0.5">
                  <s.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <span className="font-display text-5xl font-semibold tracking-tight text-ink-900/[0.07]">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink-950">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-600">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Before / after — the human work it replaces
// ─────────────────────────────────────────────────────────────────────────────
function Replaces() {
  const before = [
    "Staff refreshing three extranets and a phone",
    "Guests waiting hours for “what time is check-in?”",
    "Night messages answered the next morning",
    "Double-bookings when a calendar isn't updated",
  ];
  const after = [
    "One AI answering Airbnb, Booking.com, Expedia & WhatsApp",
    "Accurate replies in seconds, in the guest's language",
    "24/7 — 2am questions answered at 2am",
    "Every sale closes the room on every other channel",
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <SectionHead eyebrow="What it replaces" title="The hours your team spends" accent="typing the same answers." />
      <div className="mx-auto mt-14 grid max-w-5xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl bg-ink-50 p-7 ring-1 ring-ink-900/[0.06]">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-400">Without Botlify</p>
            <ul className="mt-5 space-y-4">
              {before.map((b) => (
                <li key={b} className="flex items-start gap-3 text-ink-600">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink-200 text-ink-500">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative h-full overflow-hidden rounded-2xl bg-white p-7 shadow-[0_20px_50px_-25px_rgba(255,61,119,0.45)] ring-1 ring-sunset-flame/25">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-sunset" />
            <p className="text-sm font-semibold uppercase tracking-wider text-sunset-flame">With Botlify</p>
            <ul className="mt-5 space-y-4">
              {after.map((a) => (
                <li key={a} className="flex items-start gap-3 font-medium text-ink-800">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sunset text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MessageSquareText, title: "AI replies inside OTA inboxes", text: "Answers guests directly in Airbnb, Booking.com and Expedia messaging — where they already are." },
  { icon: Zap, title: "WhatsApp concierge", text: "Takes enquiries, quotes live prices and books the room on WhatsApp, commission-free." },
  { icon: CalendarDays, title: "Channel manager built in", text: "Rooms, rates and availability sync two-way. A room sells anywhere, it closes everywhere." },
  { icon: Languages, title: "Every guest's language", text: "Replies in the language the guest writes in — English, Bahasa, German, Chinese and more." },
  { icon: Hand, title: "Human handoff", text: "Complaints, refunds or anything unusual are flagged to your team, who can take over any chat." },
  { icon: ShieldCheck, title: "Only true answers", text: "The AI reads your live calendar and your own hotel facts. It never invents prices or availability." },
];

function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 bg-white/60 py-24 sm:py-32">
      <SectionHead
        eyebrow="Features"
        title="A channel manager"
        accent="that talks back."
        sub="Everything a hotel needs to stop answering messages by hand."
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.05}>
            <Spotlight className="card group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
                <f.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink-950">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{f.text}</p>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Numbers
// ─────────────────────────────────────────────────────────────────────────────
function Numbers() {
  const stats = [
    { v: 24, suf: "/7", l: "Guests answered, day and night" },
    { v: 10, pre: "<", suf: "s", l: "Typical AI reply time" },
    { v: 0, suf: "%", l: "Commission on OTA bookings" },
    { v: 49, pre: "$", l: "Flat per month — not per room" },
  ];
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink-900/[0.06] sm:p-12 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center lg:text-left">
            <p className="font-display text-4xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-6xl">
              <NumberTicker value={s.v} prefix={s.pre || ""} suffix={s.suf || ""} />
            </p>
            <p className="mt-2 text-sm text-ink-500">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Launch",
    tag: "Free",
    monthly: 0,
    annual: 0,
    desc: "Sync your channels and let the AI start answering.",
    features: [
      "Channel sync — Booking.com, Airbnb, Expedia",
      "0% commission on OTA bookings",
      "AI replies on WhatsApp",
      "One calendar, 1 property, unlimited rooms",
      "Your direct booking page",
      "10% only on bookings the AI closes",
    ],
    cta: "Start free",
  },
  {
    name: "Botlify for Hotels",
    tag: "Most hotels",
    monthly: 49,
    annual: 490,
    desc: "The full AI channel manager — flat, per month.",
    features: [
      "Everything in Launch",
      "AI replies inside Airbnb, Booking.com & Expedia inboxes",
      "Human handoff & team inbox",
      "AI revenue manager & rate approvals",
      "Guest profiles across every channel",
      "Reviews with AI-drafted replies",
      "Airport transfers & upsells",
      "Priority support · 3-day free trial",
    ],
    cta: "Start 3-day trial",
    highlight: true,
  },
];

function Pricing() {
  const [cycle, setCycle] = useState("monthly");
  const yearly = cycle === "annual";
  return (
    <section id="pricing" className="relative scroll-mt-20 py-24 sm:py-32">
      <SectionHead
        eyebrow="Pricing"
        title="One flat price."
        accent="No per-room fees."
        sub="0% on OTA bookings. 10% only on bookings the AI closes for you in chat."
      />
      <div className="mt-8 flex justify-center px-4">
        <SlidingTabs
          value={cycle}
          onChange={setCycle}
          items={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Yearly · 2 months free" },
          ]}
        />
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06}>
            <div
              className={`relative flex h-full flex-col rounded-3xl bg-white p-7 sm:p-9 ${
                p.highlight
                  ? "shadow-[0_30px_70px_-30px_rgba(255,61,119,0.5)] ring-2 ring-sunset-flame/40"
                  : "ring-1 ring-ink-900/[0.08]"
              }`}
            >
              {p.highlight && <div aria-hidden className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-sunset" />}
              <div className="flex items-center justify-between">
                <p className="font-display text-xl font-semibold text-ink-950">{p.name}</p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    p.highlight ? "bg-sunset text-white" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  {p.tag}
                </span>
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-6xl font-semibold tracking-[-0.05em] text-ink-950">
                  ${yearly ? p.annual : p.monthly}
                </span>
                <span className="mb-2 text-sm text-ink-500">{yearly ? "/ year" : "/ month"}</span>
              </div>
              <p className="mt-2 text-sm text-ink-500">{yearly && p.annual ? "Billed yearly — 2 months free" : p.desc}</p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14.5px] text-ink-700">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        p.highlight ? "bg-sunset text-white" : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`mt-9 w-full py-3.5 text-[15px] ${p.highlight ? "btn-primary" : "btn-secondary"}`}>
                {p.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-ink-500">
        <Link to="/pricing" className="font-medium text-ink-700 underline-offset-4 hover:underline">
          Full pricing &amp; plan comparison
        </Link>
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What exactly is Botlify?",
    a: "An AI channel manager for hotels. It syncs your rooms, rates and availability across Airbnb, Booking.com and Expedia on one calendar, and its AI replies to your guests inside those platforms' inboxes and on WhatsApp — so your team no longer answers messages by hand.",
  },
  {
    q: "Does the AI really reply inside Airbnb and Booking.com?",
    a: "Yes — that's the point. Guests keep messaging where they booked; Botlify reads the message through our connectivity partner and replies in the same thread, using your live calendar and the hotel facts you've taught it.",
  },
  {
    q: "What if a guest asks something the AI shouldn't handle?",
    a: "Complaints, refund requests and anything unusual are flagged to your team straight away, and anyone on your team can take over a conversation at any moment. Anything that changes money or availability needs your approval.",
  },
  {
    q: "Which booking sites do you connect?",
    a: "Booking.com, Airbnb and Expedia today, plus WhatsApp. Agoda and Traveloka are next — we'll list them here the day they're live.",
  },
  {
    q: "Do I still need a separate channel manager?",
    a: "No. Botlify is the channel manager: a room sold on any connected site closes on all the others instantly, so you never double-book.",
  },
  {
    q: "What does it cost?",
    a: "$49 a month, flat — not per room and not per channel. 0% commission on OTA bookings, and 10% only on bookings the AI closes for you in chat. Start free; the paid plan has a 3-day trial.",
  },
  {
    q: "How long does setup take?",
    a: "About 10 minutes: connect your sites and WhatsApp, answer a few questions about your hotel, and the AI starts replying.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, in one click from Billing. You keep access until the end of your current period.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative scroll-mt-20 bg-white/60 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead center={false} eyebrow="FAQ" title="Questions," accent="answered." />
          <p className="mt-5 text-ink-600">Still curious? The chat in the corner is Botlify itself — ask it anything.</p>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`rounded-2xl bg-white ring-1 transition-shadow duration-200 ${
                  isOpen ? "shadow-md ring-ink-900/[0.08]" : "ring-ink-900/[0.06] hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-display text-[17px] font-semibold tracking-tight text-ink-950">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-sunset-flame" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 leading-relaxed text-ink-600">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA + footer
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-sunset px-6 py-16 text-center text-white shadow-[0_40px_90px_-40px_rgba(255,61,119,0.7)] sm:px-12 sm:py-20">
          <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div aria-hidden className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg">
              <BotlifyMark size={40} />
            </span>
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
              Let Botlify answer your guests <span className="font-serif font-normal italic">tonight.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
              Ten minutes to set up. Every Airbnb, Booking.com and WhatsApp message answered from then on.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="btn bg-white px-7 py-3.5 text-[15px] text-ink-950 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start free — no card <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/guide" className="btn px-7 py-3.5 text-[15px] text-white ring-1 ring-white/50 hover:bg-white/10">
                Read the guide
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function SiteFooter() {
  const cols = [
    {
      t: "Product",
      l: [
        { label: "How it works", href: "#how" },
        { label: "Features", href: "#features" },
        { label: "Pricing", to: "/pricing" },
        { label: "Guide", to: "/guide" },
      ],
    },
    {
      t: "Company",
      l: [
        { label: "Consultant program", to: "/consultants" },
        { label: "Help", to: "/help" },
        { label: "Contact", to: "/contact" },
      ],
    },
    {
      t: "Legal",
      l: [
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
      ],
    },
  ];
  return (
    <footer className="border-t border-ink-900/[0.06] bg-white px-4 pb-10 pt-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo size="md" />
          <p className="mt-4 max-w-sm text-ink-500">
            The AI channel manager for hotels. Syncs your booking sites and answers every guest — on Airbnb,
            Booking.com, Expedia and WhatsApp.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-500">
            <Clock className="h-4 w-4 text-emerald-500" /> Answering guests 24/7
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.t} className="md:col-span-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-400">{c.t}</p>
            <ul className="mt-4 space-y-2.5">
              {c.l.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-sm text-ink-600 transition-colors hover:text-ink-950">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-sm text-ink-600 transition-colors hover:text-ink-950">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-ink-900/[0.06] pt-6 text-xs text-ink-400 sm:flex-row">
        <span>© {new Date().getFullYear()} Botlify</span>
        <span>The AI channel manager for hotels</span>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    document.title = "Botlify — The AI channel manager for hotels";
  }, []);
  return (
    <div className="min-h-screen bg-[#FBFAF8] text-ink-900">
      <Nav />
      <main>
        <Hero />
        <ChannelStrip />
        <HowItWorks />
        <Replaces />
        <Features />
        <Numbers />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
      <SupportChat />
    </div>
  );
}
