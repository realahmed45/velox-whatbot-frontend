/**
 * Botlify FX — the interactive primitives of the 2026 design system.
 *
 * Every page reaches for these instead of hand-rolling motion, so the whole
 * product moves with one personality: springy, light, never in the way.
 * All of them degrade to static under prefers-reduced-motion.
 *
 *   <Aurora />            drifting sunset blobs behind a surface (fixed or absolute)
 *   <Spotlight>           any box gets a cursor-following glow
 *   <Magnetic>            child leans toward the pointer (CTAs, icon buttons)
 *   <Tilt>                3-D tilt toward the pointer (hero cards, mockups)
 *   <Reveal>              fade + blur-up when scrolled into view (stagger via delay)
 *   <NumberTicker>        counts up to a value when visible
 *   <SlidingTabs>         segmented control with a springy sliding pill
 *   <Marquee>             infinite, edge-faded, pause-on-hover strip
 *   <CursorAura>          custom cursor (dot + lagging ring) for marketing pages
 *   <ShimmerText>         a light sweep across a word
 *   <PulseDot>            live-status dot with a soft ping
 */
import {
  Children,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const cx = (...a) => a.filter(Boolean).join(" ");

// ── Aurora ────────────────────────────────────────────────────────────────
export function Aurora({ className = "", variant = "light", fixed = false }) {
  const dark = variant === "dark";
  const o = dark ? 1 : 0.55;
  return (
    <div
      aria-hidden
      className={cx(
        fixed ? "fixed" : "absolute",
        "inset-0 -z-10 overflow-hidden pointer-events-none",
        className,
      )}
    >
      <div
        className="absolute -top-[20%] -left-[10%] h-[60vmax] w-[60vmax] rounded-full blur-[110px] animate-drift-a"
        style={{ background: "radial-gradient(circle, #FFB547 0%, transparent 65%)", opacity: 0.55 * o }}
      />
      <div
        className="absolute top-[10%] -right-[15%] h-[55vmax] w-[55vmax] rounded-full blur-[120px] animate-drift-b"
        style={{ background: "radial-gradient(circle, #7C5CFF 0%, transparent 65%)", opacity: 0.5 * o }}
      />
      <div
        className="absolute -bottom-[25%] left-[20%] h-[55vmax] w-[55vmax] rounded-full blur-[120px] animate-drift-c"
        style={{ background: "radial-gradient(circle, #FF3D77 0%, transparent 65%)", opacity: 0.45 * o }}
      />
    </div>
  );
}

// ── Spotlight ─────────────────────────────────────────────────────────────
export function Spotlight({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag ref={ref} onPointerMove={onMove} className={cx("spotlight", className)} {...rest}>
      {children}
    </Tag>
  );
}

// ── Magnetic ──────────────────────────────────────────────────────────────
export function Magnetic({ children, strength = 0.35, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y, display: "inline-flex" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}

// ── Tilt ──────────────────────────────────────────────────────────────────
export function Tilt({ children, max = 8, className = "", glare = true }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 160, damping: 18 });
  const gx = useTransform(px, [0, 1], ["0%", "100%"]);
  const gy = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBg = useTransform(
    [gx, gy],
    ([a, b]) => `radial-gradient(500px circle at ${a} ${b}, rgba(255,255,255,0.35), transparent 50%)`,
  );
  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };
  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={cx("relative will-change-transform", className)}
    >
      {children}
      {glare && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

// ── Reveal ────────────────────────────────────────────────────────────────
export function Reveal({ children, delay = 0, y = 24, className = "", as = "div", once = true }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduce) return <M className={className}>{children}</M>;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  );
}

/** Stagger direct children with Reveal. */
export function RevealGroup({ children, step = 0.07, className = "", y = 20 }) {
  return (
    <div className={className}>
      {Children.map(children, (c, i) => (
        <Reveal delay={i * step} y={y}>
          {c}
        </Reveal>
      ))}
    </div>
  );
}

// ── NumberTicker ──────────────────────────────────────────────────────────
export function NumberTicker({ value = 0, duration = 1.4, prefix = "", suffix = "", decimals = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) {
      setShown(value);
      return;
    }
    const controls = animate(0, Number(value) || 0, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);
  const text = Number(shown).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className={cx("tabular-nums", className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

// ── SlidingTabs ───────────────────────────────────────────────────────────
/**
 * items: [{ value, label, icon? }]. Controlled via value/onChange.
 * `dark` switches to the night palette.
 */
export function SlidingTabs({ items, value, onChange, dark = false, className = "", size = "md" }) {
  const id = useRef(`st-${Math.random().toString(36).slice(2, 8)}`).current;
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <div
      role="tablist"
      className={cx(
        "relative inline-flex items-center gap-1 rounded-2xl p-1",
        dark
          ? "bg-white/[0.06] ring-1 ring-white/10"
          : "bg-ink-900/[0.04] ring-1 ring-ink-900/[0.06]",
        className,
      )}
    >
      {items.map((it) => {
        const active = it.value === value;
        const Icon = it.icon;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(it.value)}
            className={cx(
              "relative z-10 inline-flex items-center gap-1.5 rounded-xl font-medium transition-colors",
              pad,
              active
                ? dark
                  ? "text-white"
                  : "text-ink-900"
                : dark
                  ? "text-white/55 hover:text-white"
                  : "text-ink-500 hover:text-ink-800",
            )}
          >
            {active && (
              <motion.span
                layoutId={id}
                className={cx(
                  "absolute inset-0 -z-10 rounded-xl",
                  dark
                    ? "bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    : "bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_#fff]",
                )}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {Icon && <Icon className="h-4 w-4" />}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────
export function Marquee({ children, speed = 32, className = "", reverse = false }) {
  return (
    <div className={cx("relative overflow-hidden mask-fade-x", className)}>
      <div
        className="marquee gap-10"
        style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── CursorAura ────────────────────────────────────────────────────────────
/**
 * A custom cursor: a crisp dot plus a lagging ring that swells over anything
 * clickable and shows a label from data-cursor="View". Desktop pointers only.
 */
export function CursorAura() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState("");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target.closest?.("a,button,[role=button],[data-cursor],input,textarea,select,label");
      setHover(!!t);
      setLabel(t?.getAttribute?.("data-cursor") || "");
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.classList.add("cursor-aura");
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("cursor-aura");
    };
  }, [reduce, x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 mix-blend-difference"
        style={{ x: rx, y: ry }}
        animate={{
          width: label ? 76 : hover ? 46 : 30,
          height: label ? 76 : hover ? 46 : 30,
          backgroundColor: label ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        {label && <span className="text-[11px] font-semibold uppercase tracking-wider text-black">{label}</span>}
      </motion.div>
    </>
  );
}

// ── ShimmerText ───────────────────────────────────────────────────────────
export function ShimmerText({ children, className = "" }) {
  return <span className={cx("text-gradient-animated", className)}>{children}</span>;
}

// ── PulseDot ──────────────────────────────────────────────────────────────
export function PulseDot({ color = "bg-emerald-500", className = "" }) {
  return (
    <span className={cx("relative inline-flex h-2 w-2", className)}>
      <span className={cx("absolute inset-0 rounded-full animate-ping-soft", color)} />
      <span className={cx("relative inline-flex h-2 w-2 rounded-full", color)} />
    </span>
  );
}
