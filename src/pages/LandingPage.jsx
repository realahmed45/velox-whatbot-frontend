/**
 * Botlify — landing page.
 *
 * Pitch (and nothing else): Botlify is the AI channel manager for hotels. It
 * syncs rooms, rates and availability across Airbnb, Booking.com and Expedia
 * on one calendar, and its AI answers every guest message inside those OTA
 * inboxes and on WhatsApp, 24/7 — replacing human guest messaging.
 *
 * Design: calm, light, ink-first. One typeface (Geist), one accent (flame
 * orange) used sparingly, 1px borders, product UI built in JSX. Motion is
 * opacity/transform only, plays once, and respects reduced-motion. No blur,
 * no infinite loops, no scroll-jacking.
 *
 * Honest claims: Booking.com, Airbnb and Expedia are live; Agoda and
 * Traveloka are "coming".
 */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  BedDouble,
  CalendarCheck2,
  Car,
  Check,
  Globe2,
  Hand,
  Languages,
  Link2,
  MessageSquareText,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";
import SupportChat from "@/components/SupportChat";
import BotlifyMark from "@/components/BotlifyMark";
import OtaLogo, { brandColor } from "@/components/OtaLogo";
import { WhatsAppMark } from "@/components/ChannelMarks";

const EASE = [0.16, 1, 0.3, 1];

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────
const BTN_DARK =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-950 px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(2,6,23,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame/60 focus-visible:ring-offset-2";
const BTN_LIGHT =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-[15px] font-medium text-ink-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-ink-200 transition-colors duration-150 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame/60";
const CARD = "rounded-2xl border border-ink-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
const WRAP = "mx-auto max-w-6xl px-4 sm:px-6";

/** Fade-up once when scrolled into view. Transform + opacity only. */
function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduce) return <M className={className}>{children}</M>;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

function SectionHead({ eyebrow, title, sub, center = true, className = "" }) {
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      <p className="text-[13px] font-medium text-sunset-flame">{eyebrow}</p>
      <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-[40px]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">{sub}</p>}
    </Reveal>
  );
}

/** Channel glyph used inside the mockups. */
function ChannelIcon({ channel, size = 20 }) {
  if (channel === "whatsapp") {
    return (
      <span
        className="grid shrink-0 place-items-center bg-[#25D366] text-white"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
      >
        <WhatsAppMark className="h-[62%] w-[62%]" />
      </span>
    );
  }
  return <OtaLogo channelKey={channel} size={size} />;
}

const CHANNEL_NAME = { airbnb: "Airbnb", booking: "Booking.com", expedia: "Expedia", whatsapp: "WhatsApp" };

// ─────────────────────────────────────────────────────────────────────────────
// Hero mockup — the unified guest inbox
// ─────────────────────────────────────────────────────────────────────────────
const THREADS = [
  { name: "Maya Fischer", channel: "airbnb", preview: "Any chance of an early check-in?", time: "2m", status: "ai", active: true },
  { name: "Kenji Watanabe", channel: "booking", preview: "朝食は含まれていますか？", time: "9m", status: "ai" },
  { name: "Lucía Romero", channel: "whatsapp", preview: "A room for 2 this weekend?", time: "14m", status: "offer" },
  { name: "Tom Becker", channel: "expedia", preview: "I'd like a refund for the…", time: "31m", status: "human" },
  { name: "Aisha Rahman", channel: "booking", preview: "Is there parking on site?", time: "1h", status: "ai" },
];

function StatusPill({ status }) {
  const map = {
    ai: { cls: "bg-ink-100 text-ink-600", label: "AI replied" },
    offer: { cls: "bg-emerald-50 text-emerald-700", label: "Booking offered" },
    human: { cls: "bg-amber-50 text-amber-700", label: "Needs you" },
  };
  const s = map[status];
  return <span className={`rounded-full px-1.5 py-px text-[10.5px] font-medium ${s.cls}`}>{s.label}</span>;
}

function InboxMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_40px_80px_-40px_rgba(15,23,42,0.28)] sm:rounded-2xl">
      {/* window bar */}
      <div className="flex h-10 items-center gap-3 border-b border-ink-100 bg-[#FBFBFA] px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
        </div>
        <p className="truncate text-[12px] text-ink-500">Inbox · Casa Lumen</p>
        <span className="ml-auto hidden items-center gap-1.5 text-[11.5px] text-ink-500 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI on · 24/7
        </span>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] lg:grid-cols-[260px_1fr_230px]">
        {/* thread list */}
        <aside className="hidden border-r border-ink-100 md:block">
          <div className="flex items-center gap-1 border-b border-ink-100 px-3 py-2.5 text-[12px]">
            <span className="rounded-md bg-ink-100 px-2 py-1 font-medium text-ink-950">All</span>
            <span className="rounded-md px-2 py-1 text-ink-500">Needs you · 1</span>
          </div>
          <ul>
            {THREADS.map((t) => (
              <li
                key={t.name}
                className={`flex gap-2.5 border-b border-ink-100 px-3 py-3 ${t.active ? "bg-[#F7F7F5]" : ""}`}
              >
                <ChannelIcon channel={t.channel} size={24} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[12.5px] font-medium text-ink-950">{t.name}</p>
                    <span className="shrink-0 text-[11px] text-ink-400">{t.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-ink-500">{t.preview}</p>
                  <div className="mt-1.5">
                    <StatusPill status={t.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* conversation */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
            <ChannelIcon channel="airbnb" size={28} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink-950">Maya Fischer</p>
              <p className="truncate text-[11.5px] text-ink-500">Airbnb inbox · Deluxe Ocean · 14 – 16 Nov</p>
            </div>
            <span className="hidden rounded-md border border-ink-200 px-2 py-1 text-[11.5px] text-ink-600 sm:inline">
              Take over
            </span>
          </div>

          <div className="flex-1 space-y-4 bg-white px-4 py-5 sm:px-5">
            <div className="max-w-[85%]">
              <div className="rounded-2xl rounded-tl-md bg-ink-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-800">
                Hi! We land at 11am on Friday — any chance of an early check-in? 🙏
              </div>
              <p className="mt-1 text-[11px] text-ink-400">Guest · 10:42</p>
            </div>
            <div className="ml-auto max-w-[88%]">
              <div className="rounded-2xl rounded-tr-md bg-ink-950 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
                Hi Maya! Check-in is normally from 2pm, but your room is free that morning — I've noted early
                check-in from 12pm at no charge. Free parking is at the entrance. See you Friday!
              </div>
              <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-ink-400">
                <Sparkles className="h-3 w-3 text-sunset-flame" /> Botlify AI · sent in Airbnb · 10:42
              </p>
            </div>
            <div className="max-w-[85%]">
              <div className="rounded-2xl rounded-tl-md bg-ink-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-800">
                Amazing, thank you!
              </div>
            </div>
          </div>

          <div className="border-t border-ink-100 px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-[#FBFBFA] px-3 py-2 text-[12px] text-ink-500">
              <BotlifyMark size={16} />
              <span className="truncate">AI is handling this conversation</span>
              <span className="ml-auto shrink-0 font-medium text-ink-950">Reply manually</span>
            </div>
          </div>
        </div>

        {/* booking context */}
        <aside className="hidden border-l border-ink-100 bg-[#FBFBFA] p-4 lg:block">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-400">Reservation</p>
          <dl className="mt-3 space-y-2.5 text-[12.5px]">
            {[
              ["Room", "Deluxe Ocean"],
              ["Dates", "Fri 14 – Sun 16 Nov"],
              ["Guests", "2 adults"],
              ["Total", "$240"],
              ["Source", "Airbnb"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-ink-500">{k}</dt>
                <dd className="font-medium text-ink-950">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 border-t border-ink-200/70 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-400">Availability</p>
            <ul className="mt-3 space-y-2">
              {["booking", "airbnb", "expedia"].map((c) => (
                <li key={c} className="flex items-center gap-2 text-[12.5px] text-ink-700">
                  <OtaLogo channelKey={c} size={18} />
                  {CHANNEL_NAME[c]}
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={2.5} /> Synced
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const isAuthed = !!useAuthStore((s) => s.token);
  const reduce = useReducedMotion();
  const fade = (delay) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay } };

  return (
    <section className="relative isolate overflow-hidden">
      {/* static backdrop: faint grid + a single warm wash */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,106,43,0.08),transparent_70%)]"
      />

      <div className={`${WRAP} pb-16 pt-14 sm:pb-24 sm:pt-20`}>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...fade(0)}>
            <a
              href="#channels"
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-[12.5px] text-ink-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-ink-300"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sunset-flame" />
              <span className="truncate">Live on Booking.com, Airbnb &amp; Expedia</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-ink-400" />
            </a>
          </motion.div>

          <motion.h1
            {...fade(0.05)}
            className="mt-6 text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink-950 min-[400px]:text-[44px] sm:text-6xl lg:text-[72px]"
          >
            The channel manager that answers your guests.
          </motion.h1>

          <motion.p
            {...fade(0.1)}
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-500 sm:text-lg"
          >
            Botlify keeps rooms, rates and availability in sync across Airbnb, Booking.com and Expedia on one
            calendar — and its AI replies to every guest inside those inboxes and on WhatsApp, 24/7.
          </motion.p>

          <motion.div {...fade(0.15)} className="mt-9 flex flex-col justify-center gap-3 min-[420px]:flex-row">
            {isAuthed ? (
              <Link to="/dashboard" className={BTN_DARK}>
                Open dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link to="/register" className={BTN_DARK}>
                Start free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
            <a href="#how" className={BTN_LIGHT}>
              See how it works
            </a>
          </motion.div>

          <motion.ul
            {...fade(0.2)}
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-ink-500"
          >
            {["Free Launch plan", "0% commission on OTA bookings", "Set up in about 10 minutes"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-ink-950" strokeWidth={2.5} /> {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
          className="mx-auto mt-14 max-w-5xl sm:mt-16"
        >
          <InboxMockup />
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel strip
// ─────────────────────────────────────────────────────────────────────────────
function ChannelStrip() {
  return (
    <section id="channels" className="scroll-mt-20 border-y border-ink-200/70 bg-[#FAFAF9]">
      <div className={`${WRAP} py-10`}>
        <p className="text-center text-[13px] text-ink-500">
          Connected to the places your guests already book and message
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {["booking", "airbnb", "expedia", "whatsapp"].map((c) => (
            <div key={c} className="inline-flex items-center gap-2.5">
              <ChannelIcon channel={c} size={28} />
              <span className="text-[15px] font-medium tracking-[-0.01em] text-ink-900">{CHANNEL_NAME[c]}</span>
            </div>
          ))}
          <div className="inline-flex items-center gap-2.5 opacity-60 grayscale">
            <OtaLogo channelKey="agoda" size={28} />
            <OtaLogo channelKey="traveloka" size={28} />
            <span className="text-[13px] text-ink-500">Agoda &amp; Traveloka — coming</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works
// ─────────────────────────────────────────────────────────────────────────────
function StepVisualConnect() {
  return (
    <ul className="space-y-2">
      {["booking", "airbnb", "expedia", "whatsapp"].map((c) => (
        <li key={c} className="flex items-center gap-2.5 rounded-lg border border-ink-200/80 bg-white px-3 py-2">
          <ChannelIcon channel={c} size={20} />
          <span className="text-[13px] text-ink-800">{CHANNEL_NAME[c]}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-emerald-700">
            <Check className="h-3 w-3" strokeWidth={2.5} /> Connected
          </span>
        </li>
      ))}
    </ul>
  );
}

function StepVisualTeach() {
  return (
    <ul className="space-y-2 text-[13px]">
      {[
        ["Check-in", "From 2pm · early on request"],
        ["Breakfast", "7 – 10:30am, included"],
        ["Parking", "Free, at the entrance"],
        ["Airport", "Transfer $25, book ahead"],
      ].map(([k, v]) => (
        <li key={k} className="flex items-center justify-between gap-3 rounded-lg border border-ink-200/80 bg-white px-3 py-2">
          <span className="text-ink-500">{k}</span>
          <span className="truncate font-medium text-ink-900">{v}</span>
        </li>
      ))}
    </ul>
  );
}

function StepVisualRun() {
  return (
    <div className="space-y-2.5">
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3 py-2 text-[12.5px] text-ink-700 ring-1 ring-ink-200/80">
        Is breakfast included?
      </div>
      <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-ink-950 px-3 py-2 text-[12.5px] text-white">
        Yes — served 7 to 10:30am by the pool.
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
        <Hand className="h-3.5 w-3.5" /> Refund request — handed to your team
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Connect your channels",
    body: "Link Booking.com, Airbnb, Expedia and WhatsApp. Your rooms, rates and bookings land on one calendar.",
    visual: StepVisualConnect,
  },
  {
    n: "02",
    title: "Teach it your hotel",
    body: "Answer a few questions — check-in, breakfast, parking, policies. The AI combines them with your live calendar.",
    visual: StepVisualTeach,
  },
  {
    n: "03",
    title: "Let it answer",
    body: "Guests get accurate replies in seconds, in their language. Anything sensitive comes straight to your team.",
    visual: StepVisualRun,
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-20 sm:py-28">
      <div className={WRAP}>
        <SectionHead
          eyebrow="How it works"
          title="Live in about ten minutes."
          sub="No migration project, no consultants. Connect, teach, and the AI starts replying."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06} className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="p-6">
                <p className="font-mono text-[12px] text-ink-400">{s.n}</p>
                <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-ink-950">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">{s.body}</p>
              </div>
              <div className="mt-auto border-t border-ink-100 bg-[#FAFAF9] p-5">
                <s.visual />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The problem it replaces
// ─────────────────────────────────────────────────────────────────────────────
const BEFORE = [
  "Logging into every extranet to change a rate or close a date",
  "Double bookings when one site lags behind the others",
  "Typing the same answers about check-in, breakfast and parking",
  "Guests waiting all night for a reply — then booking elsewhere",
  "Paying someone to watch four inboxes around the clock",
];
const AFTER = [
  "One calendar — a room sold anywhere closes everywhere",
  "Rates and availability pushed to every channel at once",
  "AI replies inside Airbnb, Booking.com, Expedia and WhatsApp",
  "Answers in seconds, any hour, in the guest's own language",
  "Your team only handles what genuinely needs a person",
];

function Replaces() {
  return (
    <section className="border-y border-ink-200/70 bg-[#FAFAF9] py-20 sm:py-28">
      <div className={WRAP}>
        <SectionHead
          eyebrow="What it replaces"
          title="Four inboxes, three extranets, and guests who message at 3am."
          sub="Most small hotels juggle this by hand. Botlify takes over both jobs — the calendar and the conversations."
        />
        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-ink-200/80 bg-white/60 p-6 sm:p-8">
            <p className="text-[13px] font-medium text-ink-500">Without Botlify</p>
            <ul className="mt-5 space-y-3.5">
              {BEFORE.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-500">
                  <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink-200/70">
                    <X className="h-2.5 w-2.5 text-ink-500" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06} className={`${CARD} p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-28px_rgba(15,23,42,0.2)] sm:p-8`}>
            <p className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-950">
              <BotlifyMark size={16} /> With Botlify
            </p>
            <ul className="mt-5 space-y-3.5">
              {AFTER.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-800">
                  <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink-950">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROOMS = [
  { name: "Deluxe Ocean 101", bookings: [{ c: "airbnb", from: 0, len: 3, g: "M. Fischer" }, { c: "booking", from: 4, len: 3, g: "K. Watanabe" }] },
  { name: "Deluxe Ocean 102", bookings: [{ c: "expedia", from: 1, len: 2, g: "T. Becker" }, { c: "whatsapp", from: 4, len: 2, g: "L. Romero" }] },
  { name: "Garden Twin 201", bookings: [{ c: "booking", from: 0, len: 2, g: "A. Rahman" }, { c: "airbnb", from: 3, len: 4, g: "J. Okafor" }] },
  { name: "Suite 301", bookings: [{ c: "expedia", from: 2, len: 3, g: "S. Lindqvist" }] },
];
const BAR_COLOR = { airbnb: brandColor("airbnb").bg, booking: brandColor("booking").bg, expedia: "#C79100", whatsapp: "#1DA851" };

function CalendarMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200/80 bg-white">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
        <p className="text-[12.5px] font-medium text-ink-950">10 – 16 November</p>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All channels in sync
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[130px_repeat(7,1fr)] border-b border-ink-100 text-[11px] text-ink-400">
            <span className="px-3 py-2">Room</span>
            {DAYS.map((d) => (
              <span key={d} className="border-l border-ink-100 px-2 py-2 text-center">
                {d}
              </span>
            ))}
          </div>
          {ROOMS.map((r) => (
            <div key={r.name} className="relative grid grid-cols-[130px_repeat(7,1fr)] border-b border-ink-100 last:border-0">
              <span className="truncate px-3 py-3 text-[12px] text-ink-700">{r.name}</span>
              {DAYS.map((d) => (
                <span key={d} className="border-l border-ink-100" />
              ))}
              {/* bars sit over the 7 day columns */}
              <div className="pointer-events-none absolute inset-y-0 left-[130px] right-0 grid grid-cols-7 items-center px-0.5">
                {r.bookings.map((b) => (
                  <div
                    key={b.g}
                    className="mx-0.5 flex h-6 items-center gap-1.5 overflow-hidden rounded-md px-1.5 text-[10.5px] font-medium text-ink-800"
                    style={{
                      gridColumn: `${b.from + 1} / span ${b.len}`,
                      gridRow: 1,
                      background: `${BAR_COLOR[b.c]}14`,
                      boxShadow: `inset 2px 0 0 ${BAR_COLOR[b.c]}`,
                    }}
                  >
                    <ChannelIcon channel={b.c} size={13} />
                    <span className="truncate">{b.g}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Hand, title: "Human handoff", body: "Complaints, refunds and anything unusual go to your team inbox. Take over any thread in one click." },
  { icon: BadgeDollarSign, title: "Rate approvals", body: "The AI revenue manager suggests rate changes. Nothing that changes money goes live without your approval." },
  { icon: UserRound, title: "Guest profiles", body: "One profile per guest across every channel — stays, preferences and every message in one place." },
  { icon: Star, title: "Review replies", body: "AI-drafted replies to guest reviews, in your voice, ready for you to send." },
  { icon: Car, title: "Transfers & upsells", body: "Offer airport pickups, late check-out and extras right inside the conversation." },
  { icon: Link2, title: "Direct booking page", body: "Your own booking link to share with guests — no OTA, no commission." },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className={WRAP}>
        <SectionHead
          eyebrow="Features"
          title="A channel manager and a front desk, in one."
          sub="Everything a small hotel needs to sell rooms on every site and look after every guest — without adding staff."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          <Reveal className={`${CARD} overflow-hidden lg:col-span-3`}>
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 text-[13px] font-medium text-ink-950">
                <CalendarCheck2 className="h-4 w-4 text-sunset-flame" /> Channel manager
              </div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-ink-950">
                One calendar for every channel
              </h3>
              <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-ink-500">
                Rooms, rates and availability sync across Airbnb, Booking.com and Expedia. Sell a room on one site
                and it closes on the others — no double bookings.
              </p>
            </div>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <CalendarMockup />
            </div>
          </Reveal>

          <Reveal delay={0.06} className={`${CARD} flex flex-col overflow-hidden lg:col-span-2`}>
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 text-[13px] font-medium text-ink-950">
                <MessageSquareText className="h-4 w-4 text-sunset-flame" /> AI guest messaging
              </div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-ink-950">
                Answers inside every inbox
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">
                Guests keep messaging where they booked. The AI replies in the same thread, 24/7, using your live
                calendar and hotel facts.
              </p>
            </div>
            <div className="mt-auto space-y-2 px-4 pb-4 sm:px-6 sm:pb-6">
              {[
                ["airbnb", "Early check-in noted for Friday", "8s"],
                ["booking", "朝食は7時から10時半まで…", "6s"],
                ["whatsapp", "Ocean Deluxe is free Fri–Sun at $120", "11s"],
                ["expedia", "Late check-out until 1pm confirmed", "9s"],
              ].map(([c, t, s]) => (
                <div key={c} className="flex items-center gap-3 rounded-lg border border-ink-200/80 bg-[#FAFAF9] px-3 py-2.5">
                  <ChannelIcon channel={c} size={22} />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink-700">{t}</span>
                  <span className="shrink-0 text-[11px] text-ink-400">replied in {s}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-ink-200/80 bg-ink-200/80 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.05} className="bg-white p-6 sm:p-7">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <f.icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.01em] text-ink-950">{f.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-500">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A closer look at the AI inbox
// ─────────────────────────────────────────────────────────────────────────────
const CONVERSATIONS = {
  airbnb: {
    guest: "Maya Fischer",
    meta: "Airbnb · Deluxe Ocean · 14 – 16 Nov",
    msgs: [
      { from: "guest", text: "Hi! What time can we check in? We land at 11am 🙏" },
      { from: "ai", text: "Hi Maya! Check-in is from 2pm, but your room is free that morning — I've noted early check-in from 12pm at no charge. See you Friday!" },
      { from: "guest", text: "Perfect. Can you arrange a pickup from the airport?" },
      { from: "ai", text: "Of course — a private transfer is $25 for two. Shall I book it for 11:15am, Friday?" },
    ],
  },
  booking: {
    guest: "Kenji Watanabe",
    meta: "Booking.com · Garden Twin · 20 – 23 Nov",
    msgs: [
      { from: "guest", text: "朝食は含まれていますか？駐車場はありますか？" },
      { from: "ai", text: "はい、朝食は含まれています（7:00〜10:30、プールサイド）。無料駐車場が入口にございます。予約は不要です。", note: "Replied in Japanese" },
      { from: "guest", text: "ありがとうございます！" },
    ],
  },
  whatsapp: {
    guest: "Lucía Romero",
    meta: "WhatsApp · new enquiry",
    msgs: [
      { from: "guest", text: "Hi, any room for 2 this weekend? How much?" },
      { from: "ai", text: "Yes! The Ocean Deluxe is free Fri–Sun at $120/night with breakfast. Want me to hold it for you?" },
      { from: "guest", text: "Yes please 😊" },
      { from: "ai", text: "Done — here's your secure booking link. It's held for 30 minutes.", chip: "Book Ocean Deluxe · $240" },
    ],
  },
};

const GUARANTEES = [
  { icon: CalendarCheck2, title: "Grounded in your live calendar", body: "Prices and availability come from the same calendar that syncs your channels — never made up." },
  { icon: Languages, title: "Fluent in your guests' languages", body: "Guests write in Japanese, Spanish or German; the AI replies the same way." },
  { icon: ShieldCheck, title: "You stay in control", body: "Anything that changes money or availability needs your approval. Take over any thread at any time." },
  { icon: Globe2, title: "Inside the OTA, not around it", body: "Replies are sent in the Airbnb, Booking.com and Expedia threads guests already use." },
];

function InboxCloseUp() {
  const [tab, setTab] = useState("airbnb");
  const convo = CONVERSATIONS[tab];
  return (
    <section id="inbox" className="scroll-mt-20 border-y border-ink-200/70 bg-[#FAFAF9] py-20 sm:py-28">
      <div className={`${WRAP} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
        <div>
          <SectionHead
            center={false}
            eyebrow="The AI inbox"
            title="Replies that know your hotel — and your calendar."
            sub="Every message from every channel lands in one inbox. The AI answers the routine ones instantly and hands the rest to you."
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {GUARANTEES.map((g, i) => (
              <Reveal as="li" key={g.title} delay={i * 0.05}>
                <g.icon className="h-4.5 w-4.5 text-ink-950" strokeWidth={1.8} />
                <p className="mt-3 text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{g.title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-500">{g.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.08} className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_32px_64px_-36px_rgba(15,23,42,0.28)]">
            <div role="tablist" aria-label="Sample conversations" className="flex gap-1 overflow-x-auto border-b border-ink-100 p-2">
              {Object.keys(CONVERSATIONS).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                    tab === k ? "bg-ink-100 font-medium text-ink-950" : "text-ink-500 hover:text-ink-950"
                  }`}
                >
                  <ChannelIcon channel={k} size={16} /> {CHANNEL_NAME[k]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
              <ChannelIcon channel={tab} size={28} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink-950">{convo.guest}</p>
                <p className="truncate text-[11.5px] text-ink-500">{convo.meta}</p>
              </div>
            </div>
            <div className="relative min-h-[360px] px-4 py-5 sm:px-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-3.5"
                >
                  {convo.msgs.map((m, i) =>
                    m.from === "guest" ? (
                      <div key={i} className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-100 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink-800">
                        {m.text}
                      </div>
                    ) : (
                      <div key={i} className="ml-auto max-w-[88%]">
                        <div className="rounded-2xl rounded-tr-md bg-ink-950 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white">
                          {m.text}
                          {m.chip && (
                            <span className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2 text-[12.5px] font-medium text-white ring-1 ring-white/15">
                              <span className="inline-flex items-center gap-1.5">
                                <BedDouble className="h-3.5 w-3.5" /> {m.chip}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-ink-400">
                          <Sparkles className="h-3 w-3 text-sunset-flame" /> Botlify AI{m.note ? ` · ${m.note}` : ""}
                        </p>
                      </div>
                    ),
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
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
    price: { monthly: "$0", annual: "$0" },
    unit: { monthly: "forever", annual: "forever" },
    desc: "Sync your channels and let the AI start answering on WhatsApp.",
    features: [
      "Channel sync — Booking.com, Airbnb, Expedia",
      "One calendar, 1 property, unlimited rooms",
      "AI replies on WhatsApp",
      "Your direct booking page",
      "0% commission on OTA bookings",
    ],
    cta: "Start free",
  },
  {
    name: "Botlify for Hotels",
    badge: "Most hotels",
    price: { monthly: "$49", annual: "$490" },
    unit: { monthly: "per month", annual: "per year" },
    desc: "The full AI channel manager. Flat — not per room, not per channel.",
    features: [
      "Everything in Launch",
      "AI replies inside Airbnb, Booking.com & Expedia inboxes",
      "Human handoff & team inbox",
      "AI revenue manager with rate approvals",
      "Guest profiles across every channel",
      "Reviews with AI-drafted replies",
      "Airport transfers & upsells",
      "Priority support",
    ],
    cta: "Start 3-day trial",
    highlight: true,
  },
];

function Pricing() {
  const [cycle, setCycle] = useState("monthly");
  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
      <div className={WRAP}>
        <SectionHead
          eyebrow="Pricing"
          title="Simple, flat pricing."
          sub="0% commission on OTA bookings. 10% only on bookings the AI closes for you in chat."
        />

        <div className="mt-10 flex justify-center">
          <div role="radiogroup" aria-label="Billing cycle" className="inline-flex rounded-lg border border-ink-200 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            {[
              ["monthly", "Monthly"],
              ["annual", "Yearly"],
            ].map(([v, l]) => (
              <button
                key={v}
                role="radio"
                aria-checked={cycle === v}
                onClick={() => setCycle(v)}
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3.5 text-[13px] transition-colors ${
                  cycle === v ? "bg-ink-950 font-medium text-white" : "text-ink-600 hover:text-ink-950"
                }`}
              >
                {l}
                {v === "annual" && (
                  <span className={`text-[11px] ${cycle === v ? "text-white/70" : "text-sunset-flame"}`}>2 months free</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {PLANS.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 0.06}
              className={`flex flex-col rounded-2xl p-6 sm:p-8 ${
                p.highlight
                  ? "bg-ink-950 text-white shadow-[0_32px_64px_-32px_rgba(2,6,23,0.5)]"
                  : `${CARD} text-ink-950`
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{p.name}</h3>
                {p.badge && (
                  <span className="rounded-full bg-sunset-flame/15 px-2.5 py-0.5 text-[11.5px] font-medium text-[#FF9A6B]">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-[14px] leading-relaxed ${p.highlight ? "text-white/60" : "text-ink-500"}`}>{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{p.price[cycle]}</span>
                <span className={`text-[14px] ${p.highlight ? "text-white/60" : "text-ink-500"}`}>{p.unit[cycle]}</span>
              </div>
              <Link
                to="/register"
                className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[14.5px] font-medium transition-colors ${
                  p.highlight
                    ? "bg-white text-ink-950 hover:bg-ink-100"
                    : "bg-white text-ink-950 ring-1 ring-ink-200 hover:bg-ink-50"
                }`}
              >
                {p.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <ul className={`mt-7 space-y-3 border-t pt-7 ${p.highlight ? "border-white/10" : "border-ink-100"}`}>
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-[14px] leading-snug ${p.highlight ? "text-white/85" : "text-ink-700"}`}>
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-[#FF9A6B]" : "text-ink-950"}`} strokeWidth={2.25} />
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-[14px] text-ink-500">
          3-day trial on the Hotels plan · cancel anytime ·{" "}
          <Link to="/pricing" className="font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-950">
            Full pricing details
          </Link>
        </p>
      </div>
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
    a: "Yes. Guests keep messaging where they booked; Botlify reads the message through our connectivity partner and replies in the same thread, using your live calendar and the hotel facts you've taught it.",
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
    a: "No. Botlify is the channel manager: a room sold on any connected site closes on all the others, so you don't double-book.",
  },
  {
    q: "What does it cost?",
    a: "The Launch plan is free. Botlify for Hotels is $49 a month or $490 a year — flat, not per room and not per channel — with a 3-day trial. 0% commission on OTA bookings; 10% only on bookings the AI closes for you in chat.",
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
    <section id="faq" className="scroll-mt-20 border-t border-ink-200/70 py-20 sm:py-28">
      <div className={`${WRAP} grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16`}>
        <div>
          <SectionHead center={false} eyebrow="FAQ" title="Questions, answered." />
          <Reveal delay={0.05}>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-500">
              Something else on your mind?{" "}
              <Link to="/contact" className="font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-950">
                Contact us
              </Link>{" "}
              or browse the{" "}
              <Link to="/help" className="font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-950">
                help centre
              </Link>
              .
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <ul className="divide-y divide-ink-200/80 border-y border-ink-200/80">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-[15.5px] font-medium tracking-[-0.01em] text-ink-950">{f.q}</span>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-500">
                      {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="-mt-1 max-w-2xl pb-5 pr-10 text-[15px] leading-relaxed text-ink-500"
                      >
                        {f.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  const isAuthed = !!useAuthStore((s) => s.token);
  return (
    <section className="pb-20 sm:pb-28">
      <div className={WRAP}>
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sunset-flame/70 to-transparent" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,106,43,0.14),transparent_70%)]"
          />
          <div className="relative">
            <BotlifyMark size={40} className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-2xl text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[44px]">
              Every calendar in sync. Every guest answered.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
              Connect your channels in about ten minutes and let the AI take the inbox tonight.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 min-[420px]:flex-row">
              <Link
                to={isAuthed ? "/dashboard" : "/register"}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-[15px] font-medium text-ink-950 transition-colors hover:bg-ink-100"
              >
                {isAuthed ? "Open dashboard" : "Start free"}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center justify-center rounded-lg px-5 text-[15px] font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/5"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    document.title = "Botlify — The AI channel manager for hotels";
  }, []);
  return (
    <div className="min-h-screen overflow-x-clip bg-white font-geist text-ink-950 antialiased">
      <PublicHeader />
      <main>
        <Hero />
        <ChannelStrip />
        <HowItWorks />
        <Replaces />
        <Features />
        <InboxCloseUp />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <SupportChat />
    </div>
  );
}
