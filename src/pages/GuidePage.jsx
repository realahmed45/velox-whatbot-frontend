/**
 * /guide — "How Botlify works" for hotels.
 *
 * A written, scannable guide to Botlify — the AI channel manager for hotels:
 * the real 3-step onboarding, connecting Booking.com / Airbnb / Expedia, AI
 * guest messaging in the OTA inboxes and on WhatsApp, rooms & rates, the
 * Botlify Agent, the revenue manager, the front desk, guests, pricing &
 * commission, and a troubleshooting FAQ.
 *
 * Rendered both publicly (inside MarketingLayout) and in the dashboard, so it
 * keeps its own max-width and never assumes a surrounding shell. Both use the
 * light glass palette (THEME); publicly it paints its own warm canvas.
 */
import { createContext, useContext, useState, useEffect } from "react";
import OtaLogo from "@/components/OtaLogo";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Aurora, Magnetic, NumberTicker, Reveal, Spotlight, PulseDot } from "@/components/fx";
import {
  ArrowRight,
  BadgePercent,
  BedDouble,
  Bot,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ConciergeBell,
  DoorOpen,
  Globe,
  Info,
  KeyRound,
  Layers,
  LineChart,
  Link2,
  Mail,
  MessageCircle,
  Plane,
  PlugZap,
  Receipt,
  RefreshCw,
  Shield,
  SprayCan,
  Terminal,
  TriangleAlert,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
 * Theme — one set of class tokens per canvas
 * ──────────────────────────────────────────────────────────── */
const THEME = {
  dark: false,
  h: "text-ink-950",
  body: "text-ink-600",
  strong: "text-ink-900",
  sub: "text-ink-500",
  lead: "text-ink-800",
  card: "card",
  tile: "bg-sunset-soft text-sunset-flame",
  chip: "bg-ink-900/[0.05] text-ink-500 ring-1 ring-ink-900/[0.06]",
  inset: "bg-ink-900/[0.03] ring-1 ring-ink-900/[0.06]",
  divide: "divide-ink-900/[0.06]",
  thead: "bg-white/70 text-ink-700",
  eyebrow: "text-sunset-flame",
  code: "text-ink-800 bg-ink-900/[0.06]",
  link: "text-sunset-flame hover:text-sunset-magenta decoration-sunset-flame/30",
  secondaryBtn: "btn-secondary",
};
const ThemeCtx = createContext(THEME);
const useT = () => useContext(ThemeCtx);

const hop =
  "transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]";

/* ────────────────────────────────────────────────────────────
 * Section registry — drives both the sidebar nav and the anchors
 * ──────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "what-it-is", label: "What Botlify is", icon: Building2 },
  { id: "getting-started", label: "Getting started", icon: UserPlus },
  { id: "channels", label: "Booking channels", icon: RefreshCw },
  { id: "messaging", label: "AI guest messaging", icon: MessageCircle },
  { id: "rooms-rates", label: "Rooms & rates", icon: BedDouble },
  { id: "concierge", label: "How the AI answers", icon: ConciergeBell },
  { id: "agent", label: "The Botlify Agent", icon: Terminal },
  { id: "revenue", label: "AI revenue manager", icon: LineChart },
  { id: "front-desk", label: "Front desk", icon: KeyRound },
  { id: "guests", label: "Guests", icon: Users },
  { id: "pricing", label: "Pricing & commission", icon: BadgePercent },
  { id: "faq", label: "FAQ & troubleshooting", icon: Info },
];

/* ────────────────────────────────────────────────────────────
 * Small shared pieces
 * ──────────────────────────────────────────────────────────── */
function Section({ id, icon: Icon, eyebrow, title, children }) {
  const t = useT();
  return (
    <section id={id} className="scroll-mt-28">
      <Reveal y={18}>
        <div className="group flex items-center gap-2.5">
          <span
            className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${t.tile} ${hop}`}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${t.eyebrow}`}
          >
            {eyebrow}
          </span>
        </div>
        <h2
          className={`mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] ${t.h}`}
        >
          {title}
        </h2>
      </Reveal>
      <Reveal y={18} delay={0.06}>
        <div className={`mt-4 space-y-4 text-[15px] leading-relaxed ${t.body}`}>
          {children}
        </div>
      </Reveal>
    </section>
  );
}

function Bullets({ items }) {
  const t = useT();
  return (
    <ul className="space-y-2">
      {items.map((x, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          </span>
          <span className="text-ink-700">{x}</span>
        </li>
      ))}
    </ul>
  );
}

function Note({ icon: Icon = Info, tone = "brand", title, children }) {
  const t = useT();
  const tones = {
    brand: "border-sunset-flame/20 bg-sunset-soft text-sunset-flame",
    amber: "border-amber-200 bg-amber-50/70 text-amber-600",
    ink: "border-ink-900/[0.08] bg-white/60 text-ink-500",
  };
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${tones[tone]}`}>
      <p className={`flex items-center gap-2 text-sm font-semibold ${t.strong}`}>
        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} /> {title}
      </p>
      <div className={`mt-1.5 text-sm leading-relaxed ${t.body}`}>{children}</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  const t = useT();
  return (
    <Spotlight className={`${t.card} group p-5 ${className}`}>{children}</Spotlight>
  );
}

/** Small icon + title + description tile used by several feature grids. */
function FeatureTile({ icon: Icon, title, desc, stacked = false }) {
  const t = useT();
  return (
    <Spotlight
      className={`${t.card} group h-full p-4 transition-transform duration-500 ease-spring hover:-translate-y-0.5 ${
        stacked ? "" : "flex gap-3"
      }`}
    >
      <span
        className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${t.tile} ${hop}`}
      >
        <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
      </span>
      <div className={`min-w-0 ${stacked ? "mt-3" : ""}`}>
        <p className={`text-sm font-semibold ${t.strong}`}>{title}</p>
        <p className={`text-[13px] leading-snug mt-0.5 ${t.sub}`}>{desc}</p>
      </div>
    </Spotlight>
  );
}

