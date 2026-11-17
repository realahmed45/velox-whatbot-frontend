import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, CalendarCheck2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import HeroInbox from "./HeroInbox";
import { BTN_GHOST_DARK, BTN_ORANGE, ChannelIcon, EASE, WRAP } from "./shared";

const TRUST = ["0% OTA commission", "Answers 24/7", "10-minute setup"];

export default function Hero() {
  const isAuthed = !!useAuthStore((s) => s.token);
  const reduce = useReducedMotion();
  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <section className="relative isolate -mt-16 overflow-hidden bg-[#0A0A0A] pb-20 pt-28 text-white sm:pb-28 sm:pt-36">
      {/* Static backdrop: faint grid + one orange glow. Nothing animates. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-[10%] -z-10 h-[720px] w-[720px] rounded-full [background:radial-gradient(closest-side,rgba(255,90,31,0.32),rgba(255,90,31,0.08)_55%,transparent)] lg:right-[-8%]"
      />

      <div className={`${WRAP} grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12`}>
        <div className="min-w-0">
          <motion.p
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] py-1 pl-1 pr-3.5 text-[13px] text-white/75"
          >
            <span className="rounded-full bg-[#FF5A1F] px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] text-[#0A0A0A]">
              AI
            </span>
            The channel manager for hotels
          </motion.p>

          <motion.h1
            {...rise(0.06)}
            className="mt-7 text-[46px] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[72px] lg:text-[78px] xl:text-[88px]"
          >
            Your guests message.
            <br />
            <span className="text-white/45">Botlify </span>
            <span className="relative inline-block text-[#FF5A1F]">
              answers.
              <motion.span
                aria-hidden
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
                className="absolute -bottom-[0.06em] left-0 h-[0.07em] w-full origin-left rounded-full bg-[#FF5A1F]"
              />
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.14)}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-white/65 sm:text-[19px]"
          >
            The AI channel manager that keeps rooms, rates and availability in sync across Airbnb,
            Booking.com, Expedia and Trip.com — and answers every guest message in those inboxes and on
            WhatsApp, 24/7.
          </motion.p>

          <motion.div {...rise(0.22)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            {isAuthed ? (
              <Link to="/dashboard" className={BTN_ORANGE}>
                Open dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link to="/register" className={BTN_ORANGE}>
                Start free trial
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            )}
            <a href="#how" className={BTN_GHOST_DARK}>
              See it work
            </a>
          </motion.div>

          <motion.ul {...rise(0.3)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-2 text-[14px] font-medium text-white/80">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#FF5A1F]">
                  <Check className="h-3 w-3 text-[#0A0A0A]" strokeWidth={3.5} />
                </span>
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="relative min-w-0"
        >
          <HeroInbox />

          {/* Floating proof chips (desktop) */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
            className="absolute -left-10 -top-6 hidden items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-[#0A0A0A] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)] xl:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F]">
              <CalendarCheck2 className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-[12.5px] font-semibold">Room 204 sold on Booking.com</span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500">
                Closed on
                <ChannelIcon channel="airbnb" size={14} />
                <ChannelIcon channel="expedia" size={14} />
                <ChannelIcon channel="trip" size={14} />
                in 2s
              </span>
            </span>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1, ease: EASE }}
            className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-[#FF5A1F] px-4 py-3 text-[#0A0A0A] shadow-[0_20px_40px_-16px_rgba(255,90,31,0.7)] lg:block"
          >
            <span className="block text-[26px] font-bold leading-none tracking-[-0.04em]">0</span>
            <span className="mt-1 block text-[11.5px] font-semibold">guests left waiting</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
