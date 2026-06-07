import { Outlet, Link } from "react-router-dom";
import { Sparkles, Shield, Check, Zap, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const POINTS = [
  "AI chatbot that handles every DM",
  "Comment-to-DM, story replies & mentions",
  "Broadcasts, drips, scheduled posts",
  "Live in under 6 minutes — no code",
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-white relative overflow-hidden">
      {/* ── Left brand panel (dark + orange accents) ───────────────── */}
      <div className="hidden lg:flex w-[44%] xl:w-2/5 relative bg-ink-950 flex-col justify-center items-center text-center p-10 xl:p-14 text-white overflow-hidden">
        {/* glow + texture */}
        <div className="absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full bg-brand-500/30 blur-[120px] animate-blob" />
        <div
          className="absolute -bottom-32 -right-24 w-[22rem] h-[22rem] rounded-full bg-amber-500/20 blur-[120px] animate-blob"
          style={{ animationDelay: "5s" }}
        />
        <div className="absolute inset-0 bg-grid-dark bg-grid-48 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        {/* large centered animated logo lockup */}
        <Link
          to="/"
          className="relative flex flex-col items-center gap-4 group"
        >
          <img
            src="/logo.png"
            alt="Botlify"
            className="w-40 xl:w-48 object-contain animate-float drop-shadow-2xl transition-transform group-hover:scale-105"
          />
          <span className="text-5xl xl:text-6xl font-black tracking-tight">
            Botl<span className="text-brand-500">ify</span>
          </span>
        </Link>

        {/* copy */}
        <div className="relative mt-9 max-w-sm">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-semibold text-brand-200">
            <Sparkles className="w-3 h-3" /> All-in-one Instagram automation
          </span>
          <h1 className="mt-5 text-3xl xl:text-4xl font-black tracking-tighter leading-[1.08]">
            One platform.{" "}
            <span className="text-brand-500">Every DM, handled.</span>
          </h1>
          <ul className="mt-7 space-y-3 text-left inline-block mx-auto">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-ink-200">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-brand-400" />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* trust row */}
        <div className="relative mt-9 flex items-center justify-center gap-5 text-[11px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-400" /> Meta-approved API
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-400" /> 2,500+ creators
          </span>
        </div>
      </div>

      {/* ── Right form panel ───────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative bg-white">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link to="/">
              <Logo size="lg" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>

          <div className="bg-white border border-ink-100 rounded-2xl p-6 sm:p-8 shadow-card-lg">
            <div className="hidden lg:flex items-center justify-end mb-1">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-brand-600 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back home
              </Link>
            </div>
            <Outlet />
          </div>

          <p className="mt-5 text-center text-[11px] text-ink-400">
            By continuing you agree to our{" "}
            <Link
              to="/terms"
              className="text-ink-500 hover:text-brand-600 underline-offset-2 hover:underline"
            >
              Terms
            </Link>{" "}
            &{" "}
            <Link
              to="/privacy"
              className="text-ink-500 hover:text-brand-600 underline-offset-2 hover:underline"
            >
              Privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
