import { Outlet, Link } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import Logo from "@/components/Logo";
import OtaLogo from "@/components/OtaLogo";
import { WhatsAppMark } from "@/components/ChannelMarks";

/* ─────────────────────────────────────────────────────────────────────────
 * Shared auth styling tokens — imported by Login / Register / Forgot /
 * Reset / Verify so every auth screen draws the exact same controls.
 * Orange / black / white: crisp 1px fields with an orange focus ring and an
 * orange primary button with BLACK text (AA) that presses down on click.
 * ──────────────────────────────────────────────────────────────────────── */
export const AUTH_FIELD =
  "block w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-[15px] text-[#0A0A0A] placeholder:text-neutral-400 transition-[border-color,box-shadow] duration-150 hover:border-neutral-400 focus:border-[#FF5A1F] focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]/20 disabled:opacity-60";
export const AUTH_LABEL = "mb-1.5 block text-[13px] font-semibold text-[#0A0A0A]";
export const AUTH_BTN =
  "group inline-flex h-12 w-full select-none items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-[15px] font-semibold text-[#0A0A0A] shadow-[0_3px_0_0_#0A0A0A] transition-[transform,background-color,box-shadow] duration-150 hover:-translate-y-px hover:bg-[#FF6B33] hover:shadow-[0_4px_0_0_#0A0A0A] active:translate-y-[3px] active:shadow-[0_0_0_0_#0A0A0A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5A1F]/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
export const AUTH_TITLE =
  "text-[32px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0A0A0A] sm:text-[40px]";
export const AUTH_SUB = "mt-3 text-[15px] leading-relaxed text-neutral-600";
export const AUTH_LINK =
  "font-semibold text-[#0A0A0A] underline decoration-[#FF5A1F] decoration-2 underline-offset-4 transition-colors hover:text-[#E84A12]";
export const AUTH_EYE =
  "absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-[#FFF1EA] hover:text-[#0A0A0A]";
/** Orange full stop used at the end of every auth title. */
export const AUTH_DOT = "text-[#FF5A1F]";
/** Icon tile above a title (forgot / reset / verify). */
export const AUTH_ICON =
  "mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F]";

export function AuthDivider({ children = "or" }) {
  return (
    <div className="relative flex items-center gap-3 py-1" role="separator">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-neutral-500">{children}</span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

const POINTS = [
  "Rooms, rates & availability synced across Airbnb, Booking.com, Expedia & Trip.com",
  "AI answers inside every booking-site inbox and on WhatsApp, 24/7",
  "0% commission on OTA bookings · live in about 10 minutes",
];

/** Product vignette for the black panel — one answered thread. Static. */
function PanelMockup() {
  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-[22px] bg-white text-[#0A0A0A] shadow-[0_40px_80px_-30px_rgba(255,90,31,0.5)]">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
        <OtaLogo channelKey="airbnb" size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">Maya Fischer</p>
          <p className="truncate text-[11.5px] text-neutral-500">Airbnb · Deluxe Ocean · Fri – Sun</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0A0A0A] px-2.5 py-1 text-[11px] font-semibold text-white">
          <Check className="h-3 w-3 text-[#FF5A1F]" strokeWidth={3} /> Answered
        </span>
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-neutral-100 px-3.5 py-2.5 text-[13px] leading-relaxed">
          Hi! We land at 11am — any chance of an early check-in?
        </div>
        <div className="ml-auto max-w-[85%]">
          <p className="mb-1 flex items-center justify-end gap-1.5 text-[10.5px] font-semibold text-neutral-500">
            <span className="rounded bg-[#0A0A0A] px-1.5 py-px text-[9.5px] font-bold tracking-[0.06em] text-[#FF5A1F]">AI</span>
            Botlify
          </p>
          <div className="rounded-2xl rounded-tr-md bg-[#FF5A1F] px-3.5 py-2.5 text-[13px] font-medium leading-relaxed">
            Hi Maya! Your room is free that morning, so early check-in from 12pm is on us. See you Friday.
          </div>
          <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] font-medium text-neutral-500">
            <CheckCheck className="h-3 w-3 text-[#FF5A1F]" strokeWidth={2.5} /> Sent in 6s
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Auth shell — split screen. Form on white (left); from lg up a black brand
 * panel with a big white headline, an orange accent and a product vignette.
 * Nothing animates in the shell: it paints once and stays still.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-white font-geist text-[#0A0A0A] antialiased selection:bg-[#FF5A1F] selection:text-[#0A0A0A]">
      {/* ── Form column ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Botlify home">
            <Logo size="sm" />
          </Link>
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-600 ring-1 ring-neutral-200 transition-colors hover:text-[#0A0A0A] hover:ring-[#0A0A0A]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Home
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </main>

        <div className="flex flex-col items-center justify-between gap-2 text-center text-[12px] text-neutral-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Botlify</p>
          <p>
            By continuing you agree to our{" "}
            <Link to="/terms" className="font-medium text-[#0A0A0A] hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-medium text-[#0A0A0A] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* ── Brand panel (lg+) ─────────────────────────────────────── */}
      <aside className="relative m-3 hidden w-[48%] max-w-[760px] flex-col overflow-hidden rounded-[28px] bg-[#0A0A0A] text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full [background:radial-gradient(closest-side,rgba(255,90,31,0.35),transparent)]"
        />
        <div className="relative flex flex-1 flex-col justify-center px-12 py-14 xl:px-16">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3.5 text-[12.5px] text-white/75">
            <span className="rounded-full bg-[#FF5A1F] px-2 py-0.5 text-[10.5px] font-bold tracking-[0.06em] text-[#0A0A0A]">
              AI
            </span>
            The channel manager for hotels
          </p>
          <h2 className="mt-7 max-w-lg text-[48px] font-semibold leading-[0.95] tracking-[-0.05em] xl:text-[60px]">
            Every calendar in sync. <span className="text-[#FF5A1F]">Every guest answered.</span>
          </h2>
          <ul className="mt-8 max-w-md space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-white/70">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FF5A1F]">
                  <Check className="h-3 w-3 text-[#0A0A0A]" strokeWidth={3.5} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <PanelMockup />
          </div>

          <div className="mt-10 flex items-center gap-3 text-[12.5px] text-white/55">
            <span>Works with</span>
            <span className="flex items-center gap-2">
              <OtaLogo channelKey="airbnb" size={24} />
              <OtaLogo channelKey="booking" size={24} />
              <OtaLogo channelKey="expedia" size={24} />
              <OtaLogo channelKey="trip" size={24} />
              <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-[#25D366] text-white">
                <WhatsAppMark className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
