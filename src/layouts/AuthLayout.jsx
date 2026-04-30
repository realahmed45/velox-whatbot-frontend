import { Outlet, Link } from "react-router-dom";
import { Bot, Sparkles, Shield, Check, Zap } from "lucide-react";
import Logo from "@/components/Logo";

const POINTS = [
  "AI chatbot that handles every DM",
  "Comment-to-DM, story replies & mentions",
  "Broadcasts, drips, scheduled posts",
  "Live in under 6 minutes — no code",
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-ink-50 relative overflow-hidden">
      {/* ── Left panel (slim, professional) ───────────────── */}
      <div className="hidden lg:flex w-[44%] xl:w-2/5 relative bg-ink-950 flex-col justify-between p-10 xl:p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-dark" />
        <div className="absolute inset-0 bg-grid-dark bg-grid-48 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute -top-32 -left-32 w-[24rem] h-[24rem] rounded-full bg-brand-500/25 blur-[120px] animate-blob" />
        <div
          className="absolute -bottom-32 -right-32 w-[20rem] h-[20rem] rounded-full bg-pink-500/25 blur-[120px] animate-blob"
          style={{ animationDelay: "5s" }}
        />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-gradient rounded-md flex items-center justify-center shadow-neon-violet">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Botlify</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass-dark text-[11px] font-semibold text-brand-200">
            <Sparkles className="w-3 h-3" /> All-in-one Instagram automation
          </span>
          <h1 className="mt-5 text-4xl xl:text-5xl font-black tracking-tighter leading-[1.05]">
            One platform.{" "}
            <span className="text-gradient-animated">Every DM, handled.</span>
          </h1>
          <ul className="mt-6 space-y-2.5">
            {POINTS.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2.5 text-sm text-ink-200"
              >
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-4 text-[11px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Meta-approved
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> 2,500+ creators
          </span>
        </div>
      </div>

      {/* ── Right form panel ───────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative bg-mesh-light">
        <div className="absolute inset-0 bg-grid-light bg-grid-48 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-brand-300/20 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <Link to="/" className="text-xs text-ink-400 hover:text-ink-700">
              ← Home
            </Link>
          </div>
          <div className="bg-white border border-ink-100 rounded-lg p-6 sm:p-8 shadow-card">
            <div className="hidden lg:flex items-center justify-end mb-1">
              <Link
                to="/"
                className="text-xs text-ink-400 hover:text-ink-700 transition"
              >
                ← Back home
              </Link>
            </div>
            <Outlet />
          </div>
          <p className="mt-4 text-center text-[11px] text-ink-400">
            By continuing you agree to our{" "}
            <Link
              to="/terms"
              className="hover:text-ink-700 underline-offset-2 hover:underline"
            >
              Terms
            </Link>{" "}
            &{" "}
            <Link
              to="/privacy"
              className="hover:text-ink-700 underline-offset-2 hover:underline"
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
