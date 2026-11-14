/**
 * Botlify — landing page (2026 "Bali sunset" redesign).
 *
 * Night canvas, drifting sunset aurora, film grain, liquid-glass panels, and a
 * custom cursor. Every block is interactive: the hero phone plays a live
 * WhatsApp booking, the bento cards follow the pointer, the "night shift"
 * section scrolls sideways through a real night at a hotel, and the agent card
 * types its own commands.
 *
 * Honest-claims rule (see data/otaChannels.js): only Booking.com, Airbnb and
 * Expedia are named as live OTA syncs; everything else is "coming".
 */
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Globe,
  Menu,
  MessageCircle,
  Moon,
  Plane,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import BotlifyMark from "@/components/BotlifyMark";
import SupportChat from "@/components/SupportChat";
import OtaLogo from "@/components/OtaLogo";
import { WhatsAppMark, InstagramMark } from "@/components/ChannelMarks";
import { LIVE_OTA_CHANNELS } from "@/data/otaChannels";
import {
  Aurora,
  CursorAura,
  Magnetic,
  Marquee,
  NumberTicker,
  PulseDot,
  Reveal,
  SlidingTabs,
  Spotlight,
  Tilt,
} from "@/components/fx";

const EASE = [0.16, 1, 0.3, 1];

// ─────────────────────────────────────────────────────────────────────────────
// Nav — a floating glass pill that tightens once you scroll
// ─────────────────────────────────────────────────────────────────────────────
const LINKS = [
  { label: "Product", href: "#product" },
  { label: "Night shift", href: "#night" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Guide", to: "/guide" },
];

function Nav() {
  const isAuthed = !!useAuthStore((s) => s.token);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={`mx-auto flex items-center justify-between gap-4 rounded-2xl px-3 py-2 transition-all duration-500 ease-out-expo sm:px-4 ${
          scrolled
            ? "max-w-5xl bg-night-900/70 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-2xl"
            : "max-w-7xl bg-transparent"
        }`}
      >
        <Link to="/" aria-label="Botlify home" className="shrink-0">
          <Logo size="sm" dark />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Item
              key={l.label}
              l={l}
              className="relative rounded-xl px-3.5 py-2 text-[13.5px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            />
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Magnetic>
              <Link to="/dashboard" className="btn-primary px-4 py-2">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-3.5 py-2 text-[13.5px] font-medium text-white/70 transition hover:text-white">
                Sign in
              </Link>
              <Magnetic>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
            </>
          )}
        </div>
        <button
          className="btn-glass-dark p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="card-dark mx-auto mt-2 max-w-7xl p-3 md:hidden"
          >
            {LINKS.map((l) => (
              <Item
                key={l.label}
                l={l}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-[15px] font-medium text-white/80 hover:bg-white/[0.06]"
              />
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {isAuthed ? (
                <Link to="/dashboard" className="btn-primary col-span-2">Open dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-glass-dark">Sign in</Link>
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
const HEADLINE = ["The", "front", "desk"];

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-32 sm:pt-40">
      <Aurora variant="dark" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-dot-grid-dark mask-fade-b opacity-60" />
      {/* the sun on the horizon */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[62%] -z-10 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #FF6A2B 0%, #FF3D77 35%, transparent 70%)" }}
      />

      <motion.div style={{ y, opacity: fade }} className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.a
              href="#night"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] py-1.5 pl-2 pr-4 text-[12.5px] font-medium text-white/75 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.1] hover:text-white"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sunset px-2 py-0.5 text-[11px] font-semibold text-white">
                <Sparkles className="h-3 w-3" /> New
              </span>
              AI concierge for hotels in Bali &amp; beyond
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-spring group-hover:translate-x-1" />
            </motion.a>

            <h1 className="mt-7 font-display text-[2.6rem] font-semibold leading-[0.95] min-[400px]:text-[3.1rem] tracking-[-0.055em] text-white sm:text-7xl lg:text-[6.4rem]">
              {HEADLINE.map((w, i) => (
                <motion.span
                  key={w}
                  className="mr-[0.22em] inline-block"
                  initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.07 }}
                >
                  {w}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="mr-[0.22em] inline-block"
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.38 }}
              >
                that
              </motion.span>
              <motion.span
                className="inline-block pr-2 font-serif font-normal italic tracking-[-0.02em] text-sunset"
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: EASE, delay: 0.5 }}
              >
                never sleeps.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl"
            >
              Botlify answers your guests on WhatsApp and Instagram in seconds, books the room,
              and keeps Booking.com, Airbnb and Expedia on one calendar. You wake up to
              reservations, not a full inbox.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.85 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Magnetic strength={0.25}>
                <Link to="/register" data-cursor="Go" className="btn-primary px-7 py-4 text-[15px]">
                  Start free — no card <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <a href="#product" className="btn-glass-dark px-6 py-4 text-[15px]">
                See how it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/50"
            >
              {["Set up in 10 minutes", "0% commission on OTA bookings", "Cancel anytime"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative lg:col-span-5"
            initial={{ opacity: 0, y: 50, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
          >
            <HeroPhone />
          </motion.div>
        </div>
      </motion.div>

      <ChannelStrip />
    </section>
  );
}

// A WhatsApp booking that plays itself, on a loop.
const SCRIPT = [
  { from: "guest", text: "Hi! Any room for 2 this Fri–Sun? 🌴", at: 600 },
  { from: "bot", text: "Hi Sofia! Yes — the Ocean Deluxe is free Fri 21 → Sun 23. $120/night, breakfast included.", at: 2400 },
  { from: "guest", text: "Perfect. Airport pickup too?", at: 4600 },
  { from: "bot", text: "Done ✈️ Pickup at DPS 3:40pm, $18. Shall I confirm both for $258?", at: 6400 },
  { from: "guest", text: "Yes please!", at: 8400 },
  { from: "card", at: 9600 },
];

function HeroPhone() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let timers = [];
    const run = () => {
      setStep(0);
      SCRIPT.forEach((m, i) => {
        if (m.from === "bot") timers.push(setTimeout(() => setTyping(true), m.at - 1100));
        timers.push(
          setTimeout(() => {
            setTyping(false);
            setStep(i + 1);
          }, m.at),
        );
      });
      timers.push(setTimeout(run, 14500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      {/* orbiting proof chips */}
      <FloatChip className="-left-10 top-16 hidden sm:flex" delay={1.4} icon={CalendarDays} tone="text-sky-300">
        Airbnb synced · just now
      </FloatChip>
      <FloatChip className="-right-8 top-[44%] hidden sm:flex" delay={1.8} icon={TrendingUp} tone="text-emerald-300">
        Rate +12% approved
      </FloatChip>
      <FloatChip className="-left-6 bottom-20 hidden sm:flex" delay={2.2} icon={Moon} tone="text-sunset-gold">
        Booked at 2:14 am
      </FloatChip>

      <Tilt max={7} className="rounded-[2.6rem]">
        <div className="relative rounded-[2.6rem] bg-gradient-to-b from-white/20 to-white/5 p-[1.5px] shadow-[0_50px_120px_-30px_rgba(255,61,119,0.55)]">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-night-900">
            {/* status + chat header */}
            <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.03] px-5 pb-3 pt-5">
              <div className="relative">
                <BotlifyMark size={36} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-night-900" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">Villa Senja · Uluwatu</p>
                <p className="text-[11px] text-emerald-300/90">{typing ? "typing…" : "online · replies instantly"}</p>
              </div>
              <WhatsAppMark className="h-5 w-5 opacity-90" />
            </div>

            <div className="flex h-[440px] flex-col justify-end gap-2.5 bg-[radial-gradient(circle_at_30%_0%,rgba(255,106,43,0.10),transparent_60%)] px-4 py-5">
              <AnimatePresence initial={false}>
                {SCRIPT.slice(0, step).map((m, i) =>
                  m.from === "card" ? (
                    <motion.div
                      key={`card-${i}`}
                      layout
                      initial={{ opacity: 0, scale: 0.85, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="mx-auto mt-1 w-[88%] overflow-hidden rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-emerald-400/30"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Booking confirmed
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-white">Ocean Deluxe · 2 nights + pickup</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/55">
                        <span>BK-7Q2F · Fri 21 → Sun 23</span>
                        <span className="font-semibold text-white">$258</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, y: 14, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 26 }}
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${
                        m.from === "guest"
                          ? "self-end rounded-br-md bg-white/[0.09] text-white ring-1 ring-white/10"
                          : "self-start rounded-bl-md bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(255,61,119,0.6)]"
                      }`}
                    >
                      {m.text}
                    </motion.div>
                  ),
                )}
                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex w-14 items-center justify-center gap-1 self-start rounded-2xl rounded-bl-md bg-white/[0.08] py-3"
                  >
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-white/70"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.07] px-4 py-3">
              <div className="flex-1 rounded-full bg-white/[0.06] px-4 py-2 text-xs text-white/35">Message</div>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-sunset">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Tilt>
    </div>
  );
}

function FloatChip({ children, className = "", delay = 0, icon: Icon, tone = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay, duration: 0.6 },
        scale: { delay, type: "spring", stiffness: 260, damping: 18 },
        y: { delay: delay + 0.6, duration: 5, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute z-10 items-center gap-2 rounded-2xl bg-night-800/70 px-3 py-2 text-[12px] font-medium text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${tone}`} />
      {children}
    </motion.div>
  );
}

function ChannelStrip() {
  const items = [
    ...LIVE_OTA_CHANNELS.map((c) => ({ key: c.key, name: c.name, logo: <OtaLogo channelKey={c.key} name={c.name} size={26} /> })),
    { key: "wa", name: "WhatsApp", logo: <WhatsAppMark className="h-5 w-5 text-[#25D366]" /> },
    { key: "ig", name: "Instagram", logo: <InstagramMark className="h-5 w-5 text-[#E1306C]" /> },
    { key: "web", name: "Your direct booking page", logo: <Globe className="h-6 w-6 text-sunset-gold" /> },
  ];
  return (
    <div className="relative mt-24 border-y border-white/[0.06] bg-white/[0.015] py-6 sm:mt-32">
      <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/35">
        One calendar · every channel your guests use
      </p>
      <Marquee speed={36}>
        {[...items, ...items].map((it, i) => (
          <span
            key={`${it.key}-${i}`}
            className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-white/[0.04] py-2 pl-2 pr-5 text-sm font-medium text-white/70 ring-1 ring-white/[0.07]"
          >
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white">{it.logo}</span>
            {it.name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product — bento of interactive glass cards
// ─────────────────────────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, accent, sub, center = true }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <Reveal>
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/45">
          <span className="h-px w-6 bg-sunset" /> {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-4xl font-semibold leading-[1] tracking-[-0.045em] text-white sm:text-6xl">
          {title} <span className="font-serif font-normal italic text-sunset">{accent}</span>
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-white/55">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

function Bento({ className = "", children, delay = 0 }) {
  return (
    <Reveal delay={delay} className={className}>
      <Spotlight className="card-dark group h-full overflow-hidden p-6 transition-transform duration-500 ease-spring hover:-translate-y-1 sm:p-7">
        {children}
      </Spotlight>
    </Reveal>
  );
}

function IconTile({ icon: Icon }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-8deg]">
      <Icon className="h-5 w-5 text-sunset-gold" strokeWidth={1.8} />
    </span>
  );
}

function Product() {
  return (
    <section id="product" className="relative py-28 sm:py-40">
      <SectionHead
        eyebrow="The platform"
        title="Everything a hotel runs on,"
        accent="in one place."
        sub="A concierge that sells, a calendar that never double-books, and an agent you simply tell what to do."
      />

      <div className="mx-auto mt-16 grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-6">
        <Bento className="md:col-span-4" delay={0}>
          <div className="flex h-full flex-col gap-8 lg:flex-row">
            <div className="lg:w-1/2">
              <IconTile icon={MessageCircle} />
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">An AI concierge on WhatsApp &amp; Instagram</h3>
              <p className="mt-3 text-white/55">
                It reads your live calendar, quotes real prices, books the room, arranges the airport
                pickup and sells breakfast. Your team can take over any chat mid-way.
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2.5">
              {[
                ["Guest", "Is the pool open at night?", false],
                ["Botlify", "Until 10pm, with towels at the bar 🌙", true],
                ["Guest", "And late checkout Sunday?", false],
                ["Botlify", "Yes — until 2pm for $25. Add it?", true],
              ].map(([who, t, bot], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: bot ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.25, type: "spring", stiffness: 260, damping: 22 }}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] ${
                    bot ? "self-start bg-sunset text-white" : "self-end bg-white/[0.08] text-white/85 ring-1 ring-white/10"
                  }`}
                >
                  {t}
                </motion.div>
              ))}
            </div>
          </div>
        </Bento>

        <Bento className="md:col-span-2" delay={0.08}>
          <IconTile icon={Zap} />
          <p className="mt-6 font-display text-6xl font-semibold tracking-[-0.05em] text-white">
            <NumberTicker value={4} suffix="s" />
          </p>
          <p className="mt-2 text-white/55">Average reply time, 24 hours a day. Guests book before they check another hotel.</p>
        </Bento>

        <Bento className="md:col-span-2" delay={0.12}>
          <IconTile icon={CalendarDays} />
          <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-white">One calendar. Zero double-bookings.</h3>
          <p className="mt-2 text-sm text-white/55">A room sells anywhere, availability drops everywhere — instantly.</p>
          <div className="mt-5 grid grid-cols-7 gap-1">
            {Array.from({ length: 21 }).map((_, i) => {
              const tone = [2, 3, 4, 9, 10, 15, 16, 17].includes(i)
                ? "bg-sunset"
                : [6, 12, 13].includes(i)
                  ? "bg-sky-400/60"
                  : "bg-white/[0.06]";
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.025, type: "spring", stiffness: 400, damping: 20 }}
                  className={`aspect-square rounded-md ${tone}`}
                />
              );
            })}
          </div>
        </Bento>

        <Bento className="md:col-span-2" delay={0.16}>
          <IconTile icon={TrendingUp} />
          <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-white">An AI revenue manager</h3>
          <p className="mt-2 text-sm text-white/55">
            “Sep 3–5 is 30% booked, usually 70% by now — drop to $85?” Nothing changes until you tap approve.
          </p>
          <div className="mt-5 flex h-20 items-end gap-1.5">
            {[38, 52, 44, 66, 58, 80, 72, 94].map((h, i) => (
              <motion.span
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-sunset-magenta/40 to-sunset-gold"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.9, ease: EASE }}
              />
            ))}
          </div>
        </Bento>

        <Bento className="md:col-span-2" delay={0.2}>
          <IconTile icon={Globe} />
          <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-white">Your own booking page</h3>
          <p className="mt-2 text-sm text-white/55">
            /book/your-hotel with your photos and live availability. Link it from Instagram — those bookings are commission-free.
          </p>
          <div className="mt-5 rounded-xl bg-white/[0.04] px-3 py-2.5 font-mono text-[12px] text-white/60 ring-1 ring-white/[0.07]">
            botlify.app/book/<span className="text-sunset-gold">villa-senja</span>
          </div>
        </Bento>

        <Bento className="md:col-span-3" delay={0.08}>
          <AgentTyper />
        </Bento>

        <Bento className="md:col-span-3" delay={0.12}>
          <IconTile icon={BedDouble} />
          <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">A front desk in your pocket</h3>
          <p className="mt-3 text-white/55">
            Check-in and check-out, room assignment, a housekeeping board and a folio for breakfast, minibar and late check-out.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["Clean", "bg-emerald-400/15 text-emerald-300"],
              ["Dirty", "bg-rose-400/15 text-rose-300"],
              ["Inspected", "bg-sky-400/15 text-sky-300"],
              ["Arriving 2pm", "bg-amber-400/15 text-amber-300"],
            ].map(([t, c]) => (
              <span key={t} className={`rounded-full px-3 py-1 text-xs font-medium ${c} transition-transform duration-300 ease-spring hover:-translate-y-0.5`}>
                {t}
              </span>
            ))}
          </div>
        </Bento>
      </div>
    </section>
  );
}

const COMMANDS = [
  "Change Deluxe to $95 next weekend",
  "Who checks in today?",
  "Block room 3 tomorrow",
  "How did we do last month?",
];

function AgentTyper() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(reduce ? COMMANDS[0] : "");
  useEffect(() => {
    if (reduce) return;
    const full = COMMANDS[idx];
    let i = 0;
    let erase;
    const type = setInterval(() => {
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(type);
        erase = setTimeout(() => setIdx((v) => (v + 1) % COMMANDS.length), 1800);
      }
    }, 45);
    return () => {
      clearInterval(type);
      clearTimeout(erase);
    };
  }, [idx, reduce]);

  return (
    <div className="flex h-full flex-col">
      <IconTile icon={Wand2} />
      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">The Botlify Agent — run your hotel by typing</h3>
      <p className="mt-3 text-white/55">Plain language in, done out. Anything that touches money or availability asks you first.</p>
      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-night-950/60 p-3 ring-1 ring-white/10">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sunset">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <span className="min-h-[1.25rem] flex-1 truncate font-mono text-[13px] text-white/85">
          {text}
          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-sunset-gold" />
        </span>
        <span className="hidden rounded-lg bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/40 sm:inline">↵</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Night shift — a horizontal, scroll-driven night at a hotel
// ─────────────────────────────────────────────────────────────────────────────
const NIGHT = [
  { time: "18:40", icon: Sun, title: "Sunset rush", text: "Four guests ask about tonight on Instagram. Each gets an answer — and two book dinner." },
  { time: "21:15", icon: CalendarDays, title: "Airbnb booking lands", text: "The room drops off Booking.com and Expedia the same second. No double-booking, no phone call." },
  { time: "23:50", icon: Plane, title: "Flight delayed", text: "A guest messages from Doha. The pickup moves to 4:10am and the driver is told." },
  { time: "02:14", icon: Moon, title: "A booking while you sleep", text: "A couple in Sydney books 5 nights over WhatsApp. $640, confirmed in under two minutes." },
  { time: "07:00", icon: TrendingUp, title: "Your morning brief", text: "Two arrivals, one departure, and a rate suggestion for next weekend waiting for one tap." },
];

function NightShift() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);
  const sun = useTransform(scrollYProgress, [0, 0.5, 1], ["10%", "85%", "10%"]);
  const sky = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(255,106,43,0.25)", "rgba(75,59,255,0.18)", "rgba(255,181,71,0.28)"],
  );

  return (
    <section id="night" ref={ref} className={`relative ${reduce ? "" : "h-[320vh]"}`}>
      <div className={`${reduce ? "" : "sticky top-0 h-screen"} flex flex-col justify-center overflow-hidden py-20`}>
        <motion.div aria-hidden className="absolute inset-0 -z-10" style={{ background: useTransform(sky, (c) => `radial-gradient(ellipse at 50% 120%, ${c}, transparent 65%)`) }} />
        <motion.div
          aria-hidden
          className="absolute left-1/2 -z-10 h-40 w-40 -translate-x-1/2 rounded-full bg-sunset opacity-60 blur-2xl"
          style={{ top: sun }}
        />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHead
            center={false}
            eyebrow="The night shift"
            title="While you sleep,"
            accent="Botlify works."
            sub="Scroll through one ordinary night at a 12-room villa in Uluwatu."
          />
        </div>
        <motion.div style={reduce ? undefined : { x }} className={`mt-14 flex gap-5 pl-4 sm:pl-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] ${reduce ? "flex-wrap pr-4" : ""}`}>
          {NIGHT.map((n, i) => (
            <Spotlight
              key={n.time}
              className="card-dark group w-[78vw] shrink-0 p-7 transition-transform duration-500 ease-spring hover:-translate-y-1.5 sm:w-[420px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">{n.time}</span>
              </div>
              <div className="mt-10 flex items-center gap-3">
                <IconTile icon={n.icon} />
                <h3 className="font-display text-2xl font-semibold tracking-tight text-white">{n.title}</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-white/55">{n.text}</p>
            </Spotlight>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Numbers
// ─────────────────────────────────────────────────────────────────────────────
function Numbers() {
  const stats = [
    { v: 0, suf: "%", l: "Commission on OTA bookings" },
    { v: 24, suf: "/7", l: "Answering, in every language" },
    { v: 10, suf: " min", l: "From sign-up to live" },
    { v: 49, pre: "$", l: "Flat per month — not per room" },
  ];
  return (
    <section className="relative border-y border-white/[0.06] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.06} className="text-center lg:text-left">
            <p className="font-display text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl">
              <NumberTicker value={s.v} prefix={s.pre || ""} suffix={s.suf || ""} />
            </p>
            <p className="mt-2 text-sm text-white/50">{s.l}</p>
          </Reveal>
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
    desc: "Get your channels synced and start taking bookings.",
    features: [
      "Channel sync — Booking.com, Airbnb, Expedia",
      "0% commission on OTA bookings",
      "Your direct booking page",
      "One calendar, 1 property, unlimited rooms",
      "Front desk: check-in, check-out, folio",
      "AI concierge on WhatsApp",
      "10% only on bookings the AI closes",
    ],
    cta: "Start free",
  },
  {
    name: "Botlify for Hotels",
    tag: "Most hotels",
    monthly: 49,
    annual: 490,
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

function Pricing() {
  const [cycle, setCycle] = useState("monthly");
  const yearly = cycle === "annual";
  return (
    <section id="pricing" className="relative py-28 sm:py-40">
      <SectionHead
        eyebrow="Pricing"
        title="One price for"
        accent="the whole stack."
        sub="Flat monthly — not per room, not per channel. 0% on OTA bookings; 10% only on bookings the AI closes for you."
      />
      <Reveal delay={0.1} className="mt-10 flex justify-center">
        <SlidingTabs
          dark
          value={cycle}
          onChange={setCycle}
          items={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Yearly · 2 months free" },
          ]}
        />
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        {PLANS.map((p, i) => {
          const price = yearly ? p.annual : p.monthly;
          return (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className={`relative h-full rounded-[1.75rem] p-[1.5px] ${p.highlight ? "" : "bg-white/[0.08]"}`}>
                {p.highlight && (
                  <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[1.75rem]">
                    <div className="absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 animate-border-spin bg-sunset-conic" />
                  </div>
                )}
                <Spotlight
                  className={`relative flex h-full flex-col rounded-[1.7rem] p-7 sm:p-9 ${
                    p.highlight ? "bg-night-900" : "bg-night-900/90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-xl font-semibold text-white">{p.name}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        p.highlight ? "bg-sunset text-white" : "bg-white/[0.07] text-white/70"
                      }`}
                    >
                      {p.tag}
                    </span>
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={`${p.name}-${cycle}`}
                        initial={{ y: 20, opacity: 0, filter: "blur(6px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -20, opacity: 0, filter: "blur(6px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        className="font-display text-6xl font-semibold tracking-[-0.05em] text-white"
                      >
                        ${price}
                      </motion.span>
                    </AnimatePresence>
                    <span className="mb-2 text-sm text-white/45">{yearly ? "/ year" : "/ month"}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/55">
                    {yearly && p.annual ? "Billed yearly — 2 months free" : p.desc}
                  </p>
                  <ul className="mt-7 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[14px] text-white/75">
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.highlight ? "bg-sunset" : "bg-white/[0.08]"}`}>
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`mt-9 w-full py-3.5 text-[15px] ${p.highlight ? "btn-primary" : "btn-glass-dark"}`}
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Spotlight>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-8 text-center text-sm text-white/40">
        Need details?{" "}
        <Link to="/pricing" className="text-white/70 underline-offset-4 hover:text-white hover:underline">
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
    a: "An operating platform for a hotel: channel sync on one calendar, your own direct-booking page, an AI revenue manager you approve, a front desk (check-in, check-out, housekeeping, folio), a guest CRM and reviews — plus an AI concierge on WhatsApp and Instagram and an agent you simply give instructions to. One login, one calendar, one bill.",
  },
  {
    q: "Which booking sites do you connect to?",
    a: "Booking.com, Airbnb and Expedia sync two-way today: rooms, rates and availability stay in step on every connected channel, at 0% commission. Agoda, Traveloka and Tiket.com are next on our list — we'll say so here the day they're live.",
  },
  {
    q: "Do I need a separate booking engine for my website?",
    a: "No. Every property gets a public booking page at /book/your-hotel with your real photos, live availability from the same calendar, and instant confirmation. Link it from your website, your Instagram bio or a WhatsApp reply — those bookings are commission-free.",
  },
  {
    q: "What does it cost?",
    a: "$49 a month, flat — not per room and not per channel. 0% commission on OTA bookings, and 10% only on bookings the AI closes for you in chat, well below the 15–18% an OTA takes for the same reservation. Start on the free plan today; the paid plan has a 3-day free trial.",
  },
  {
    q: "Where does the AI concierge work?",
    a: "WhatsApp and Instagram. It reads the same live calendar as the rest of the platform, so it only quotes availability that's true — then books the room, arranges an airport transfer and sells extras. Your front desk can take over any conversation mid-way.",
  },
  {
    q: "What is the Botlify Agent?",
    a: "Your hotel's command line, in plain language. Type “change Deluxe to $95 next weekend”, “who checks in today?” or “block room 3 tomorrow” and it does it. Anything that changes a rate, availability or a booking asks you to confirm first.",
  },
  {
    q: "Will it double-book my rooms?",
    a: "No. Every channel writes to one calendar, availability syncs two-way with your OTAs, and both the booking page and the AI check live availability before confirming anything.",
  },
  {
    q: "How long does setup take?",
    a: "About 10 minutes. Connect your channels, import your rooms and rates (or add them by hand), and your calendar, booking page and front desk are live. No migration project, no setup fee.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, in one click from the Billing page. You keep access until the end of your current period.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead center={false} eyebrow="FAQ" title="Questions," accent="answered." />
          <Reveal delay={0.15}>
            <p className="mt-6 text-white/50">
              Still curious? The chat in the corner is Botlify itself — ask it anything.
            </p>
          </Reveal>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.03}>
                <div
                  className={`rounded-2xl ring-1 transition-colors duration-300 ${
                    isOpen ? "bg-white/[0.06] ring-white/15" : "bg-white/[0.025] ring-white/[0.07] hover:bg-white/[0.04]"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  >
                    <span className="font-display text-[17px] font-medium tracking-tight text-white">{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isOpen ? "bg-sunset" : "bg-white/[0.06]"}`}
                    >
                      <ChevronDown className="h-4 w-4 text-white" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 leading-relaxed text-white/60">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
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
    <section className="relative isolate overflow-hidden px-4 py-32 sm:px-6 sm:py-44">
      <div
        aria-hidden
        className="absolute bottom-[-40%] left-1/2 -z-10 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, #FF6A2B 0%, #FF3D77 30%, #7C5CFF 55%, transparent 72%)" }}
      />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <div className="mx-auto mb-8 w-fit">
            <BotlifyMark size={72} glow />
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-8xl">
            Let the sun set.
            <br />
            <span className="font-serif font-normal italic tracking-[-0.02em] text-sunset">Botlify&apos;s awake.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-xl text-lg text-white/60">
            Ten minutes to set up. Tonight, your guests get answers — and you get bookings.
          </p>
        </Reveal>
        <Reveal delay={0.18} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic strength={0.3}>
            <Link to="/register" data-cursor="Start" className="btn-primary px-8 py-4 text-base">
              Start free — no card <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
          <Link to="/guide" className="btn-glass-dark px-7 py-4 text-base">
            Read the guide
          </Link>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex items-center justify-center gap-1 text-sunset-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-2 text-sm text-white/50">Built with hoteliers in Bali</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SiteFooter() {
  const cols = [
    {
      t: "Product",
      l: [
        { label: "Platform", href: "#product" },
        { label: "Night shift", href: "#night" },
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
    <footer className="relative border-t border-white/[0.06] px-4 pb-10 pt-16 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo size="md" dark />
          <p className="mt-5 max-w-sm text-white/45">
            The AI concierge and booking platform for independent hotels and villas.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 ring-1 ring-white/[0.07]">
            <PulseDot /> All systems answering
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.t} className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">{c.t}</p>
            <ul className="mt-4 space-y-2.5">
              {c.l.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-sm text-white/60 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-16 max-w-7xl overflow-hidden">
        <p
          aria-hidden
          className="select-none text-center font-display text-[22vw] font-bold leading-[0.8] tracking-[-0.07em] text-transparent md:text-[15rem]"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.08)" }}
        >
          botlify
        </p>
      </div>
      <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-white/35 sm:flex-row">
        <span>© {new Date().getFullYear()} Botlify. Made under a Bali sunset.</span>
        <span>Every booking, one place.</span>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    document.title = "Botlify — The front desk that never sleeps";
  }, []);
  return (
    <div className="grain relative min-h-screen overflow-x-clip bg-night-950 text-white selection:bg-sunset-magenta/40">
      <CursorAura />
      <Nav />
      <main>
        <Hero />
        <Product />
        <NightShift />
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
