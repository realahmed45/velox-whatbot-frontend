import { Outlet, Link } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import BotlifyMark from "@/components/BotlifyMark";
import OtaLogo from "@/components/OtaLogo";
import { WhatsAppMark } from "@/components/ChannelMarks";

/* ─────────────────────────────────────────────────────────────────────────
 * Shared auth styling tokens — imported by Login / Register / Forgot /
 * Reset / Verify so every auth screen draws the exact same controls.
 * Calm, crisp, ink-first: 1px borders, ink focus ring, one dark button.
 * ──────────────────────────────────────────────────────────────────────── */
export const AUTH_FIELD =
  "block w-full h-11 rounded-lg border border-ink-200 bg-white px-3.5 text-[14px] text-ink-950 placeholder:text-ink-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-150 hover:border-ink-300 focus:border-ink-900 focus:outline-none focus:ring-4 focus:ring-ink-900/[0.07] disabled:opacity-60";
export const AUTH_LABEL = "mb-1.5 block text-[13px] font-medium text-ink-800";
export const AUTH_BTN =
  "group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-950 px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(2,6,23,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const AUTH_TITLE = "text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink-950 sm:text-[28px]";
export const AUTH_SUB = "mt-2 text-[14px] leading-relaxed text-ink-500";
export const AUTH_LINK = "font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 transition-colors hover:decoration-ink-950";
export const AUTH_EYE =
  "absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900";

export function AuthDivider({ children = "or" }) {
  return (
    <div className="relative flex items-center gap-3 py-1" role="separator">
      <span className="h-px flex-1 bg-ink-200" />
      <span className="text-[12px] text-ink-400">{children}</span>
      <span className="h-px flex-1 bg-ink-200" />
    </div>
  );
}

const POINTS = [
  "Rooms, rates & availability synced across Airbnb, Booking.com & Expedia",
  "AI replies inside every OTA inbox and on WhatsApp, 24/7",
  "0% commission on OTA bookings · set up in about 10 minutes",
];

/** Calm product vignette for the brand panel — a single answered thread. */
function PanelMockup() {
  return (
    <div className="w-full max-w-[420px] rounded-xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
        <OtaLogo channelKey="airbnb" size={28} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink-950">Maya Fischer</p>
          <p className="truncate text-[11.5px] text-ink-500">Airbnb · Deluxe Ocean · Fri – Sun</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Answered
        </span>
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-800">
          Hi! We land at 11am — any chance of an early check-in?
        </div>
        <div className="ml-auto max-w-[85%]">
          <div className="rounded-2xl rounded-tr-md bg-ink-950 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
            Hi Maya! Your room is free that morning, so I've noted early check-in from 12pm at no charge. See you Friday.
          </div>
          <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-400">
            <Sparkles className="h-3 w-3 text-sunset-flame" /> Botlify AI · 8 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Auth shell — split layout. The form lives on a clean white column; a calm
 * brand panel with a product vignette sits on the right from lg up.
 * No animated backgrounds, no blur: it paints once and stays still.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-white font-geist text-ink-950 antialiased">
      {/* ── Form column ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Botlify home">
            <Logo size="sm" />
          </Link>
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-ink-500 transition-colors hover:text-ink-950"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Home
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </main>

        <div className="flex flex-col items-center justify-between gap-2 text-[12px] text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Botlify</p>
          <p>
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-ink-600 hover:text-ink-950">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-ink-600 hover:text-ink-950">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* ── Brand panel ───────────────────────────────────────────── */}
      <aside className="relative hidden w-[46%] max-w-[720px] flex-col overflow-hidden border-l border-ink-200/80 bg-[#F7F7F5] lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        />
        <div className="relative flex flex-1 flex-col justify-center px-12 py-14 xl:px-16">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-ink-500">
            <BotlifyMark size={18} />
            The AI channel manager for hotels
          </div>
          <h2 className="mt-5 max-w-md text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 xl:text-[38px]">
            Every calendar in sync. Every guest answered.
          </h2>
          <ul className="mt-7 max-w-md space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-600">
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-950" strokeWidth={2.5} />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <PanelMockup />
          </div>

          <div className="mt-10 flex items-center gap-3 text-[12px] text-ink-500">
            <span>Works with</span>
            <span className="flex items-center gap-2">
              <OtaLogo channelKey="booking" size={22} />
              <OtaLogo channelKey="airbnb" size={22} />
              <OtaLogo channelKey="expedia" size={22} />
              <span className="grid h-[22px] w-[22px] place-items-center rounded-[6px] bg-[#25D366] text-white">
                <WhatsAppMark className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
