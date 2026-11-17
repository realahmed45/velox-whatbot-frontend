import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Globe2,
  Hand,
  Languages,
  MessageSquareText,
  ShieldCheck,
  X,
} from "lucide-react";
import { WhatsAppMark } from "@/components/ChannelMarks";
import { BTN_BLACK, ChannelIcon, Eyebrow, Reveal, SectionTitle, WRAP } from "./shared";

/* ═════════════════════════════════════════════════════════════════════════
 * Channel marquee — a bold orange band. CSS transform only.
 * ═════════════════════════════════════════════════════════════════════════ */
const STRIP = [
  { ch: "airbnb", label: "Airbnb" },
  { ch: "booking", label: "Booking.com" },
  { ch: "expedia", label: "Expedia" },
  { ch: "trip", label: "Trip.com" },
  { ch: "whatsapp", label: "WhatsApp" },
  { label: "One calendar" },
  { label: "Every language" },
  { label: "24/7 replies" },
];

function StripRow({ hidden }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {STRIP.map((s) => (
        <li key={s.label} className="flex items-center">
          <span className="flex items-center gap-3 px-6 sm:px-8">
            {s.ch && (
              <span className="rounded-[9px] ring-2 ring-[#0A0A0A]/90">
                <ChannelIcon channel={s.ch} size={34} />
              </span>
            )}
            <span className="whitespace-nowrap text-[26px] font-semibold tracking-[-0.04em] sm:text-[34px]">
              {s.label}
            </span>
          </span>
          <span className="text-[22px] text-[#0A0A0A]/60" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ChannelMarquee() {
  return (
    <section
      id="channels"
      aria-label="Works with Airbnb, Booking.com, Expedia, Trip.com and WhatsApp"
      className="relative overflow-hidden border-y-2 border-[#0A0A0A] bg-[#FF5A1F] py-5 text-[#0A0A0A] sm:py-6"
    >
      <div className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none">
        <StripRow />
        <StripRow hidden />
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
 * How it works — three steps.
 * ═════════════════════════════════════════════════════════════════════════ */
function VisualConnect() {
  return (
    <div className="space-y-2">
      {["airbnb", "booking", "expedia", "trip", "whatsapp"].map((c, i) => (
        <div key={c} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200">
          <ChannelIcon channel={c} size={22} />
          <span className="flex-1 text-[12.5px] font-medium">
            {{ airbnb: "Airbnb", booking: "Booking.com", expedia: "Expedia", trip: "Trip.com", whatsapp: "WhatsApp" }[c]}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
              i < 4 ? "bg-[#0A0A0A] text-white" : "bg-[#FF5A1F] text-[#0A0A0A]"
            }`}
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> Connected
          </span>
        </div>
      ))}
    </div>
  );
}

function VisualTeach() {
  const qa = [
    ["Check-in time?", "From 2pm"],
    ["Parking?", "Free, covered"],
    ["Breakfast?", "7:00 – 10:30"],
    ["Pets?", "Ask the team"],
  ];
  return (
    <div className="space-y-2">
      {qa.map(([q, a]) => (
        <div key={q} className="rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200">
          <p className="text-[11px] font-medium text-neutral-500">{q}</p>
          <p className="mt-0.5 flex items-center justify-between text-[13px] font-semibold">
            {a}
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
          </p>
        </div>
      ))}
    </div>
  );
}

function VisualRun() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-xl bg-[#0A0A0A] px-3.5 py-3 text-white">
        <span className="text-[13px] font-semibold">AI replies</span>
        <span className="flex h-6 w-11 items-center justify-end rounded-full bg-[#FF5A1F] p-0.5">
          <span className="h-5 w-5 rounded-full bg-white shadow" />
        </span>
      </div>
      <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-neutral-200">
        <p className="text-[11px] font-medium text-neutral-500">Needs you</p>
        <p className="mt-1 flex items-center gap-2 text-[12.5px] font-semibold">
          <Hand className="h-3.5 w-3.5 text-[#FF5A1F]" /> Refund request · Room 12
        </p>
      </div>
      <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-neutral-200">
        <p className="text-[11px] font-medium text-neutral-500">Handled by AI</p>
        <p className="mt-1 flex items-center gap-2 text-[12.5px] font-semibold">
          <Check className="h-3.5 w-3.5 text-[#FF5A1F]" strokeWidth={3} /> Every other message
        </p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Connect your channels",
    body: "Link Airbnb, Booking.com, Expedia, Trip.com and your WhatsApp number in a few clicks.",
    Visual: VisualConnect,
  },
  {
    n: "02",
    title: "Teach it your hotel",
    body: "Answer a few questions — check-in, parking, breakfast, house rules. That's its playbook.",
    Visual: VisualTeach,
  },
  {
    n: "03",
    title: "Let it run",
    body: "The AI answers every guest, day and night. Anything unusual comes straight to your team.",
    Visual: VisualRun,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 bg-white py-24 text-[#0A0A0A] sm:py-32">
      <div className={WRAP}>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle className="mt-5">
              Live in <span className="text-[#FF5A1F]">ten minutes.</span>
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-sm text-[17px] leading-relaxed text-neutral-600">
              No migration project, no training course. Three steps and your inbox runs itself.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {STEPS.map(({ n, title, body, Visual }, i) => (
            <Reveal
              key={n}
              delay={i * 0.07}
              inner="group flex flex-col rounded-[28px] border border-neutral-200 bg-white p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-[#0A0A0A] hover:shadow-[0_24px_50px_-28px_rgba(10,10,10,0.35)] sm:p-7"
            >
              <span className="text-[64px] font-semibold leading-none tracking-[-0.06em] text-[#FF5A1F] sm:text-[80px]">
                {n}
              </span>
              <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{body}</p>
              <div className="mt-7 rounded-2xl bg-neutral-100 p-3 transition-colors duration-300 group-hover:bg-[#FFF1EA]">
                <Visual />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
 * Replaces the human work — bold black section with big numbers.
 * ═════════════════════════════════════════════════════════════════════════ */
const NUMBERS = [
  { big: "24/7", label: "Every guest message answered — nights, weekends, holidays." },
  { big: "5", label: "Inboxes in one: Airbnb, Booking.com, Expedia, Trip.com, WhatsApp." },
  { big: "0%", label: "Commission on OTA bookings. Flat monthly price." },
  { big: "10", unit: "min", label: "From sign-up to the AI answering your first guest." },
];

const BEFORE = [
  "Someone checks five inboxes, all day",
  "Copy-pasting the same answers about parking and check-in",
  "Guests at 3am wait until morning",
  "Updating rates on every site by hand",
];
const AFTER = [
  "The AI replies inside every inbox, in seconds",
  "Answers come from your live calendar and your hotel facts",
  "Every guest answered, in their language, any hour",
  "One calendar — sold on one site, closed on all",
];

export function Replaces() {
  return (
    <section id="replaces" className="scroll-mt-16 bg-[#0A0A0A] py-24 text-white sm:py-32">
      <div className={WRAP}>
        <Reveal className="max-w-4xl">
          <Eyebrow dark>Replaces the human work</Eyebrow>
          <SectionTitle dark className="mt-5">
            The guest-messaging shift? <span className="text-[#FF5A1F]">Gone.</span>
          </SectionTitle>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/60 sm:text-[19px]">
            Guest messaging used to need a person on every channel, every night. Botlify does the job — your
            team only steps in when a human is truly needed.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-white/10 lg:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.big} delay={i * 0.06} className="bg-[#0A0A0A] p-5 sm:p-8">
              <p className="text-[56px] font-semibold leading-none tracking-[-0.06em] text-[#FF5A1F] sm:text-[84px] lg:text-[96px]">
                {n.big}
                {n.unit && <span className="ml-1 text-[0.4em] tracking-[-0.03em] text-white">{n.unit}</span>}
              </p>
              <p className="mt-4 max-w-[16rem] text-[13.5px] leading-relaxed text-white/60 sm:text-[15px]">{n.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-[28px] border border-white/10 p-7 sm:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/45">Before</p>
            <ul className="mt-6 space-y-4">
              {BEFORE.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[16px] text-white/50">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10">
                    <X className="h-3 w-3 text-white/60" strokeWidth={3} />
                  </span>
                  <span className="line-through decoration-white/25">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06} className="rounded-[28px] bg-[#FF5A1F] p-7 text-[#0A0A0A] sm:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0A0A0A]/70">With Botlify</p>
            <ul className="mt-6 space-y-4">
              {AFTER.map((a) => (
                <li key={a} className="flex items-start gap-3 text-[16px] font-medium">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0A0A0A]">
                    <Check className="h-3 w-3 text-[#FF5A1F]" strokeWidth={3.5} />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
 * Features — bento.
 * ═════════════════════════════════════════════════════════════════════════ */
const CARD_HOVER =
  "transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1";

function IconTile({ Icon, dark = false }) {
  return (
    <span
      className={`grid h-11 w-11 place-items-center rounded-2xl ${
        dark ? "bg-white text-[#0A0A0A]" : "bg-[#0A0A0A] text-[#FF5A1F]"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
  );
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CAL = [
  { room: "Deluxe", bars: [[0, 3, "airbnb"], [4, 3, "booking"]] },
  { room: "Twin", bars: [[1, 2, "trip"], [3, 4, "expedia"]] },
  { room: "Suite", bars: [[0, 2, "booking"], [2, 3, "whatsapp"]] },
];

function MiniCalendar() {
  return (
    <div className="rounded-2xl bg-neutral-100 p-3">
      <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] gap-1 text-center text-[10px] font-semibold text-neutral-400">
        <span />
        {DAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1.5 space-y-1.5">
        {CAL.map((r) => (
          <div key={r.room} className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] items-center gap-1">
            <span className="truncate text-[10.5px] font-semibold">{r.room}</span>
            {r.bars.map(([start, len, ch]) => (
              <span
                key={start}
                className={`flex h-6 items-center gap-1 rounded-md px-1 ${
                  ch === "booking" || ch === "trip" ? "bg-[#0A0A0A]" : "bg-[#FF5A1F]"
                }`}
                style={{ gridColumn: `${start + 2} / span ${len}` }}
              >
                <ChannelIcon channel={ch} size={14} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-white py-24 text-[#0A0A0A] sm:py-32">
      <div className={WRAP}>
        <Reveal className="max-w-3xl">
          <Eyebrow>Features</Eyebrow>
          <SectionTitle className="mt-5">
            One AI. Every inbox. <span className="text-neutral-500">Every calendar.</span>
          </SectionTitle>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          {/* AI in every OTA inbox — the big orange block */}
          <Reveal className="lg:col-span-4" inner={`relative overflow-hidden rounded-[28px] bg-[#FF5A1F] p-7 sm:p-9 ${CARD_HOVER}`}>
            <IconTile Icon={MessageSquareText} />
            <h3 className="mt-6 max-w-md text-[28px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[36px]">
              AI inside every booking-site inbox
            </h3>
            <p className="mt-3 max-w-md text-[15.5px] font-medium leading-relaxed text-[#0A0A0A]/75">
              Guests keep messaging where they booked. Botlify replies in the same Airbnb, Booking.com,
              Expedia and Trip.com thread — no new app for anyone.
            </p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {[
                ["airbnb", "Early check-in?", "Yes — from 12pm, on us."],
                ["booking", "Is there a lift?", "Yes, to every floor."],
                ["expedia", "Late checkout?", "Until 1pm is free."],
                ["trip", "Airport far?", "25 min — want a taxi?"],
              ].map(([ch, q, a]) => (
                <div key={ch} className="flex items-center gap-3 rounded-2xl bg-[#0A0A0A] p-3 text-white">
                  <ChannelIcon channel={ch} size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] text-white/55">{q}</p>
                    <p className="truncate text-[13px] font-semibold">{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* WhatsApp concierge — black */}
          <Reveal delay={0.05} className="lg:col-span-2" inner={`flex flex-col rounded-[28px] bg-[#0A0A0A] p-7 text-white sm:p-9 ${CARD_HOVER}`}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366] text-white">
              <WhatsAppMark className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-[24px] font-semibold leading-[1.1] tracking-[-0.035em]">WhatsApp concierge</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/60">
              Guests text your number before, during and after the stay. Directions, pickups, requests —
              handled.
            </p>
            <div className="mt-auto space-y-2 pt-8">
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/10 px-3.5 py-2.5 text-[13px]">
                Where do we park?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[#FF5A1F] px-3.5 py-2.5 text-[13px] font-medium text-[#0A0A0A]">
                Right under the hotel — free. Entrance on Marina St.
              </div>
            </div>
          </Reveal>

          {/* Channel sync */}
          <Reveal className="lg:col-span-2" inner={`rounded-[28px] border border-neutral-200 p-7 hover:border-[#0A0A0A] ${CARD_HOVER}`}>
            <IconTile Icon={Globe2} />
            <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em]">Channel sync, one calendar</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
              Rooms, rates and availability across every site. Sold on one, closed on all — no double
              bookings.
            </p>
            <div className="mt-6">
              <MiniCalendar />
            </div>
          </Reveal>

          {/* Human handoff */}
          <Reveal delay={0.05} className="lg:col-span-2" inner={`rounded-[28px] border border-neutral-200 p-7 hover:border-[#0A0A0A] ${CARD_HOVER}`}>
            <IconTile Icon={Hand} />
            <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em]">Human handoff</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
              Complaints, refunds and anything unusual are flagged to your team instantly. Take over any
              thread in one click.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-neutral-100 p-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0A0A0A] text-[12px] font-bold text-white">
                SK
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold">Sara took over</p>
                <p className="truncate text-[11px] text-neutral-500">AI paused for this guest</p>
              </div>
              <span className="rounded-full bg-[#FF5A1F] px-2.5 py-1 text-[10.5px] font-bold text-[#0A0A0A]">Live</span>
            </div>
          </Reveal>

          {/* Every language */}
          <Reveal delay={0.1} className="lg:col-span-2" inner={`rounded-[28px] border border-neutral-200 p-7 hover:border-[#0A0A0A] ${CARD_HOVER}`}>
            <IconTile Icon={Languages} />
            <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em]">Every language</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
              Guests write in their language; the AI answers in it. No translation step, no lost meaning.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Bonjour", "Hola", "Hallo", "こんにちは", "مرحبا", "你好", "Ciao", "Olá"].map((w, i) => (
                <span
                  key={w}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                    i === 0 ? "bg-[#FF5A1F] text-[#0A0A0A]" : "bg-neutral-100"
                  }`}
                >
                  {w}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Only true answers — wide strip */}
          <Reveal className="lg:col-span-6" inner={`grid items-center gap-8 rounded-[28px] border-2 border-[#0A0A0A] p-7 sm:p-9 lg:grid-cols-2 ${CARD_HOVER}`}>
            <div>
              <IconTile Icon={ShieldCheck} />
              <h3 className="mt-6 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[32px]">
                Only true answers. Never made up.
              </h3>
              <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-neutral-600">
                Botlify answers from your live calendar and the facts you taught it. If it doesn't know, it
                says so and asks your team — anything that touches money or availability needs your approval.
              </p>
            </div>
            <div className="space-y-2.5 rounded-2xl bg-neutral-100 p-4">
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[13.5px] ring-1 ring-neutral-200">
                Can I bring my dog?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[#0A0A0A] px-3.5 py-2.5 text-[13.5px] text-white">
                Let me check that with the team — I'll come back to you shortly.
              </div>
              <p className="flex items-center justify-end gap-1.5 text-[11.5px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" /> Not in hotel facts · sent to your team
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Link to="/guide" className={BTN_BLACK}>
            Read the setup guide
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
