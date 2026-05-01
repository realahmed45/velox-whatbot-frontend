import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import {
  MessageCircle,
  Instagram,
  Layers,
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Bot,
} from "lucide-react";

const CHANNELS = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    tagline: "Live in 6 minutes — official Meta Cloud API",
    icon: MessageCircle,
    color: "from-emerald-500 to-green-600",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.35)]",
    badge: "Fastest start",
    bullets: [
      "1,000 free conversations / month",
      "Auto-replies, broadcasts & AI chatbot",
      "No app review required for testing",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    tagline: "Comments, DMs, story replies — all on autopilot",
    icon: Instagram,
    color: "from-pink-500 via-fuchsia-500 to-violet-600",
    glow: "shadow-[0_0_40px_rgba(236,72,153,0.35)]",
    badge: "Pending Meta review",
    bullets: [
      "Comment-to-DM, story replies, mentions",
      "AI chatbot trained on your business",
      "Connects via secure Meta OAuth",
    ],
  },
  {
    id: "both",
    name: "Both channels",
    tagline: "Run WhatsApp & Instagram from one inbox",
    icon: Layers,
    color: "from-indigo-500 via-violet-500 to-pink-500",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.4)]",
    badge: "Full power",
    bullets: [
      "Unified inbox for every conversation",
      "One AI bot trained for both surfaces",
      "Switch dashboards anytime",
    ],
  },
];

export default function ChooseChannelPage() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace, user } = useAuthStore();

  const continueClick = async () => {
    if (!selected) return toast.error("Pick a channel to continue");
    if (!activeWorkspace) {
      toast.error("Workspace not ready yet — refresh and try again");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, {
        activeChannel: selected,
      });
      await fetchWorkspace(activeWorkspace);
      toast.success("Channel saved");
      // Route to channel-specific onboarding
      if (selected === "whatsapp") navigate("/onboarding/whatsapp");
      else if (selected === "instagram") navigate("/onboarding/instagram");
      else navigate("/onboarding/whatsapp"); // both → start with WA
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your choice");
    } finally {
      setSaving(false);
    }
  };

  const firstName = (user?.name || "").split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-brand-50/40 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-brand-200 text-xs font-bold text-brand-700 shadow-sm">
            <Sparkles className="w-3 h-3" /> Step 1 of 3
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink-900">
            Welcome, {firstName} 👋
          </h1>
          <p className="mt-3 text-ink-600 max-w-xl mx-auto text-sm sm:text-base">
            Which channel do you want Botlify to automate first? You can add the
            other one anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const active = selected === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelected(ch.id)}
                className={`group relative text-left bg-white rounded-lg p-6 border-2 transition-all duration-300 ${
                  active
                    ? "border-brand-500 shadow-glow -translate-y-1"
                    : "border-ink-100 hover:border-brand-200 hover:-translate-y-1 hover:shadow-card"
                }`}
              >
                {/* badge */}
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold text-ink-400">
                  {ch.badge}
                </span>

                <div
                  className={`w-12 h-12 rounded-md bg-gradient-to-br ${ch.color} flex items-center justify-center text-white ${active ? ch.glow : ""} transition-shadow`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-ink-900">
                  {ch.name}
                </h3>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                  {ch.tagline}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {ch.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-xs text-ink-600 flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Selected ring */}
                {active && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-glow">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          <Stat icon={Clock} label="Avg setup" value="6 min" />
          <Stat icon={Zap} label="Free DMs/mo" value="1,000" />
          <Stat icon={Bot} label="AI replies" value="Included" />
        </div>

        {/* Continue */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!selected || saving}
            onClick={continueClick}
            className="btn-primary !px-8 !py-3.5 text-base shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-ink-400">
            You can always switch or add channels later from the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-ink-100 rounded-md p-3 text-center">
      <Icon className="w-4 h-4 mx-auto text-brand-500" />
      <p className="text-base font-black text-ink-900 mt-1">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-400 font-bold">
        {label}
      </p>
    </div>
  );
}
