/**
 * /guide — "How Botlify works" for hotels.
 *
 * A written, scannable guide to the whole platform: what it is, the real
 * 3-step onboarding, connecting OTAs and messaging, rooms & rates, the AI
 * concierge, the Botlify Agent, the revenue manager, the front desk, guests,
 * pricing & commission, and a troubleshooting FAQ.
 *
 * Rendered both publicly (inside MarketingLayout) and in the dashboard, so it
 * keeps its own max-width and never assumes a surrounding shell.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Home,
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
  Send,
  Shield,
  SprayCan,
  Terminal,
  TriangleAlert,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
 * Section registry — drives both the sidebar nav and the anchors
 * ──────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "what-it-is", label: "What Botlify is", icon: Building2 },
  { id: "getting-started", label: "Getting started", icon: UserPlus },
  { id: "channels", label: "Booking channels", icon: RefreshCw },
  { id: "messaging", label: "Messaging channels", icon: MessageCircle },
  { id: "rooms-rates", label: "Rooms & rates", icon: BedDouble },
  { id: "concierge", label: "The AI concierge", icon: ConciergeBell },
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
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-ink-950">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-600">
        {children}
      </div>
    </section>
  );
}

function Bullets({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <Check className="w-4 h-4 text-brand-500 shrink-0 mt-[3px]" />
          <span className="text-ink-700">{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Note({ icon: Icon = Info, tone = "brand", title, children }) {
  const tones = {
    brand: "border-brand-100 bg-brand-50/60 text-brand-600",
    amber: "border-amber-200 bg-amber-50/70 text-amber-600",
    ink: "border-ink-200 bg-ink-50/70 text-ink-500",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
        <Icon className="w-4 h-4 shrink-0" /> {title}
      </p>
      <div className="mt-1.5 text-sm text-ink-600 leading-relaxed">{children}</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Sticky anchor navigation (sidebar on desktop, select on mobile)
 * ──────────────────────────────────────────────────────────── */
