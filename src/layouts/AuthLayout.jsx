import { Outlet, Link } from "react-router-dom";
import { Sparkles, Shield, Check, Zap, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import BotlifyMark from "@/components/BotlifyMark";
import { Aurora, Reveal } from "@/components/fx";

const POINTS = [
  "Booking.com, Airbnb & Expedia — every booking in one calendar",
  "WhatsApp & Instagram in one inbox",
  "Auto-books guests and answers them like a human",
  "Airport transfers for your guests",
];

/**
 * Auth shell — dark cinematic canvas (night + aurora + grain). The brand
 * story sits on the left; the form floats on the right in a pane of light
 * liquid glass so every form control keeps full contrast.
 */
export default function AuthLayout() {
  return (
    <div className="grain relative isolate flex min-h-screen overflow-hidden bg-night-950 text-white">
      <Aurora variant="dark" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid-dark opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      {/* ── Left brand panel ───────────────────────────────────────── */}
      <div className="relative hidden w-[44%] flex-col items-center justify-center p-10 text-center lg:flex xl:w-2/5 xl:p-14">
        {/* large centered animated logo lockup */}
        <Link to="/" className="group relative flex flex-col items-center gap-5">
          <span aria-hidden className="absolute top-6 h-36 w-36 rounded-full bg-sunset opacity-30 blur-3xl animate-glow-pulse" />
          <BotlifyMark
            size={120}
            glow
            className="relative animate-float drop-shadow-2xl transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-105"
          />
          <span className="relative inline-flex items-baseline font-display text-5xl font-bold tracking-[-0.05em] xl:text-6xl">
            botlify
            <span className="ml-1 inline-block h-2.5 w-2.5 rounded-full bg-sunset shadow-[0_0_14px_rgba(255,61,119,0.8)]" />
          </span>
        </Link>

        {/* copy */}
        <div className="relative mt-10 max-w-sm">
          <Reveal delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 backdrop-blur">
              <Sparkles className="h-3 w-3 text-sunset-gold" /> Every channel, one place
            </span>
          </Reveal>
          <Reveal delay={0.12}>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.02] tracking-[-0.045em] xl:text-[2.6rem]">
              One place.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-white/85">Every</span>{" "}
              <span className="text-sunset">booking channel.</span>
            </h1>
          </Reveal>
          <ul className="mx-auto mt-8 inline-block space-y-3 text-left">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={p} delay={0.2 + i * 0.06} y={12}>
                <span className="flex items-start gap-3 text-sm text-white/65">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-sunset shadow-[0_4px_12px_-4px_rgba(255,61,119,0.7)]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  <span>{p}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* trust row */}
        <div className="relative mt-10 flex items-center justify-center gap-5 text-[11px] text-white/45">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-sunset-gold" /> Meta-approved API
          </span>
          <span className="h-3 w-px bg-white/15" aria-hidden />
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-sunset-gold" /> Replies in seconds
          </span>
        </div>
      </div>

      {/* ── Right form panel ───────────── */}
      <div className="relative flex flex-1 items-center justify-center p-4 py-8 sm:p-10">
        <div className="relative w-full max-w-md">
          {/* mobile header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/">
              <Logo size="lg" dark />
            </Link>
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" /> Home
            </Link>
          </div>

          <div className="relative animate-rise-in">
            {/* sunset halo bleeding out from behind the glass */}
            <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-sunset opacity-[0.18] blur-3xl" />
            {/* The auth pages draw their own dark glass card (Login, Register…),
                so this is just a positioning shell on the night canvas. */}
            <div className="relative text-white">
              <div className="mb-2 hidden items-center justify-end lg:flex">
                <Link
                  to="/"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" /> Back home
                </Link>
              </div>
              <Outlet />
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/45">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-white/70 underline-offset-2 hover:text-white hover:underline">
              Terms
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="text-white/70 underline-offset-2 hover:text-white hover:underline">
              Privacy
            </Link>
            .
          </p>

          <p className="mt-3 text-center text-[11px] text-white/30">
            © {new Date().getFullYear()} Botlify. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
