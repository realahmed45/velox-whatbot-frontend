import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CheckCheck, Sparkles } from "lucide-react";
import { ChannelIcon, CHANNEL_NAME, EASE } from "./shared";

/* ─────────────────────────────────────────────────────────────────────────
 * The hero's live product visual: a unified inbox where messages from
 * Airbnb, Booking.com, WhatsApp and Trip.com arrive and the AI reply types
 * itself in. A handful of timed state changes; opacity/transform only.
 * Pauses while off-screen. Click a thread to jump to it.
 * ──────────────────────────────────────────────────────────────────────── */
const SCENES = [
  {
    ch: "airbnb",
    name: "Maya Fischer",
    meta: "Deluxe Ocean · Fri – Sun",
    guest: "Hi! We land at 11am — any chance of an early check-in?",
    reply: "Hi Maya! Your room is free that morning, so early check-in from 12pm is on us. See you Friday.",
    took: "6s",
  },
  {
    ch: "booking",
    name: "Lukas Weber",
    meta: "Twin Room · 3 nights",
    guest: "Is parking included? And is it covered?",
    reply: "Yes — free covered parking right under the hotel. A spot is held under your booking, Lukas.",
    took: "4s",
  },
  {
    ch: "whatsapp",
    name: "Aisha Rahman",
    meta: "WhatsApp · arriving tonight",
    guest: "Can you arrange an airport pickup for 2 people tonight?",
    reply: "Done! Your driver meets you at Arrivals at 9:40pm with your name on a sign. Safe flight, Aisha.",
    took: "7s",
  },
  {
    ch: "trip",
    name: "Chen Wei",
    meta: "Superior King · 2 nights",
    guest: "你们有早餐吗？几点开始？",
    reply: "有的！早餐每天 7:00–10:30 在一楼餐厅供应，已包含在您的房价中。",
    took: "5s",
    lang: "Replied in Chinese",
  },
];

// phase: 0 guest arrives · 1 AI typing dots · 2 reply typing · 3 sent
const T_DOTS = 800;
const T_TYPE = 1500;
const T_HOLD = 2600;

/** Reveals text chunk by chunk with its own state, so only the bubble re-renders. */
const TypedText = memo(function TypedText({ text, onDone, instant }) {
  // CJK has no spaces — type it by character; everything else by word.
  const chunks = /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
  const [n, setN] = useState(instant ? chunks.length : 0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (instant) return undefined;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= chunks.length) {
        clearInterval(id);
        done.current?.();
      }
    }, /\s/.test(text) ? 48 : 70);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, instant]);

  return (
    <>
      {chunks.slice(0, n).join("")}
      {n < chunks.length && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#0A0A0A]/70" aria-hidden />
      )}
    </>
  );
});

function Dots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Botlify AI is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0A0A0A]"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

