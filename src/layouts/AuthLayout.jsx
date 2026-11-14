import { Outlet, Link } from "react-router-dom";
import { Sparkles, Shield, Check, Zap, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import BotlifyMark from "@/components/BotlifyMark";
import { Aurora, Reveal } from "@/components/fx";

const POINTS = [
  "Syncs rooms, rates & availability across Airbnb, Booking.com & Expedia",
  "AI answers every guest inside your OTA inboxes and on WhatsApp",
  "Replies instantly, in your guest's language — 24/7",
  "Turns questions into confirmed bookings",
];

/**
 * Auth shell — warm, light canvas with a static sunset aurora. The brand
 * story sits on the left; the form sits on the right in a light card drawn
 * by each auth page.
 */
export default function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-[#FBFAF8] text-ink-950">
      <Aurora />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      {/* ── Left brand panel ───────────────────────────────────────── */}
      <div className="relative hidden w-[44%] flex-col items-center justify-center p-10 text-center lg:flex xl:w-2/5 xl:p-14">
        <Link to="/" className="group relative flex flex-col items-center gap-5">
          <span aria-hidden className="absolute top-6 h-36 w-36 rounded-full bg-sunset opacity-20 blur-3xl" />
          <BotlifyMark
            size={112}
            className="relative drop-shadow-xl transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-105"
          />
          <span className="relative inline-flex items-baseline font-display text-5xl font-bold tracking-[-0.05em] text-ink-950 xl:text-6xl">
            botlify
            <span className="ml-1 inline-block h-2.5 w-2.5 rounded-full bg-sunset" />
          </span>
        </Link>

        <div className="relative mt-10 max-w-sm">
          <Reveal delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-700 shadow-sm ring-1 ring-ink-900/[0.08]">
              <Sparkles className="h-3 w-3 text-sunset-flame" /> The AI channel manager for hotels
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.04] tracking-[-0.045em] text-ink-950 xl:text-[2.6rem]">
              AI answers your{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-ink-800">Airbnb, Booking.com</span>{" "}
              <span className="text-sunset">& WhatsApp guests.</span>
            </h1>
          </Reveal>
          <ul className="mx-auto mt-8 inline-block space-y-3 text-left">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={p} delay={0.15 + i * 0.05} y={10}>
                <span className="flex items-start gap-3 text-sm text-ink-600">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-sunset">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  <span>{p}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 flex items-center justify-center gap-5 text-[11px] text-ink-500">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-sunset-flame" /> Official OTA connections
          </span>
          <span className="h-3 w-px bg-ink-900/15" aria-hidden />
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-sunset-flame" /> Replies in seconds
          </span>
        </div>
      </div>

      {/* ── Right form panel ───────────── */}
      <div className="relative flex flex-1 items-center justify-center p-4 py-8 sm:p-10">
        <div className="relative w-full max-w-md">
          {/* mobile header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/">
              <Logo size="lg" />
            </Link>
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink-500 transition hover:bg-ink-900/[0.05] hover:text-ink-900"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" /> Home
            </Link>
          </div>

          <div className="relative">
            {/* The auth pages draw their own light card (Login, Register…),
                so this is just a positioning shell. */}
            <div className="relative text-ink-950">
              <div className="mb-2 hidden items-center justify-end lg:flex">
                <Link
                  to="/"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 transition hover:text-ink-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" /> Back home
                </Link>
              </div>
              <Outlet />
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-ink-500">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-ink-700 underline-offset-2 hover:text-ink-950 hover:underline">
              Terms
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="text-ink-700 underline-offset-2 hover:text-ink-950 hover:underline">
              Privacy
            </Link>
            .
          </p>

          <p className="mt-3 text-center text-[11px] text-ink-400">
            © {new Date().getFullYear()} Botlify. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