/* ────────────────────────────────────────────────────────────
 * Sticky anchor navigation (sidebar on desktop, select on mobile)
 * ──────────────────────────────────────────────────────────── */
function GuideNav() {
  const t = useT();
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    );
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Mobile — a jump menu that stays out of the way */}
      <div
        className={`lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 backdrop-blur-xl border-b bg-white/70 border-ink-900/[0.06]`}
      >
        <label htmlFor="guide-jump" className="sr-only">
          Jump to a section
        </label>
        <select
          id="guide-jump"
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            document
              .getElementById(e.target.value)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="input font-semibold"
        >
          {SECTIONS.map((s, i) => (
            <option key={s.id} value={s.id}>
              {i + 1}. {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop — sticky sidebar */}
      <nav
        aria-label="Guide sections"
        className="hidden lg:block sticky top-24 self-start"
      >
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.18em] px-3 mb-2 text-ink-400`}
        >
          On this page
        </p>
        <ul className="space-y-0.5">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  aria-current={on ? "true" : undefined}
                  className={`group relative isolate flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-300 ease-spring ${
                    on
                      ? "text-ink-900"
                      : "text-ink-500 hover:text-ink-900 hover:translate-x-0.5"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="guide-nav-l"
                      className={`absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_#fff]`}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    >
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sunset" />
                    </motion.span>
                  )}
                  <Icon
                    strokeWidth={1.8}
                    className={`w-4 h-4 shrink-0 transition-transform duration-500 ease-spring group-hover:rotate-[-10deg] group-hover:scale-110 ${
                      on
                        ? "text-sunset-flame"
                        : "text-ink-300 group-hover:text-ink-500"
                    }`}
                  />
                  <span className="truncate">
                    <span
                      className={`tabular-nums mr-1.5 text-ink-300`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}


/* ────────────────────────────────────────────────────────────
 * Data
 * ──────────────────────────────────────────────────────────── */
const ONBOARD_STEPS = [
  {
    icon: UserPlus,
    eyebrow: "≈ 1 minute",
    title: "Create your account",
    body: "Email and password, or sign in with Google. No card is needed to start on the free Launch plan.",
    bullets: [
      "You land in onboarding straight after signing up.",
      "If a consultant referred you, enter their code here — it's the only place it can be applied.",
    ],
  },
  {
    icon: Building2,
    eyebrow: "≈ 2 minutes",
    title: "Name your hotel",
    body: "Property name, city, timezone and currency. The timezone matters more than it looks — it decides when a night rolls over, when check-in reminders fire, and which day an arrival belongs to.",
    bullets: [
      "Currency is what the AI quotes and your booking page displays.",
      "Running more than one property? Add the first now; the rest from Settings later.",
    ],
  },
  {
    icon: BedDouble,
    eyebrow: "≈ 5 minutes",
    title: "Add your rooms",
    body: "Type your room types in by hand, or import them from an existing OTA listing — types, rates and photos come across together.",
    bullets: [
      "Importing is faster and gets your photos in without re-uploading anything.",
      "The moment rooms exist, your calendar and your direct booking page are live.",
    ],
  },
];

const MESSAGING = [
  {
    logo: "booking",
    name: "Booking.com inbox",
    how: "Comes with the channel connection. Once Booking.com is connected, the AI answers guest messages right inside the Booking.com inbox — pre-arrival questions, directions, check-in times.",
  },
  {
    logo: "airbnb",
    name: "Airbnb inbox",
    how: "Same as Booking.com: connect Airbnb and the AI replies to guests in Airbnb's own messaging thread, so your response time stays fast around the clock.",
  },
  {
    logo: "expedia",
    name: "Expedia inbox",
    how: "Connect Expedia and its guest messages are answered by the AI too — one set of hotel knowledge, every OTA inbox.",
  },
  {
    icon: MessageCircle,
    name: "WhatsApp",
    color: "text-emerald-500",
    how: "Connect from Channels, authorise the number, and the AI starts answering. This is where direct guests ask, negotiate and book — and where the AI closes bookings for you.",
    special: true,
  },
];

/** Live OTAs today — the rest are on the way. */
const LIVE_OTAS = [
  { key: "booking", name: "Booking.com" },
  { key: "airbnb", name: "Airbnb" },
  { key: "expedia", name: "Expedia" },
];

function LiveOtas() {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-ink-900">The channels you can connect</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LIVE_OTAS.map((o) => (
          <span
            key={o.key}
            className="inline-flex items-center gap-2 rounded-full bg-white pl-1.5 pr-3 py-1.5 text-xs font-semibold text-ink-800 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff]"
          >
            <OtaLogo channelKey={o.key} name={o.name} size={22} />
            {o.name}
            <span className="ml-0.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
            </span>
          </span>
        ))}
        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-ink-500 ring-1 ring-dashed ring-ink-900/[0.12] border border-dashed border-ink-900/[0.12]">
          More OTAs coming
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-ink-500">
        Booking.com, Airbnb and Expedia are live today, with more OTAs on the
        way. Every one of them is 0% commission from us — and the AI answers
        guest messages inside each of their inboxes.
      </p>
    </div>
  );
}

