/**
 * Botlify brand UI kit for Train / Test your AI and Settings.
 * Orange #FF5A1F, black #0A0A0A, white, Geist. Plain Tailwind class strings
 * plus two tiny components (Segmented, Switch) — no blur, transform/opacity
 * motion only (see DESIGN_SYSTEM.md performance rules).
 */
import { motion } from "framer-motion";

export const ORANGE = "#FF5A1F";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5A1F]/25";

export const btnPrimary = `inline-flex select-none items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 min-h-[44px] text-[14px] font-semibold text-[#0A0A0A] shadow-[0_2px_0_0_#0A0A0A] transition-[transform,background-color,box-shadow] duration-150 hover:-translate-y-px hover:bg-[#FF6B33] hover:shadow-[0_3px_0_0_#0A0A0A] active:translate-y-[2px] active:shadow-[0_0_0_0_#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#FF5A1F] disabled:hover:shadow-[0_2px_0_0_#0A0A0A] ${focusRing}`;

export const btnDark = `inline-flex select-none items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 min-h-[44px] text-[14px] font-semibold text-white transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnSecondary = `inline-flex select-none items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 min-h-[44px] text-[14px] font-semibold text-[#0A0A0A] transition-[background-color,border-color,transform] duration-150 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnGhost = `inline-flex select-none items-center justify-center gap-1.5 rounded-xl px-3 min-h-[40px] text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const iconBtn = `grid h-10 w-10 shrink-0 place-items-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-[#0A0A0A] ${focusRing}`;

export const iconBtnDanger = `grid h-10 w-10 shrink-0 place-items-center rounded-xl text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600 ${focusRing}`;

export const field =
  "block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] placeholder:text-neutral-400 transition-[border-color,box-shadow] duration-150 hover:border-neutral-300 focus:border-[#FF5A1F] focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]/15 disabled:opacity-60";

export const fieldError = "!border-rose-400 focus:!ring-rose-500/15";

export const labelCls = "block text-[13px] font-medium text-neutral-700";
export const hintCls = "text-[12px] text-neutral-500";

export const panel = "rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)]";

export const mustHavePill =
  "inline-flex items-center rounded-full bg-[#FF5A1F]/10 px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]";

export const softPill =
  "inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600";

export const pageTitle = "text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] text-[#0A0A0A]";

/** Segmented control — black pill slides under the active option. */
export function Segmented({ items, value, onChange, id = "seg", className = "" }) {
  return (
    <div
      role="tablist"
      className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-neutral-100 p-1 no-scrollbar ${className}`}
    >
      {items.map((it) => {
        const active = it.value === value;
        const Icon = it.icon;
        return (
          <button
            key={it.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={`relative inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-[14px] font-semibold transition-colors ${focusRing} ${
              active ? "text-white" : "text-neutral-500 hover:text-[#0A0A0A]"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-xl bg-[#0A0A0A] shadow-[0_4px_12px_-6px_rgba(10,10,10,0.5)]"
              />
            )}
            {Icon && <Icon className={`relative h-4 w-4 ${active ? "text-[#FF5A1F]" : ""}`} strokeWidth={2} />}
            <span className="relative inline-flex items-center gap-1.5">{it.label}</span>
            {it.dot && (
              <span aria-label="Needs attention" className="relative h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Accessible on/off switch. */
export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${focusRing} ${
        checked ? "bg-[#FF5A1F]" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(10,10,10,0.3)] transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/** Thin progress bar (orange on neutral). */
export function Progress({ value, className = "", tone = "orange" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 ${className}`}>
      <motion.div
        className={`h-full origin-left rounded-full ${tone === "green" ? "bg-emerald-500" : "bg-[#FF5A1F]"}`}
        initial={false}
        animate={{ scaleX: pct / 100 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
