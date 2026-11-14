import { clsx } from "clsx";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { Spotlight, NumberTicker } from "@/components/fx";

/**
 * StatHero — compact page header shared across the dashboard so every page
 * reads as one system. A slab of night liquid glass with a slow sunset glow
 * bleeding in, white type, optional inline stat pills (numbers count up) and
 * a right-side actions slot. Pages pass dark-styled action buttons into it,
 * so it stays a dark surface on the light canvas.
 *
 * Props:
 *  - title (string|node)   required
 *  - subtitle (string)     optional supporting line
 *  - icon (lucide comp)    optional badge icon
 *  - eyebrow (string)      optional small uppercase label above title
 *  - stats ([{label,value,accent?}])  optional inline stat pills
 *  - help ({title, tips[], footer})   optional contextual-help popover
 *  - children              optional action buttons (right side)
 */
function StatValue({ value }) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return <NumberTicker value={value} decimals={Number.isInteger(value) ? 0 : 1} />;
  }
  return value;
}

export default function StatHero({
  title,
  subtitle,
  icon: Icon,
  eyebrow,
  stats,
  help,
  children,
  className,
}) {
  return (
    <Spotlight
      className={clsx(
        "group relative z-10 mb-6 rounded-3xl bg-night-900 px-5 py-4 text-white ring-1 ring-white/[0.06] shadow-[0_24px_50px_-28px_rgba(6,5,10,0.65)] sm:px-6 sm:py-5",
        className,
      )}
    >
      {/* sunset glow + dot texture, clipped to the slab (the popover must not be) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-sunset-flame/25 blur-[70px] animate-drift-a" />
        <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-sunset-violet/25 blur-[70px] animate-drift-b" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 [mask-image:linear-gradient(90deg,transparent,black)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        {/* left: icon + title */}
        <div className="flex min-w-0 items-center gap-3.5">
          {Icon && (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.7)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-sunset-gold/90">
                {eyebrow}
              </span>
            )}
            <h1 className="truncate font-display text-lg font-semibold leading-tight tracking-[-0.03em] sm:text-xl">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 max-w-md truncate text-[13px] text-white/55">{subtitle}</p>}
          </div>
        </div>

        {/* right: inline stats + actions */}
        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          {stats?.length > 0 && (
            <div className="hidden items-center gap-5 pr-1 md:flex">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-5">
                  {i > 0 && <span aria-hidden className="h-7 w-px bg-white/10" />}
                  <div className="text-right leading-none">
                    <p
                      className={clsx(
                        "font-display text-lg font-semibold tabular-nums tracking-[-0.02em]",
                        s.accent ? "text-sunset" : "text-white",
                      )}
                    >
                      <StatValue value={s.value} />
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/45">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(children || help) && (
            <div className="flex shrink-0 items-center gap-2">
              {children}
              {help && <HeroHelp {...help} />}
            </div>
          )}
        </div>
      </div>

      {/* stats collapse to a compact scrollable row on small screens */}
      {stats?.length > 0 && (
        <div className="relative mt-3 flex gap-2 overflow-x-auto no-scrollbar md:hidden">
          {stats.map((s) => (
            <div
              key={s.label}
              className="shrink-0 rounded-xl bg-white/[0.07] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-inset ring-white/10"
            >
              <span className={clsx("text-sm font-semibold tabular-nums", s.accent ? "text-sunset" : "text-white")}>
                <StatValue value={s.value} />
              </span>{" "}
              <span className="text-[10px] text-white/50">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </Spotlight>
  );
}

/* Contextual-help popover styled for the dark hero. */
function HeroHelp({ title = "How this works", tips = [], footer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-glass-dark group gap-1.5 rounded-xl px-2.5 py-1.5 text-xs"
        aria-label="Help"
      >
        <HelpCircle className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:rotate-[-12deg] group-hover:scale-110" />
        <span className="hidden sm:inline">Help</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, scale: 0.96, y: -4, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "top right" }}
            className="glass-strong absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl p-4 text-left sm:w-80"
          >
            <div className="mb-2.5 flex items-start justify-between gap-3">
              <p className="font-display text-sm font-semibold tracking-[-0.01em] text-ink-900">{title}</p>
              <button
                onClick={() => setOpen(false)}
                className="group -mr-1.5 -mt-1 grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-700"
                aria-label="Close"
              >
                <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
              </button>
            </div>
            <ul className="space-y-2">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-ink-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            {footer && (
              <div className="mt-3 border-t border-ink-900/[0.06] pt-3 text-[12px] text-ink-500">{footer}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
