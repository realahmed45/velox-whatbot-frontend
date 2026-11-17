import { motion, useReducedMotion } from "framer-motion";
import OtaLogo from "@/components/OtaLogo";
import { WhatsAppMark } from "@/components/ChannelMarks";

/* ─────────────────────────────────────────────────────────────────────────
 * Landing primitives — orange / black / white.
 *  Orange #FF5A1F always carries BLACK text (6.3:1, AA). Orange text is only
 *  used on black, or on white at display sizes.
 * ──────────────────────────────────────────────────────────────────────── */
export const EASE = [0.16, 1, 0.3, 1];
export const WRAP = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const BTN_BASE =
  "group inline-flex h-12 select-none items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold tracking-[-0.01em] transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2";

/** Orange, black text — the one primary action. */
export const BTN_ORANGE = `${BTN_BASE} bg-[#FF5A1F] text-[#0A0A0A] shadow-[0_10px_30px_-10px_rgba(255,90,31,0.7)] hover:bg-[#FF6B33] hover:shadow-[0_16px_40px_-12px_rgba(255,90,31,0.85)] focus-visible:ring-offset-[#0A0A0A]`;
/** Black on light surfaces. */
export const BTN_BLACK = `${BTN_BASE} bg-[#0A0A0A] text-white hover:bg-[#262626] shadow-[0_10px_30px_-12px_rgba(10,10,10,0.6)]`;
/** Outline on dark surfaces — fills white on hover. */
export const BTN_GHOST_DARK = `${BTN_BASE} border border-white/25 text-white hover:border-white hover:bg-white hover:text-[#0A0A0A] focus-visible:ring-offset-[#0A0A0A]`;
/** Outline on light / orange surfaces — fills black on hover. */
export const BTN_GHOST_LIGHT = `${BTN_BASE} border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white`;

/** Fade + rise once on scroll. Opacity/transform only. */
/**  `inner`: classes for an inner element — use it for anything with a CSS
 *  hover transform, since framer owns the outer element's transform. */
export function Reveal({ children, delay = 0, y = 18, className = "", inner, as = "div" }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  if (inner) children = <div className={`h-full ${inner}`}>{children}</div>;
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Small uppercase label with an orange square. */
export function Eyebrow({ children, dark = false, className = "" }) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] ${
        dark ? "text-white/70" : "text-[#0A0A0A]/70"
      } ${className}`}
    >
      <span className="h-2 w-2 rounded-[2px] bg-[#FF5A1F]" aria-hidden />
      {children}
    </p>
  );
}

export function SectionTitle({ children, dark = false, className = "" }) {
  return (
    <h2
      className={`text-balance text-[36px] font-semibold leading-[1] tracking-[-0.045em] sm:text-[52px] lg:text-[64px] ${
        dark ? "text-white" : "text-[#0A0A0A]"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

/** Orange hand-drawn-ish marker under a word (static SVG). */
export function Marker({ children, className = "" }) {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 300 20"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.08em] left-0 z-0 h-[0.32em] w-full text-[#FF5A1F]"
      >
        <path d="M2 14 C 70 4, 160 4, 298 10" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

export const CHANNEL_NAME = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  expedia: "Expedia",
  trip: "Trip.com",
  whatsapp: "WhatsApp",
};

/** OTA tile or the WhatsApp tile, same footprint. */
export function ChannelIcon({ channel, size = 24 }) {
  if (channel === "whatsapp") {
    return (
      <span
        className="grid shrink-0 place-items-center bg-[#25D366] text-white"
        style={{ width: size, height: size, borderRadius: size * 0.23 }}
        aria-label="WhatsApp"
        role="img"
      >
        <WhatsAppMark className="h-[62%] w-[62%]" />
      </span>
    );
  }
  return <OtaLogo channelKey={channel} size={size} />;
}