export default function HeroInbox() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState(reduce ? 3 : 0);
  const [answered, setAnswered] = useState(() => new Set());
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);

  // Only animate while on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Phase scheduler (phase 2 → 3 is driven by TypedText finishing).
  useEffect(() => {
    if (reduce || !visible) return undefined;
    let t;
    if (phase === 0) t = setTimeout(() => setPhase(1), T_DOTS);
    else if (phase === 1) t = setTimeout(() => setPhase(2), T_TYPE);
    else if (phase === 3)
      t = setTimeout(() => {
        setScene((s) => (s + 1) % SCENES.length);
        setPhase(0);
      }, T_HOLD);
    return () => clearTimeout(t);
  }, [phase, visible, reduce]);

  useEffect(() => {
    if (phase === 3) setAnswered((prev) => new Set(prev).add(scene));
  }, [phase, scene]);

  const pick = (i) => {
    setScene(i);
    setPhase(reduce ? 3 : 0);
  };

  const s = SCENES[scene];

  return (
    <div ref={rootRef} className="relative w-full overflow-hidden rounded-[22px] bg-white text-[#0A0A0A] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_40px_100px_-30px_rgba(255,90,31,0.45),0_30px_60px_-30px_rgba(0,0,0,0.9)]">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          </span>
          <span className="text-[13px] font-semibold tracking-[-0.01em]">Unified inbox</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A0A0A] px-2.5 py-1 text-[11px] font-semibold text-white">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5A1F] opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
          </span>
          AI on · 24/7
        </span>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,210px)_minmax(0,1fr)]">
        {/* Thread list (sm+) */}
        <ul className="hidden border-r border-neutral-200 sm:block" aria-label="Conversations">
          {SCENES.map((t, i) => {
            const active = i === scene;
            const done = answered.has(i) && !(active && phase < 3);
            return (
              <li key={t.name}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  className={`relative flex w-full items-start gap-2.5 border-b border-neutral-100 px-3.5 py-3 text-left transition-colors duration-200 ${
                    active ? "bg-[#FFF1EA]" : "hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-[3px] origin-top bg-[#FF5A1F] transition-transform duration-300 ${
                      active ? "scale-y-100" : "scale-y-0"
                    }`}
                    aria-hidden
                  />
                  <ChannelIcon channel={t.ch} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] font-semibold">{t.name}</span>
                      {done ? (
                        <CheckCheck className="h-3.5 w-3.5 shrink-0 text-[#FF5A1F]" strokeWidth={2.5} />
                      ) : active ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF5A1F]" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-neutral-500">{t.guest}</span>
                  </span>
                </button>
              </li>
            );
          })}
          <li className="px-3.5 py-3 text-[11px] font-medium text-neutral-500">
            0 messages waiting
          </li>
        </ul>

        {/* Conversation */}
        <div className="flex min-w-0 flex-col">
          {/* Mobile channel switcher */}
          <div className="flex items-center gap-1.5 border-b border-neutral-200 px-3 py-2 sm:hidden">
            {SCENES.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => pick(i)}
                aria-label={`${CHANNEL_NAME[t.ch]} conversation`}
                className={`rounded-lg p-1 transition-[transform,background-color] duration-200 ${
                  i === scene ? "scale-105 bg-[#FFF1EA] ring-2 ring-[#FF5A1F]" : "opacity-60"
                }`}
              >
                <ChannelIcon channel={t.ch} size={24} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
            <ChannelIcon channel={s.ch} size={30} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold">{s.name}</p>
              <p className="truncate text-[11.5px] text-neutral-500">
                {CHANNEL_NAME[s.ch]} · {s.meta}
              </p>
            </div>
            {phase < 3 ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFF1EA] px-2.5 py-1 text-[11px] font-semibold text-[#0A0A0A]">
                <Sparkles className="h-3 w-3 text-[#FF5A1F]" /> Replying
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0A0A0A] px-2.5 py-1 text-[11px] font-semibold text-white">
                <Check className="h-3 w-3 text-[#FF5A1F]" strokeWidth={3} /> Answered
              </span>
            )}
          </div>

          <div className="relative h-[268px] overflow-hidden px-4 py-4 sm:h-[300px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={scene}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <p className="text-center text-[10.5px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  Today · {CHANNEL_NAME[s.ch]} inbox
                </p>
                <div className="max-w-[86%] rounded-2xl rounded-tl-md bg-neutral-100 px-3.5 py-2.5 text-[13px] leading-relaxed">
                  {s.guest}
                </div>

                {phase >= 1 && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="ml-auto max-w-[86%] origin-bottom-right"
                  >
                    <p className="mb-1 flex items-center justify-end gap-1.5 text-[10.5px] font-semibold text-neutral-500">
                      <span className="rounded bg-[#0A0A0A] px-1.5 py-px text-[9.5px] font-bold tracking-[0.06em] text-[#FF5A1F]">
                        AI
                      </span>
                      Botlify
                    </p>
                    <div className="rounded-2xl rounded-tr-md bg-[#FF5A1F] px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#0A0A0A]">
                      {phase === 1 ? (
                        <Dots />
                      ) : (
                        <TypedText
                          key={scene}
                          text={s.reply}
                          instant={reduce || phase === 3}
                          onDone={() => setPhase(3)}
                        />
                      )}
                    </div>
                    {phase === 3 && (
                      <motion.p
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1.5 flex items-center justify-end gap-1 text-[10.5px] font-medium text-neutral-500"
                      >
                        <CheckCheck className="h-3 w-3 text-[#FF5A1F]" strokeWidth={2.5} />
                        Sent in {s.took}
                        {s.lang ? ` · ${s.lang}` : ""}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-neutral-200 px-3 py-2.5">
            <div className="flex h-9 min-w-0 flex-1 items-center rounded-full bg-neutral-100 px-3.5 text-[12px] text-neutral-500">
              <span className="truncate">Botlify AI is handling this guest</span>
            </div>
            <span className="inline-flex h-9 shrink-0 items-center rounded-full border border-neutral-300 px-3.5 text-[12px] font-semibold">
              Take over
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