function GuideNav() {
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
      <div className="lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur border-b border-ink-100">
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
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400 px-3 mb-2">
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
                  className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                    on
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      on ? "text-brand-500" : "text-ink-300 group-hover:text-ink-500"
                    }`}
                  />
                  <span className="truncate">
                    <span className="tabular-nums text-ink-300 mr-1.5">
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
    body: "Type your room types in by hand, or import them from an existing Booking.com or Airbnb listing — types, rates and photos come across together.",
    bullets: [
      "Importing is faster and gets your photos in without re-uploading anything.",
      "The moment rooms exist, your calendar and your direct booking page are live.",
    ],
  },
];

const MESSAGING = [
  {
    icon: MessageCircle,
    name: "WhatsApp",
    color: "text-emerald-500",
    how: "Connect from Channels, authorise the number, and the AI starts answering. This is where most guest conversations happen.",
  },
  {
    icon: Send,
    name: "Instagram",
    color: "text-brand-500",
    how: "Connect your Instagram Business or Creator account and authorise messaging. Replies land in DMs like any other message.",
  },
  {
    icon: MessageCircle,
    name: "Facebook Messenger",
    color: "text-sky-500",
    how: "Authorise the Facebook Page your hotel already uses. The AI answers Page messages and the front desk can take over.",
  },
  {
    icon: Send,
    name: "Telegram",
    color: "text-sky-600",
    how: "Different from the others: add our bot to your group or channel as an admin, then send it the short code shown on the Channels page. That code links the group to your property — no authorisation flow.",
    special: true,
  },
];

const AGENT_EXAMPLES = [
  {
    you: "Change Deluxe Double to $95 for next weekend",
    bot: "Deluxe Double, Fri–Sun: $79 → $95. This pushes to Booking.com, Airbnb and your direct page. Confirm?",
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
    a: "Check three things in order: the channel still shows Connected on the Channels page (tokens can be revoked from the platform's side), the AI is switched on for that channel, and the conversation isn't already in manual handover — once a human replies, the AI steps back so you don't both answer at once. You can hand it back to the AI from the conversation itself.",
  },
  {
    q: "Why can't I connect TikTok?",
    a: "TikTok does not offer a messaging API to platforms like Botlify, so there is no supported way for us to read or send TikTok DMs on your behalf. We'd rather tell you that plainly than list it and quietly do nothing. WhatsApp, Instagram, Messenger, Telegram and your direct booking page all work.",
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

  return (
    <div className="bg-white">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full bg-brand-500/25 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-24 w-[22rem] h-[22rem] rounded-full bg-amber-500/15 blur-[120px]"
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-brand-200">
            <Layers className="w-3.5 h-3.5" /> The Botlify guide
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tighter leading-[1.05] max-w-3xl">
            How Botlify runs{" "}
            <span className="text-brand-500">your whole hotel</span>.
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-2xl leading-relaxed">
            Everything in one place: how to get set up, how your channels and
            messaging connect, how the AI actually sells rooms, and exactly what
            it costs. Read it end to end in about ten minutes — or jump to the
            part you need.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition shadow-glow"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#getting-started"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white font-bold text-[15px] hover:bg-white/10 transition"
            >
              Jump to setup
            </a>
          </div>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid lg:grid-cols-[15rem,minmax(0,1fr)] gap-8 lg:gap-14">
          <GuideNav />

          <div className="min-w-0 space-y-14 sm:space-y-20">
            {/* 1 — What Botlify is */}
            <Section
              id="what-it-is"
              icon={Building2}
              eyebrow="01 · The platform"
              title="What Botlify is"
            >
              <p>
                Botlify is a complete operating platform for a hotel — not a
                chatbot bolted onto one. Every part of it reads and writes the
                same calendar and the same guest list, which is the whole point:
                your availability can only ever be one number.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 not-prose">
                {[
                  {
                    icon: RefreshCw,
                    t: "Channel manager",
                    d: "Booking.com and Airbnb on one calendar, synced two ways.",
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
                    t: "AI concierge",
                    d: "Answers and books on WhatsApp, Instagram, Messenger, Telegram.",
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
                  return (
                    <div
                      key={x.t}
                      className="flex gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card"
                    >
                      <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                        <Icon className="w-[17px] h-[17px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink-900">{x.t}</p>
                        <p className="text-[13px] text-ink-500 leading-snug mt-0.5">
                          {x.d}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="font-semibold text-ink-800">What it replaces</p>
              <p>
                For most independent properties, Botlify takes the place of a
                channel-manager subscription, a booking-engine plugin, a pricing
                tool (or the pricing decisions nobody had time to make), a
                front-desk system, a guest spreadsheet and a chat widget that
                could never see real availability. One login, one calendar, one
                bill.
              </p>
              <p>
                On top of all of it sits the{" "}
                <b className="text-ink-900">Botlify Agent</b>: you type an
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
                          <span className="w-10 h-10 rounded-xl bg-brand-gradient text-white font-black flex items-center justify-center shadow-glow">
                            {i + 1}
                          </span>
                          <Icon className="w-4 h-4 text-ink-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-ink-950">
                              {s.title}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 bg-ink-100 rounded-full px-2 py-0.5">
                              {s.eyebrow}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">
                            {s.body}
                          </p>
                          <ul className="mt-3 space-y-1.5">
                            {s.bullets.map((b, k) => (
                              <li
                                key={k}
                                className="flex items-start gap-2 text-[13px] text-ink-500"
                              >
                                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand-300 shrink-0" />
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
                Connecting Booking.com, Airbnb and your messaging channels comes
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
                Botlify connects to Booking.com and Airbnb through our
                connectivity partner — the same kind of certified pipe a
                traditional channel manager uses. You start it from{" "}
                <b className="text-ink-900">Channels</b> in the dashboard.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 not-prose">
                {[
                  { icon: Globe, name: "Booking.com", color: "#003b95" },
                  { icon: Home, name: "Airbnb", color: "#ff5a5f" },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.name}
                      className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3.5 shadow-card"
                    >
                      <Icon className="w-6 h-6 shrink-0" style={{ color: c.color }} />
                      <span className="font-bold text-ink-900">{c.name}</span>
                      <span className="ml-auto text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                        0% commission
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="font-semibold text-ink-800">How the connection works</p>
              <Bullets
                items={[
                  "You authorise the channel and we request connectivity for your property.",
                  "You map each Botlify room type to the matching room and rate plan on the OTA side. This is the step worth doing carefully — everything downstream depends on it.",
                  "Rates and availability push out; reservations pull in automatically.",
                  "A sale anywhere — OTA, direct page, chat or a manual booking — drops availability everywhere else.",
                ]}
              />

              <Note icon={BadgePercent} title="What “0% commission” means">
                We take <b>nothing</b> from a booking that arrives through
                Booking.com or Airbnb. Not a percentage, not a per-reservation
                fee. Your OTA still charges you their own commission — that's
                between you and them and always has been — but Botlify adds
                nothing on top. OTA sync is included in the flat subscription.
              </Note>

              <Note tone="ink" icon={Link2} title="Your direct page is a channel too">
                Every property gets a public booking page at{" "}
                <code className="text-[13px] font-semibold text-ink-800 bg-ink-100 rounded px-1 py-0.5">
                  /book/your-hotel
                </code>{" "}
                reading the same calendar. Link it from your website, your
                Instagram bio or a WhatsApp reply — no OTA takes a cut of those.
              </Note>
            </Section>

            {/* 4 — Messaging */}
            <Section
              id="messaging"
              icon={MessageCircle}
              eyebrow="04 · Messaging"
              title="Connecting messaging"
            >
              <p>
                This is where the AI concierge lives. Connect the channels your
                guests already message you on — every conversation, whatever the
                channel, lands in the same unified inbox.
              </p>

              <div className="space-y-3 not-prose">
                {MESSAGING.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.name}
                      className={`rounded-xl border bg-white p-4 shadow-card ${
                        m.special ? "border-brand-200" : "border-ink-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-5 h-5 shrink-0 ${m.color}`} />
                        <p className="font-bold text-ink-900">{m.name}</p>
                        {m.special && (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                            Connects differently
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                        {m.how}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Note
                tone="amber"
                icon={TriangleAlert}
                title="TikTok is not supported — and won't quietly pretend to be"
              >
                TikTok does not offer a messaging API to platforms like Botlify.
                There is no supported way for us to read or send TikTok DMs on
                your behalf, so we don't list it as a channel. If that ever
                changes, we'll add it. Everything above works today.
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
                <b className="text-ink-900">name</b>, a number of{" "}
                <b className="text-ink-900">units</b>, an{" "}
                <b className="text-ink-900">occupancy</b> and a{" "}
                <b className="text-ink-900">nightly rate</b>. For example:
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
                    className="rounded-xl border border-ink-100 bg-ink-50/50 p-4"
                  >
                    <p className="text-sm font-black text-ink-900">{x.t}</p>
                    <p className="mt-1 text-[13px] text-ink-500 leading-snug">
                      {x.d}
                    </p>
                  </div>
                ))}
              </div>

              <p className="font-semibold text-ink-800">Why the rate matters</p>
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
                  "Add rooms by hand, or import types, rates and photos from a Booking.com or Airbnb listing.",
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
              eyebrow="06 · The AI concierge"
              title="How the AI concierge works"
            >
              <p>
                The concierge is not a scripted FAQ bot. It reads the same live
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
                    <div
                      key={x.t}
                      className="rounded-xl border border-ink-100 bg-white p-4 shadow-card"
                    >
                      <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                        <Icon className="w-[17px] h-[17px]" />
                      </span>
                      <p className="mt-3 text-sm font-black text-ink-900">{x.t}</p>
                      <p className="mt-1 text-[13px] text-ink-500 leading-snug">
                        {x.d}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p>
                It answers in your tone, around the clock, and it works from the
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

              <div className="not-prose rounded-2xl border border-ink-200/60 bg-ink-950 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <Terminal className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-black text-white">
                    Botlify Agent
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
                <div className="p-4 space-y-3 min-h-[11rem]">
                  <div className="flex justify-end">
                    <span className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500 text-white text-sm px-4 py-2.5 leading-snug">
                      {active.you}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-brand-300" />
                    </span>
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.07] border border-white/10 px-4 py-2.5">
                      <p className="text-sm text-white/85 leading-snug">
                        {active.bot}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">
                        <Shield className="w-3 h-3" /> {active.kind}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-white/35 mb-2 px-1">
                    Try one
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGENT_EXAMPLES.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAgentTurn(i)}
                        className={`text-left text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition ${
                          i === agentTurn
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

              <Note icon={Shield} title="It always asks before it acts">
                Read-only questions are answered straight away. Anything that
                changes a rate, availability or a booking shows you exactly what
                will change and waits for your confirmation. One confirmed
                instruction then updates Booking.com, Airbnb and your direct page
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

              <div className="not-prose rounded-xl border border-ink-100 bg-ink-50/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Example suggestion
                </p>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                  “Sep 3–5 is 30% booked — usually 70% this close to the date.
                  Drop Deluxe Double from $95 to $85?”
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 rounded-lg px-3 py-1.5">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 bg-white border border-ink-200 rounded-lg px-3 py-1.5">
                    Skip
                  </span>
                </div>
              </div>

              <p className="font-semibold text-ink-800">You stay in control</p>
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
                  return (
                    <div
                      key={x.t}
                      className="flex gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card"
                    >
                      <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                        <Icon className="w-[17px] h-[17px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink-900">{x.t}</p>
                        <p className="mt-0.5 text-[13px] text-ink-500 leading-snug">
                          {x.d}
                        </p>
                      </div>
                    </div>
                  );
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
                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Subscription
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tighter text-ink-950">
                      $49
                    </span>
                    <span className="text-sm text-ink-500">/ month, flat</span>
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-500 leading-snug">
                    Per property — not per room, not per channel. Or $490/year
                    (two months free).
                  </p>
                </div>
                <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                    Right now
                  </p>
                  <p className="mt-2 text-lg font-black text-ink-950 leading-tight">
                    A free “Launch” plan
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-600 leading-snug">
                    Same features, no card, while we launch. The paid plan has a
                    3-day free trial — a card is required to start it.
                  </p>
                </div>
              </div>

              <p className="font-semibold text-ink-800">Commission — two numbers</p>
              <div className="not-prose overflow-x-auto rounded-2xl border border-ink-100 shadow-card">
                <table className="w-full text-sm min-w-[34rem]">
                  <thead>
                    <tr className="bg-ink-50/80 text-left">
                      <th className="px-4 py-3 font-bold text-ink-700">
                        Where the booking came from
                      </th>
                      <th className="px-4 py-3 font-bold text-ink-700 w-32">
                        Botlify takes
                      </th>
                      <th className="px-4 py-3 font-bold text-ink-700">Why</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 bg-white">
                    <tr>
                      <td className="px-4 py-3.5 text-ink-800 font-semibold align-top">
                        Booking.com / Airbnb
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-block rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-black px-2.5 py-1 text-xs">
                          0%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-600 align-top">
                        OTA sync is completely free. You'd have got that booking
                        anyway — we don't charge for carrying it.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3.5 text-ink-800 font-semibold align-top">
                        Closed by the AI — WhatsApp, Instagram, Messenger,
                        Telegram or your direct page
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-block rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-black px-2.5 py-1 text-xs">
                          10%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-600 align-top">
                        OTAs charge <b className="text-ink-900">15–18%</b> for
                        the same reservation. This is cheaper — and it's on
                        revenue you wouldn't otherwise have had.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3.5 text-ink-800 font-semibold align-top">
                        Airport transfer via our partner network
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-block rounded-full bg-ink-100 border border-ink-200 text-ink-700 font-black px-2.5 py-1 text-xs">
                          ~5–10%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-600 align-top">
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
                <b className="text-ink-900">ledger</b> in your dashboard as it
                happens, and at month end we email you a{" "}
                <b className="text-ink-900">statement</b> of what's owed. You
                settle it by bank transfer or invoice.
                <br />
                <br />
                <b className="text-ink-900">
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
                  className="font-bold text-brand-600 hover:text-brand-700 underline decoration-brand-200 underline-offset-2"
                >
                  See the consultant program
                </Link>
                .
              </Note>

              <div className="not-prose">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-ink-950 text-white font-bold text-sm hover:bg-ink-800 transition"
                >
                  See full pricing <ArrowRight className="w-4 h-4" />
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
                    className="w-full text-left rounded-2xl border border-ink-100 bg-white px-5 py-4 hover:border-brand-300 transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-ink-900 text-sm">
                        {f.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-ink-400 shrink-0 transition ${
                          openFaq === i ? "rotate-180 text-ink-900" : ""
                        }`}
                      />
                    </div>
                    {openFaq === i && (
                      <p className="mt-3 text-sm text-ink-600 leading-relaxed">
                        {f.a}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* ── Closing CTA ─────────────────────────────── */}
            <section className="relative overflow-hidden rounded-3xl bg-ink-950 p-8 sm:p-12 text-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-500/30 blur-3xl"
              />
              <div className="relative">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  Ready to put it together?
                </h2>
                <p className="mt-3 text-white/70 text-[15px] max-w-lg mx-auto leading-relaxed">
                  Create your account, name your hotel, add your rooms. Your
                  calendar and direct booking page are live before you finish
                  your coffee.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition shadow-glow"
                  >
                    Start free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="mailto:contactus@botlify.site"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white font-bold text-[15px] hover:bg-white/10 transition"
                  >
                    <Mail className="w-4 h-4" /> Email us a question
                  </a>
                </div>
                <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-brand-400" /> Free Launch plan
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-brand-400" /> 0% on OTA
                    bookings
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-brand-400" /> Cancel anytime
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
