import { Outlet, Link } from "react-router-dom";
import { Instagram, Zap, Users, BarChart2, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

const FEATURES = [
  { icon: Zap,       text: "12 automation triggers" },
  { icon: Sparkles,  text: "AI conversational bot" },
  { icon: Users,     text: "Team inbox & assignment" },
  { icon: BarChart2, text: "Advanced analytics" },
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 relative bg-ink-950 flex-col items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-dark-mesh" />
        <div className="relative max-w-md text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-glow">
              <Instagram className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">Botlify</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight">
            Turn every DM into a lead.
          </h1>
          <p className="text-ink-300 text-base">
            The complete Instagram automation suite. Comments, stories, DMs, lives — all handled 24/7.
          </p>
          <div className="mt-8 space-y-2.5 text-sm text-left">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <Icon className="w-4 h-4 text-brand-300" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/"><Logo size="md" /></Link>
            <Link to="/" className="text-xs text-ink-400 hover:text-ink-700">← Home</Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}