import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { BTN_BLACK, BTN_GHOST_LIGHT, Eyebrow, Reveal, SectionTitle, WRAP } from "./shared";

/* ═════════════════════════════════════════════════════════════════════════
 * Pricing — one plan, orange.
 * ═════════════════════════════════════════════════════════════════════════ */
const INCLUDED = [
  "AI replies inside Airbnb, Booking.com, Expedia & Trip.com inboxes",
  "WhatsApp AI concierge",
  "Channel sync — rooms, rates & availability on one calendar",
  "Human handoff & team inbox",
  "Replies in every language, 24/7",
  "Guest profiles across every channel",
  "0% commission on OTA bookings",
  "Priority support",
];

export function Pricing() {
  const [cycle, setCycle] = useState("monthly");
  const yearly = cycle === "yearly";

  return (
    <section id="pricing" className="scroll-mt-16 bg-[#0A0A0A] py-24 text-white sm:py-32">
      <div className={WRAP}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow dark>Pricing</Eyebrow>
          <SectionTitle dark className="mt-5">
            One plan. <span className="text-[#FF5A1F]">Flat price.</span>
          </SectionTitle>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/60">
            Not per room, not per channel. 0% commission on OTA bookings — 10% only on bookings the AI
            closes for you in chat.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex justify-center">
          <div role="radiogroup" aria-label="Billing cycle" className="relative inline-flex rounded-full bg-white/[0.08] p-1 ring-1 ring-white/10">
            <span
              aria-hidden
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#FF5A1F] transition-transform duration-300 ease-out-expo ${
                yearly ? "translate-x-full" : "translate-x-0"
              }`}
            />
            {[
              ["monthly", "Monthly"],
              ["yearly", "Yearly · 2 mo free"],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={cycle === v}
                onClick={() => setCycle(v)}
                className={`relative z-10 h-10 w-[150px] rounded-full text-[13.5px] font-semibold transition-colors duration-200 sm:w-[170px] ${
                  cycle === v ? "text-[#0A0A0A]" : "text-white/70 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-10 max-w-5xl">
          <div className="grid overflow-hidden rounded-[32px] bg-white text-[#0A0A0A] shadow-[0_40px_100px_-40px_rgba(255,90,31,0.55)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* Price side — orange */}
            <div className="relative flex flex-col bg-[#FF5A1F] p-7 sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-bold tracking-[-0.01em]">Botlify for Hotels</p>
                <span className="rounded-full bg-[#0A0A0A] px-3 py-1 text-[11.5px] font-bold text-white">
                  3-day free trial
                </span>
              </div>
              <div className="mt-8 flex items-end gap-2">
                <motion.span
                  key={cycle}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[84px] font-semibold leading-[0.85] tracking-[-0.06em] tabular-nums sm:text-[104px]"
                >
                  {yearly ? "$490" : "$49"}
                </motion.span>
                <span className="pb-2 text-[16px] font-semibold">/{yearly ? "year" : "month"}</span>
              </div>
              <p className="mt-4 text-[14.5px] font-medium text-[#0A0A0A]/75">
                {yearly ? "About $40.83 a month — two months free." : "Billed monthly. Switch to yearly for 2 months free."}
              </p>
              <div className="mt-auto pt-10">
                <PlanCta />
                <p className="mt-3 text-center text-[12.5px] font-medium text-[#0A0A0A]/70">
                  Cancel anytime · set up in ~10 minutes
                </p>
              </div>
            </div>

            {/* Included side — white */}
            <div className="p-7 sm:p-10">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Everything included</p>
              <ul className="mt-6 space-y-3.5">
                {INCLUDED.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] leading-snug">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0A0A0A]">
                      <Check className="h-3 w-3 text-[#FF5A1F]" strokeWidth={3.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-6">
                <div>
                  <p className="text-[32px] font-semibold leading-none tracking-[-0.05em]">0%</p>
                  <p className="mt-1.5 text-[12.5px] text-neutral-600">on OTA bookings</p>
                </div>
                <div>
                  <p className="text-[32px] font-semibold leading-none tracking-[-0.05em]">10%</p>
                  <p className="mt-1.5 text-[12.5px] text-neutral-600">only on bookings the AI closes in chat</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-8 text-center text-[14px] text-white/55">
          Questions about billing?{" "}
          <Link to="/pricing" className="font-semibold text-white underline decoration-[#FF5A1F] decoration-2 underline-offset-4 hover:text-[#FF5A1F]">
            Full pricing details
          </Link>
        </p>
      </div>
    </section>
  );
}

function PlanCta() {
  const isAuthed = !!useAuthStore((s) => s.token);
  return (
    <Link to={isAuthed ? "/dashboard" : "/register"} className={`${BTN_BLACK} w-full`}>
      {isAuthed ? "Open dashboard" : "Start free trial"}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
 * FAQ
 * ═════════════════════════════════════════════════════════════════════════ */
const FAQS = [
  {
    q: "What exactly is Botlify?",
    a: "An AI channel manager for hotels. It syncs your rooms, rates and availability across Airbnb, Booking.com, Expedia and Trip.com on one calendar, and its AI answers your guests inside those booking-site inboxes and on WhatsApp, 24/7 — so nobody on your team has to answer messages by hand.",
  },
  {
    q: "Does the AI really reply inside Airbnb and Booking.com?",
    a: "Yes. Guests keep messaging where they booked; Botlify reads the message and replies in the same thread, using your live calendar and the hotel facts you've taught it.",
  },
  {
    q: "What if a guest asks something the AI shouldn't handle?",
    a: "Complaints, refund requests and anything unusual are flagged to your team straight away, and anyone on your team can take over a conversation at any moment. Anything that changes money or availability needs your approval.",
  },
  {
    q: "Which channels do you connect?",
    a: "Airbnb, Booking.com, Expedia and Trip.com, plus WhatsApp.",
  },
  {
    q: "Do I still need a separate channel manager?",
    a: "No. Botlify is the channel manager: a room sold on any connected site closes on all the others, so you don't double-book.",
  },
  {
    q: "What does it cost?",
    a: "Botlify for Hotels is $49 a month or $490 a year (2 months free) — flat, not per room and not per channel — with a 3-day free trial. 0% commission on OTA bookings; 10% only on bookings the AI closes for you in chat.",
  },
  {
    q: "How long does setup take?",
    a: "About 10 minutes: connect your booking sites and WhatsApp, answer a few questions about your hotel, and the AI starts replying.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, in one click from Billing. You keep access until the end of your current period.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-16 bg-white py-24 text-[#0A0A0A] sm:py-32">
      <div className={`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16`}>
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <SectionTitle className="mt-5">
            Questions, <span className="text-[#FF5A1F]">answered.</span>
          </SectionTitle>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-neutral-600">
            Something else on your mind?{" "}
            <Link to="/help" className="font-semibold text-[#0A0A0A] underline decoration-[#FF5A1F] decoration-2 underline-offset-4">
              Visit help
            </Link>{" "}
            or{" "}
            <Link to="/contact" className="font-semibold text-[#0A0A0A] underline decoration-[#FF5A1F] decoration-2 underline-offset-4">
              talk to us
            </Link>
            .
          </p>
        </Reveal>

        <ul className="border-t-2 border-[#0A0A0A]">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                >
                  <span className="text-[17px] font-semibold tracking-[-0.02em] transition-colors sm:text-[19px]">
                    {f.q}
                  </span>
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ease-out-expo ${
                      isOpen
                        ? "rotate-45 bg-[#FF5A1F] text-[#0A0A0A]"
                        : "bg-neutral-100 text-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white"
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </button>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-2xl pb-6 pr-12 text-[15.5px] leading-relaxed text-neutral-600"
                  >
                    {f.a}
                  </motion.p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
 * Final CTA — the big orange band.
 * ═════════════════════════════════════════════════════════════════════════ */
export function FinalCTA() {
  const isAuthed = !!useAuthStore((s) => s.token);
  return (
    <section className="relative overflow-hidden bg-[#FF5A1F] py-24 text-[#0A0A0A] sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#0A0A0A_1.2px,transparent_1.2px)] [background-size:22px_22px]"
      />
      <div className={`${WRAP} relative`}>
        <Reveal className="max-w-5xl">
          <h2 className="text-balance text-[48px] font-semibold leading-[0.92] tracking-[-0.055em] sm:text-[80px] lg:text-[112px]">
            Let the AI take the inbox shift.
          </h2>
          <p className="mt-8 max-w-xl text-[18px] font-medium leading-relaxed text-[#0A0A0A]/75 sm:text-[20px]">
            Connect your channels today and every guest gets an answer tonight.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to={isAuthed ? "/dashboard" : "/register"} className={`${BTN_BLACK} h-14 px-8 text-[16px]`}>
              {isAuthed ? "Open dashboard" : "Start free trial"}
              <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link to="/contact" className={`${BTN_GHOST_LIGHT} h-14 px-8 text-[16px]`}>
              Talk to us
            </Link>
          </div>
          <p className="mt-8 text-[14px] font-semibold">
            3-day free trial · 10-minute setup · 0% OTA commission
          </p>
        </Reveal>
      </div>
    </section>
  );
}
