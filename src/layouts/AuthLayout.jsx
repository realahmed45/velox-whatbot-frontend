import { Outlet, Link } from "react-router-dom";
import {
  Instagram,
  Zap,
  Users,
  BarChart2,
  Sparkles,
  Shield,
  Check,
} from "lucide-react";
import Logo from "@/components/Logo";

const FEATURES = [
  { icon: Zap, text: "14 automation triggers" },
  { icon: Sparkles, text: "AI conversational bot" },
  { icon: Users, text: "Team inbox & assignment" },
  { icon: BarChart2, text: "Advanced analytics" },
];

const TESTIMONIAL = {
  quote:
    "Botlify replaced ManyChat for half the price and twice the polish. My DMs convert 3× now.",
  name: "Aisha Khan",
  role: "Beauty creator · 280k",
};

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-ink-50 relative overflow-hidden">
      {/* ── Left decorative panel (cinematic) ───────────────── */}
      <div className="hidden lg:flex w-1/2 relative bg-ink-950 flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-dark" />
        <div className="absolute inset-0 bg-grid-dark bg-grid-48 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-brand-500/30 blur-[120px] animate-blob" />
        <div
          className="absolute -bottom-32 -right-32 w-[24rem] h-[24rem] rounded-full bg-pink-500/30 blur-[120px] animate-blob"
          style={{ animationDelay: "5s" }}
        />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-gradient rounded-lg flex items-center justify-center shadow-neon-violet animate-glow-pulse">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">Botlify</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs font-semibold text-brand-200">
            <Sparkles className="w-3 h-3" /> Trusted by 2,500+ creators
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tighter leading-[1.05]">
            Turn every DM into{" "}
            <span className="text-gradient-animated">a paying customer.</span>
          </h1>
          <p className="mt-5 text-ink-300 text-base leading-relaxed">
            The complete Instagram automation suite. Comments, stories, DMs,
            lives — handled 24/7 in your voice.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-2.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="glass-dark rounded-md px-3.5 py-2.5 flex items-center gap-2.5"
              >
                <Icon className="w-4 h-4 text-brand-300 flex-shrink-0" />
                <span className="text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-dark rounded-lg p-5 hover:-translate-y-1 transition-all duration-500">
            <div className="flex items-center gap-1 text-amber-300 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.367 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.65 8.354c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              "{TESTIMONIAL.quote}"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                {TESTIMONIAL.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")}
              </div>
              <div>
                <p className="text-xs font-bold">{TESTIMONIAL.name}</p>
                <p className="text-[10px] text-ink-400">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-4 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Meta-approved
            API
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> SOC2 compliant
          </span>
        </div>
      </div>

      {/* ── Right form panel (glass card on mesh) ───────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative bg-mesh-light">
        <div className="absolute inset-0 bg-grid-light bg-grid-48 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-brand-300/30 blur-3xl animate-blob pointer-events-none" />
        <div
          className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-pink-300/30 blur-3xl animate-blob pointer-events-none"
          style={{ animationDelay: "5s" }}
        />

        <div className="relative w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <Link to="/" className="text-xs text-ink-400 hover:text-ink-700">
              ← Home
            </Link>
          </div>
          <div className="glass-strong rounded-lg p-7 sm:p-9 shadow-glow-lg">
            <div className="hidden lg:flex items-center justify-end mb-2">
              <Link
                to="/"
                className="text-xs text-ink-400 hover:text-ink-700 transition"
              >
                ← Back home
              </Link>
            </div>
            <Outlet />
          </div>
          <p className="mt-5 text-center text-[11px] text-ink-400">
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