const AGENT_EXAMPLES = [
  {
    you: "Change Deluxe Double to $95 for next weekend",
    bot: "Deluxe Double, Fri–Sun: $79 → $95. This pushes to Booking.com, Airbnb, Expedia and your direct page. Confirm?",
    kind: "Needs confirmation",
  },
  {
    you: "Who checks in today?",
    bot: "4 arrivals — Ahmed K. (Deluxe 204, 2 nights), the Rossi family (Suite 301), Mia L. (Twin 108), and one Airbnb arrival with no ETA yet.",
    kind: "Read-only",
  },
  {
    you: "Block room 3 tomorrow — the AC is out",
    bot: "Room 3 blocked for tomorrow and pulled from every channel. Confirm?",
    kind: "Needs confirmation",
  },
  {
    you: "How did we do last month?",
    bot: "68% occupancy, ADR $86. Direct bookings were 31% of the total.",
    kind: "Read-only",
  },
];

const FAQS = [
  {
    q: "My Booking.com rooms aren't showing the right availability.",
    a: "Almost always a mapping problem rather than a sync problem. Open Channels → Booking.com and check that every room type on the Botlify side is mapped to the matching room and rate plan on the OTA side. An unmapped type has nothing to push to, so it looks frozen. If mapping is correct, use the manual re-sync on the same screen and give it a few minutes — the channel acknowledges updates on its own schedule.",
  },
  {
    q: "The AI quoted a room I don't have.",
    a: "It can't invent room types — it only ever reads what's in your Rooms list. If a guest was quoted something odd, it's usually a room type that still exists in Botlify but that you no longer sell. Delete or deactivate it in Rooms and the AI stops offering it immediately.",
  },
  {
    q: "A guest messaged and got no reply.",
    a: "Check three things in order: the channel still shows Connected on the Channels page (access can be revoked from the platform's side), the AI is switched on for that channel, and the conversation isn't already in manual handover — once a human replies, the AI steps back so you don't both answer at once. You can hand it back to the AI from the conversation itself.",
  },
  {
    q: "Which messaging channels does the AI answer on?",
    a: "Guest messages inside your Booking.com, Airbnb and Expedia inboxes, WhatsApp, and your direct booking page. Botlify focuses on where hotel guests actually message you — more OTA inboxes arrive as more OTAs go live.",
  },
  {
    q: "Can two guests book the same room at the same moment?",
    a: "The booking page and the AI both re-check live availability in the instant before confirming, not just when the conversation started — so the second one is refused and offered an alternative. Combined with two-way OTA sync, that's what keeps the calendar honest.",
  },
  {
    q: "Do I have to accept every rate suggestion?",
    a: "No. In Suggest mode nothing changes until you approve it, and skipping a suggestion is a normal outcome. Set your min and max rate per room type and the revenue manager will never propose anything outside them.",
  },
  {
    q: "How do I see what commission I owe?",
    a: "The commission ledger in your dashboard lists every AI-closed booking and the commission on it, as it happens. At month end we email you a statement covering the same lines. Nothing is ever deducted automatically — you settle by bank transfer or invoice.",
  },
  {
    q: "Can my front desk staff have their own logins?",
    a: "Yes. Invite them from Team and give each person a role — front desk, manager or owner. Roles control what each person can see and change, so a receptionist can arrive guests without touching rates or billing.",
  },
];

/* ────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────── */
export default function GuidePage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [agentTurn, setAgentTurn] = useState(0);
  const active = AGENT_EXAMPLES[agentTurn];
  const { pathname } = useLocation();
  const inDashboard = pathname.startsWith("/dashboard");
  const t = THEME;

  const hero = (
    <div
      className={`relative ${inDashboard ? "px-5 py-10 sm:px-10 sm:py-14" : "max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24"}`}
    >
      <Reveal>
        <span
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 ring-1 ring-ink-900/[0.06] text-ink-600 shadow-[inset_0_1px_0_#fff]`}
        >
          <Layers className={`w-3.5 h-3.5 ${t.eyebrow}`} strokeWidth={1.8} /> The Botlify guide
        </span>
      </Reveal>
      <Reveal delay={0.06}>
        <h1
          className={`mt-6 font-display font-semibold max-w-3xl ${
            inDashboard
              ? "text-3xl sm:text-5xl tracking-[-0.04em] leading-[1.02] text-ink-950"
              : "text-5xl sm:text-7xl tracking-[-0.05em] leading-[0.95] text-ink-950"
          }`}
        >
          Every guest answered,{" "}
          <span className="font-serif italic font-normal text-sunset pr-1">every channel</span> in sync.
        </h1>
      </Reveal>
      <Reveal delay={0.12}>
        <p
          className={`mt-6 text-base sm:text-lg max-w-2xl leading-relaxed text-ink-600`}
        >
          Botlify is the AI channel manager for hotels. This guide covers how
          to get set up, how Booking.com, Airbnb and Expedia sync on one
          calendar, how the AI answers guests inside those inboxes and on
          WhatsApp, and exactly what it costs. Read it end to end in about ten
          minutes — or jump to the part you need.
        </p>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <Magnetic className="w-full sm:w-auto">
            <Link to="/register" className="btn-primary w-full sm:w-auto px-7 py-3.5 text-[15px]">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>
          <a href="#getting-started" className={`${t.secondaryBtn} px-7 py-3.5 text-[15px]`}>
            Jump to setup
          </a>
        </div>
      </Reveal>
    </div>
  );

  return (
    <ThemeCtx.Provider value={t}>
    <div
      className={
        inDashboard
          ? "text-ink-900"
          : "relative isolate overflow-x-clip bg-[#FBFAF8] text-ink-900"
      }
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      {inDashboard ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          <section className="card relative isolate overflow-hidden rounded-3xl">
            <Aurora variant="light" />
            <div className="absolute inset-0 -z-10 bg-dot-grid mask-fade-b" aria-hidden />
            {hero}
          </section>
        </div>
      ) : (
        <section className="relative isolate overflow-hidden">
          <Aurora />
          <div className="absolute inset-0 -z-10 bg-dot-grid mask-fade-b opacity-60" aria-hidden />
          {hero}
        </section>
      )}

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid lg:grid-cols-[15rem,minmax(0,1fr)] gap-8 lg:gap-14">
          <GuideNav />

          <div className="min-w-0 space-y-16 sm:space-y-24">
            {/* 1 — What Botlify is */}
            <Section
              id="what-it-is"
              icon={Building2}
              eyebrow="01 · The platform"
              title="What Botlify is"
            >
              <p>
                Botlify is the AI channel manager for hotels. It syncs your
                rooms, rates and availability across Airbnb, Booking.com and
                Expedia — and its AI answers every guest message inside those
                OTA inboxes and on WhatsApp, 24/7, replacing the manual work of
                guest messaging. Every part of it reads and writes the same
                calendar, so your availability can only ever be one number.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 not-prose">
                {[
                  {
                    icon: RefreshCw,
                    t: "Channel manager",
                    d: "Booking.com, Airbnb and Expedia on one calendar, synced two ways. More OTAs coming.",
                  },
                  {
                    icon: Globe,
                    t: "Booking engine",
                    d: "Your own direct-booking page with live availability.",
                  },
                  {
                    icon: LineChart,
                    t: "Revenue manager",
                    d: "AI rate suggestions with reasons — you approve them.",
                  },
                  {
                    icon: ConciergeBell,
                    t: "AI guest messaging",
                    d: "Answers every guest inside the Booking.com, Airbnb and Expedia inboxes and on WhatsApp — 24/7.",
                  },
                  {
                    icon: KeyRound,
                    t: "Front desk (PMS-lite)",
                    d: "Check-in, check-out, housekeeping and folio.",
                  },
                  {
                    icon: Users,
                    t: "Guest CRM & reviews",
                    d: "One profile per guest, and reviews with drafted replies.",
                  },
                ].map((x) => {
                  const Icon = x.icon;
                  return <FeatureTile key={x.t} icon={Icon} title={x.t} desc={x.d} />;
                })}
              </div>

              <p className={`font-semibold ${t.lead}`}>What it replaces</p>
              <p>
                For most independent properties, Botlify takes the place of a
                channel-manager subscription, a booking-engine plugin, a pricing
                tool (or the pricing decisions nobody had time to make), a
                front-desk system, a guest spreadsheet — and the hours someone
                spends answering the same guest questions in every OTA inbox and
                on WhatsApp. One login, one calendar, one bill.
              </p>
              <p>
                On top of all of it sits the{" "}
                <b className={t.strong}>Botlify Agent</b>: you type an
                instruction the way you'd say it to a manager, and it carries it
                out across every channel after asking you to confirm.
              </p>
            </Section>

            {/* 2 — Getting started */}
            <Section
              id="getting-started"
              icon={UserPlus}
              eyebrow="02 · Onboarding"
              title="Getting started — three steps"
            >
              <p>
                There's no migration project and no implementation fee. From a
                cold start you can be taking bookings in about ten minutes.
              </p>

              <div className="space-y-3 not-prose">
                {ONBOARD_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.title}>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <span className="w-10 h-10 rounded-xl bg-sunset text-white font-display font-semibold tabular-nums flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.6)] transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:rotate-[-6deg]">
                            {i + 1}
                          </span>
                          <Icon className={`w-4 h-4 text-ink-300`} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`font-display text-base font-semibold tracking-[-0.01em] ${t.h}`}>
                              {s.title}
                            </h3>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${t.chip}`}>
                              {s.eyebrow}
                            </span>
                          </div>
                          <p className={`mt-1.5 text-sm leading-relaxed ${t.body}`}>
                            {s.body}
                          </p>
                          <ul className="mt-3 space-y-1.5">
                            {s.bullets.map((b, k) => (
                              <li
                                key={k}
                                className={`flex items-start gap-2 text-[13px] ${t.sub}`}
                              >
                                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sunset shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Note icon={Check} title="That's the required part">
                Connecting Booking.com, Airbnb, Expedia and WhatsApp comes
                next — but none of it blocks you. With rooms in the system, your
                calendar, your direct booking page and manual bookings already
                work.
              </Note>
            </Section>

            {/* 3 — Booking channels */}
            <Section
              id="channels"
              icon={RefreshCw}
              eyebrow="03 · Channel manager"
              title="Connecting your booking channels"
            >
              <p>
                Botlify connects to <b className={t.strong}>Booking.com, Airbnb
                and Expedia</b> (more OTAs coming) through our connectivity partner — the same kind of
                certified pipe a traditional channel manager uses. You start it
                from{" "}
                <b className={t.strong}>Channels</b> in the dashboard.
              </p>

              <div className="not-prose">
                <LiveOtas />
              </div>

              <p className={`font-semibold ${t.lead}`}>How the connection works</p>
              <Bullets
                items={[
                  "You authorise the channel and we request connectivity for your property.",
                  "You map each Botlify room type to the matching room and rate plan on the OTA side. This is the step worth doing carefully — everything downstream depends on it.",
                  "Rates and availability push out; reservations and guest messages pull in automatically.",
                  "A sale anywhere — OTA, direct page, chat or a manual booking — drops availability everywhere else.",
                ]}
              />

              <Note icon={BadgePercent} title="What “0% commission” means">
                We take <b>nothing</b> from a booking that arrives through
                Booking.com, Airbnb, Expedia or any OTA we add. Not a percentage, not a per-reservation
                fee. Your OTA still charges you their own commission — that's
                between you and them and always has been — but Botlify adds
                nothing on top. OTA sync is included in the flat subscription.
              </Note>

              <Note tone="ink" icon={Link2} title="Your direct page is a channel too">
                Every property gets a public booking page at{" "}
                <code className={`text-[13px] font-semibold font-mono rounded-md px-1.5 py-0.5 ${t.code}`}>
                  /book/your-hotel
                </code>{" "}
                reading the same calendar. Link it from your website, your
                Google profile or a WhatsApp reply — no OTA takes a cut of those.
              </Note>
            </Section>

            {/* 4 — Messaging */}
            <Section
              id="messaging"
              icon={MessageCircle}
              eyebrow="04 · Messaging"
              title="AI guest messaging"
            >
              <p>
                This is the part that replaces the manual work. The AI answers
                guests where they already message you — inside the OTA inboxes
                and on WhatsApp — instantly, accurately and in their language.
                Every conversation, whatever the channel, also lands in the same
                unified inbox for your team.
              </p>

              <div className="space-y-3 not-prose">
                {MESSAGING.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Spotlight
                      key={m.name}
                      className={`${t.card} group p-4 transition-transform duration-500 ease-spring hover:-translate-y-0.5 ${
                        m.special ? "ring-1 ring-sunset-flame/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 bg-white ring-1 ring-ink-900/[0.06] ${hop}`}
                        >
                          {m.logo ? (
                            <OtaLogo channelKey={m.logo} name={m.name} size={22} />
                          ) : (
                            <Icon className={`w-[18px] h-[18px] ${m.color}`} strokeWidth={1.8} />
                          )}
                        </span>
                        <p className={`font-semibold ${t.strong}`}>{m.name}</p>
                        {m.special && (
                          <span className={`ml-auto text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 bg-sunset-soft ring-1 ring-sunset-flame/30 ${t.eyebrow}`}>
                            Closes bookings
                          </span>
                        )}
                      </div>
                      <p className={`mt-2 text-sm leading-relaxed ${t.body}`}>
                        {m.how}
                      </p>
                    </Spotlight>
                  );
                })}
              </div>

              <Note
                tone="amber"
                icon={TriangleAlert}
                title="OTA inboxes follow the channel connection"
              >
                The AI can only answer an OTA's guest messages once that OTA is
                connected and mapped on the Channels page. As more OTAs go live,
                their inboxes are answered the same way — nothing extra to set up.
              </Note>

              <p>
                You can switch the AI off per channel at any time, and any team
                member can take over a live conversation — the AI steps back the
                moment a human replies, so you never both answer at once.
              </p>
            </Section>

            {/* 5 — Rooms & rates */}
            <Section
              id="rooms-rates"
              icon={BedDouble}
              eyebrow="05 · Inventory"
              title="Setting your rooms and rates"
            >
              <p>
                A room type in Botlify is four things: a{" "}
                <b className={t.strong}>name</b>, a number of{" "}
                <b className={t.strong}>units</b>, an{" "}
                <b className={t.strong}>occupancy</b> and a{" "}
                <b className={t.strong}>nightly rate</b>. For example:
                “Deluxe Double, 4 units, sleeps 2, $79.”
              </p>

              <div className="grid sm:grid-cols-3 gap-3 not-prose">
                {[
                  {
                    t: "Room type",
                    d: "What you sell — Deluxe Double, Twin, Family Suite. Guests see this name.",
                  },
                  {
                    t: "Units",
                    d: "How many physical rooms of that type you have. This number is your availability.",
                  },
                  {
                    t: "Nightly rate",
                    d: "Your base price per night. Everything else is derived from it.",
                  },
                ].map((x) => (
                  <div
                    key={x.t}
                    className={`rounded-2xl p-4 transition-transform duration-500 ease-spring hover:-translate-y-0.5 ${t.inset}`}
                  >
                    <p className={`font-display text-sm font-semibold ${t.strong}`}>{x.t}</p>
                    <p className={`mt-1 text-[13px] leading-snug ${t.sub}`}>
                      {x.d}
                    </p>
                  </div>
                ))}
              </div>

              <p className={`font-semibold ${t.lead}`}>Why the rate matters</p>
              <p>
                More than anywhere else in the product, this number does real
                work. It is what the AI quotes to a guest in chat, what your
                direct booking page displays, what gets pushed to Booking.com and
                Airbnb, and the baseline the revenue manager suggests moving up
                or down. A stale rate here is a stale rate everywhere — so it's
                worth five minutes to get right.
              </p>

              <Bullets
                items={[
                  "Add rooms by hand, or import types, rates and photos from an existing OTA listing.",
                  "Override the rate for specific dates when you need to — a weekend, a local event, a slow midweek stretch.",
                  "There is no per-room pricing from us: add as many types and units as you actually have.",
                  "Photos and descriptions carry through to your direct booking page automatically.",
                ]}
              />
            </Section>

            {/* 6 — AI concierge */}
            <Section
              id="concierge"
              icon={ConciergeBell}
              eyebrow="06 · The AI"
              title="How the AI answers your guests"
            >
              <p>
                The AI is not a scripted FAQ bot. It reads the same live
                calendar every other part of the platform uses, which means it
                can only ever offer rooms and nights that genuinely exist and are
                genuinely free.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 not-prose">
                {[
                  {
                    icon: CalendarDays,
                    t: "Reads live availability",
                    d: "Every quote comes from your real calendar and your real rate — never a cached price list.",
                  },
                  {
                    icon: Shield,
                    t: "Never invents a room",
                    d: "It can only offer room types that exist in your Rooms list. No imaginary suites.",
                  },
                  {
                    icon: RefreshCw,
                    t: "Re-checks before confirming",
                    d: "Availability is checked again in the instant before it confirms — so a room sold 30 seconds ago can't be sold twice.",
                  },
                  {
                    icon: Check,
                    t: "Actually books",
                    d: "It completes the reservation and sends a confirmation, rather than handing the guest off to a form.",
                  },
                  {
                    icon: Plane,
                    t: "Arranges transfers",
                    d: "Airport pickups and drop-offs, attached to the booking so your front desk sees the flight and time.",
                  },
                  {
                    icon: Layers,
                    t: "Sells extras",
                    d: "Breakfast, late check-out, a room upgrade — offered at the right moment in the conversation.",
                  },
                ].map((x) => {
                  const Icon = x.icon;
                  return (
                    <FeatureTile key={x.t} icon={Icon} title={x.t} desc={x.d} stacked />
                  );
                })}
              </div>

              <p>
                It answers in your tone, around the clock — in the Booking.com,
                Airbnb and Expedia inboxes and on WhatsApp — and it works from the
                property details, policies and FAQs you set up once. If a
                conversation needs a human, your front desk takes it over from
                the inbox with the full history in view.
              </p>
            </Section>

            {/* 7 — Botlify Agent */}
            <Section
              id="agent"
              icon={Terminal}
              eyebrow="07 · The Botlify Agent"
              title="Running your hotel by typing"
            >
              <p>
                The Agent is the platform's command line, in plain language. No
                menus, no extranets, no hunting for the right screen — type the
                instruction the way you'd say it to a manager.
              </p>

              <div className="not-prose card relative overflow-hidden rounded-3xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-900/[0.06]">
                  <Terminal className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
                  <span className="text-xs font-semibold text-ink-900">
                    Botlify Agent
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <PulseDot color="bg-emerald-500" />
                    Online
                  </span>
                </div>
                <div className="p-4 min-h-[11rem]">
                  <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={agentTurn}
                    className="space-y-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  >
                  <div className="flex justify-end">
                    <span className="max-w-[85%] rounded-2xl rounded-br-md bg-sunset text-white text-sm px-4 py-2.5 leading-snug shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(255,61,119,0.6)]">
                      {active.you}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-7 h-7 rounded-full bg-sunset-soft flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-sunset-flame" strokeWidth={1.8} />
                    </span>
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-ink-900/[0.04] ring-1 ring-ink-900/[0.06] px-4 py-2.5">
                      <p className="text-sm text-ink-800 leading-snug">
                        {active.bot}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-sunset-flame">
                        <Shield className="w-3 h-3" /> {active.kind}
                      </p>
                    </div>
                  </div>
                  </motion.div>
                  </AnimatePresence>
                </div>
                <div className="border-t border-ink-900/[0.06] p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-2 px-1">
                    Try one
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGENT_EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAgentTurn(i)}
                        className={`relative isolate text-left text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition-all duration-300 ease-spring active:scale-95 ${
                          i === agentTurn
                            ? "text-white"
                            : "bg-ink-900/[0.05] text-ink-600 hover:bg-ink-900/[0.08] hover:text-ink-900 hover:-translate-y-0.5"
                        }`}
                      >
                        {i === agentTurn && (
                          <motion.span
                            layoutId="agent-pill-l"
                            className="absolute inset-0 -z-10 rounded-lg bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          />
                        )}
                        {ex.you}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Note icon={Shield} title="It always asks before it acts">
                Read-only questions are answered straight away. Anything that
                changes a rate, availability or a booking shows you exactly what
                will change and waits for your confirmation. One confirmed
                instruction then updates every connected channel and your direct page
                together.
              </Note>
            </Section>

            {/* 8 — Revenue manager */}
            <Section
              id="revenue"
              icon={LineChart}
              eyebrow="08 · Pricing"
              title="The AI revenue manager"
            >
              <p>
                It watches your occupancy, your booking pace and what's happening
                in your local market, then suggests a nightly rate — always with
                the reason attached, in plain language.
              </p>

              <div className={`not-prose rounded-2xl p-5 ${t.inset}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${t.sub}`}>
                  Example suggestion
                </p>
                <p className={`mt-2 text-sm leading-relaxed text-ink-700`}>
                  “Sep 3–5 is 30% booked — usually 70% this close to the date.
                  Drop Deluxe Double from $95 to $85?”
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sunset rounded-lg px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 ${t.chip}`}>
                    Skip
                  </span>
                </div>
              </div>

              <p className={`font-semibold ${t.lead}`}>You stay in control</p>
              <Bullets
                items={[
                  "Every suggestion comes with its reasoning — you can always see why.",
                  "Approve or skip. Skipping is a normal outcome, not a problem.",
                  "Guard rails: set a minimum and maximum rate per room type, and nothing outside that range is ever proposed or applied.",
                  "Suggest mode — nothing changes until you approve it. Auto mode — approved changes apply on their own, still inside your guard rails.",
                ]}
              />
              <p>
                When a rate is approved it's pushed to every connected channel
                and your direct booking page at once, so there's no window where
                one channel is selling at the old price.
              </p>
            </Section>

            {/* 9 — Front desk */}
            <Section
              id="front-desk"
              icon={KeyRound}
              eyebrow="09 · Front desk"
              title="The daily front desk"
            >
              <p>
                The Today screen is what your reception actually works from:
                who's arriving, who's leaving, which rooms are ready.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 not-prose">
                {[
                  {
                    icon: DoorOpen,
                    t: "Check-in & check-out",
                    d: "Arrive and depart guests in a tap. Arrivals with no ETA are flagged so nobody is forgotten.",
                  },
                  {
                    icon: KeyRound,
                    t: "Unit assignment",
                    d: "Assign the specific physical room within a room type — at booking time or on the day.",
                  },
                  {
                    icon: SprayCan,
                    t: "Housekeeping board",
                    d: "Clean, dirty, inspected — the whole floor at a glance, updated as rooms turn over.",
                  },
                  {
                    icon: Receipt,
                    t: "Folio & extras",
                    d: "Charge breakfast, the minibar or a late check-out straight to the room and settle at departure.",
                  },
                ].map((x) => {
                  const Icon = x.icon;
                  return <FeatureTile key={x.t} icon={Icon} title={x.t} desc={x.d} />;
                })}
              </div>

              <Note tone="ink" icon={Info} title="Where the edge is">
                This covers the front-desk basics thoroughly. If you run a large
                property that depends on deep accounting integrations,
                third-party interfaces or a formal night-audit workflow, treat
                Botlify as your day-to-day front desk rather than a full
                enterprise PMS replacement.
              </Note>
            </Section>

            {/* 10 — Guests */}
            <Section
              id="guests"
              icon={Users}
              eyebrow="10 · Guest CRM"
              title="One guest, one profile"
            >
              <p>
                The same person who messaged you on WhatsApp last year, booked
                through Booking.com in March and is emailing you now is a single
                record — not three.
              </p>
              <Bullets
                items={[
                  "Profiles merge across every messaging channel and every OTA automatically.",
                  "Stay history, preferences, notes and lifetime value in one view.",
                  "Your front desk sees it at check-in, so a returning guest gets greeted like one.",
                  "It's also what makes off-season broadcasts to past guests worth sending.",
                ]}
              />
            </Section>

            {/* 11 — Pricing & commission */}
            <Section
              id="pricing"
              icon={BadgePercent}
              eyebrow="11 · Pricing"
              title="Pricing & commission, in full"
            >
              <div className="not-prose grid sm:grid-cols-2 gap-3">
                <div className={`${t.card} p-5`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${t.sub}`}>
                    Subscription
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className={`font-display text-4xl font-semibold tracking-[-0.04em] ${t.h}`}>
                      <NumberTicker value={49} prefix="$" />
                    </span>
                    <span className={`text-sm ${t.sub}`}>/ month, flat</span>
                  </p>
                  <p className={`mt-1.5 text-[13px] leading-snug ${t.sub}`}>
                    Per property — not per room, not per channel. Or $490/year
                    (two months free).
                  </p>
                </div>
                <div className={`gradient-border  p-5`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${t.eyebrow}`}>
                    Right now
                  </p>
                  <p className={`mt-2 font-display text-lg font-semibold leading-tight ${t.h}`}>
                    A free “Launch” plan
                  </p>
                  <p className={`mt-1.5 text-[13px] leading-snug ${t.body}`}>
                    Same features, no card, while we launch. The paid plan has a
                    3-day free trial — a card is required to start it.
                  </p>
                </div>
              </div>

              <p className={`font-semibold ${t.lead}`}>Commission — two numbers</p>
              <div className={`${t.card} not-prose overflow-x-auto`}>
                <table className="w-full text-sm min-w-[34rem]">
                  <thead>
                    <tr className={`${t.thead} text-left`}>
                      <th className="px-4 py-3 font-semibold">
                        Where the booking came from
                      </th>
                      <th className="px-4 py-3 font-semibold w-32">
                        Botlify takes
                      </th>
                      <th className="px-4 py-3 font-semibold">Why</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.divide}`}>
                    <tr>
                      <td className={`px-4 py-3.5 font-semibold align-top ${t.lead}`}>
                        OTA channels
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className={`inline-block rounded-full font-semibold tabular-nums px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`}>
                          0%
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 align-top ${t.body}`}>
                        OTA sync is completely free — even when the AI answered
                        the guest in the OTA inbox. You'd have got that booking
                        anyway — we don't charge for carrying it.
                      </td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3.5 font-semibold align-top ${t.lead}`}>
                        Closed by the AI — WhatsApp or your direct page
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-block rounded-full bg-sunset text-white font-semibold tabular-nums px-2.5 py-1 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                          10%
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 align-top ${t.body}`}>
                        OTAs charge <b className={t.strong}>15–18%</b> for
                        the same reservation. This is cheaper — and it's on
                        revenue you wouldn't otherwise have had.
                      </td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3.5 font-semibold align-top ${t.lead}`}>
                        Airport transfer via our partner network
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className={`inline-block rounded-full font-semibold tabular-nums px-2.5 py-1 text-xs whitespace-nowrap ${t.chip}`}>
                          ~5–10%
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 align-top ${t.body}`}>
                        A small partner margin only when we arrange the ride. Use
                        your own driver and you keep 100%.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Note icon={Wallet} title="Tracked automatically, settled manually">
                This is the part worth reading twice. Every commissionable
                booking is recorded in a{" "}
                <b className={t.strong}>ledger</b> in your dashboard as it
                happens, and at month end we email you a{" "}
                <b className={t.strong}>statement</b> of what's owed. You
                settle it by bank transfer or invoice.
                <br />
                <br />
                <b className={t.strong}>
                  Botlify never takes money out of your account and never sits
                  between your guest and your payments.
                </b>{" "}
                The hotel always collects from the guest directly, exactly the
                way it does today.
              </Note>

              <Note tone="ink" icon={Users} title="Consultants & marketers">
                Refer a hotel and you earn 20% of Botlify's revenue from that
                hotel — subscription and booking commissions — for 12 months from
                the day they sign. Also tracked automatically and paid out
                manually.{" "}
                <Link
                  to="/consultants"
                  className={`font-semibold underline underline-offset-2 transition-colors ${t.link}`}
                >
                  See the consultant program
                </Link>
                .
              </Note>

              <div className="not-prose">
                <Link
                  to="/pricing"
                  className={`group ${t.secondaryBtn}`}
                >
                  See full pricing <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                </Link>
              </div>
            </Section>

            {/* 12 — FAQ */}
            <Section
              id="faq"
              icon={Info}
              eyebrow="12 · Troubleshooting"
              title="FAQ & troubleshooting"
            >
              <p>
                The questions that actually come up once you're running, and what
                to check first.
              </p>
              <div className="not-prose space-y-2.5">
                {FAQS.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    aria-expanded={openFaq === i}
                    className={`${t.card} block w-full text-left px-5 py-4 transition-transform duration-500 ease-spring hover:-translate-y-0.5 active:scale-[0.99] ${
                      openFaq === i ? "ring-1 ring-sunset-flame/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className={`font-semibold text-sm ${t.strong}`}>
                        {f.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 transition-transform duration-500 ease-spring ${
                          openFaq === i
                            ? `rotate-180 ${t.eyebrow}`
                            : "text-ink-400"
                        }`}
                      />
                    </div>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 36 }}
                          className="overflow-hidden"
                        >
                          <p className={`pt-3 text-sm leading-relaxed ${t.body}`}>
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </Section>

            {/* ── Closing CTA ─────────────────────────────── */}
            <Reveal>
              <section className="card relative isolate overflow-hidden rounded-3xl p-8 sm:p-12 text-center">
                <Aurora />
                <div className="relative">
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.04em] leading-[1] text-ink-950">
                    Ready to put it{" "}
                    <span className="font-serif italic font-normal text-sunset pr-1">together</span>?
                  </h2>
                  <p className="mt-4 text-ink-600 text-[15px] max-w-lg mx-auto leading-relaxed">
                    Create your account, name your hotel, add your rooms. Connect
                    Booking.com, Airbnb, Expedia and WhatsApp, and the AI starts
                    answering your guests.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Magnetic>
                      <Link to="/register" className="btn-primary px-7 py-3.5 text-[15px]">
                        Start free <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Magnetic>
                    <a
                      href="mailto:contactus@botlify.site"
                      className="group btn-secondary px-7 py-3.5 text-[15px]"
                    >
                      <Mail className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-10deg]" /> Email us a question
                    </a>
                  </div>
                  <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-sunset-flame" /> Free Launch plan
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-sunset-flame" /> 0% on OTA
                      bookings
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-sunset-flame" /> Cancel anytime
                    </span>
                  </p>
                </div>
              </section>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
    </ThemeCtx.Provider>
  );
}
