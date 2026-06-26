/**
 * Automations hub — ManyChat-style gallery for quick automations,
 * custom flows, and template packs.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Workflow,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { id: "popular", label: "Popular", subtitle: "Start here — high impact, easy setup" },
  {
    id: "engagement",
    label: "Engagement",
    subtitle: "Stories, live, and social triggers",
  },
  {
    id: "settings",
    label: "Routing & hours",
    subtitle: "Fallbacks, links, and availability",
  },
];

function GalleryCard({ tab, plan, onOpen }) {
  const Icon = tab.icon;
  const locked = tab.plan !== "starter" && plan === "starter";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left border border-ink-100 bg-white p-4 hover:border-violet-300 hover:shadow-md transition flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 bg-violet-100 text-violet-700 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition">
          <Icon className="w-5 h-5" />
        </div>
        {locked && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5">
            Pro
          </span>
        )}
      </div>
      <p className="font-bold text-sm text-ink-900">{tab.label}</p>
      <p className="text-xs text-ink-500 mt-1 flex-1 leading-relaxed">
        {tab.desc}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-700 group-hover:text-violet-900">
        Set up <ChevronRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

export default function AutomationsHubGallery({ tabs, onOpenTab, plan }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get("/flows/templates")
      .then((res) => {
        if (!alive) return;
        setTemplates(res.data.templates || []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const useTemplate = async (templateKey, name) => {
    setInstalling(templateKey);
    try {
      const { data } = await api.post("/flows/from-template", { templateKey });
      toast.success(`${name} added to your account`);
      const first = data.flows?.[0];
      if (first?._id) navigate(`/dashboard/flow-builder/${first._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not add template");
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="space-y-10">
      {CATEGORIES.map((cat) => {
        const items = tabs.filter((t) => t.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id}>
            <div className="mb-4">
              <h2 className="text-base font-black text-ink-900">{cat.label}</h2>
              <p className="text-xs text-ink-500 mt-0.5">{cat.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((t) => (
                <GalleryCard
                  key={t.id}
                  tab={t}
                  plan={plan}
                  onOpen={() => onOpenTab(t.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* ── Custom Flows link ── */}
      <section id="flows">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-base font-black text-ink-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-violet-600" />
              Custom Flows
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Build visual multi-step conversations with branches, delays, and conditions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/flows")}
            className="btn btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Open Flow Builder
          </button>
        </div>

        <div
          className="border border-dashed border-violet-200 bg-violet-50/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:bg-violet-50 transition"
          onClick={() => navigate("/dashboard/flows")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/dashboard/flows")}
        >
          <div className="w-12 h-12 bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <Workflow className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-ink-900">Design powerful automations</p>
            <p className="text-xs text-ink-500 mt-1 max-w-md">
              Drag-and-drop builder for complex flows — welcome sequences, lead nurturing,
              product recommendations, and more.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 shrink-0">
            Open builder <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </section>

      {/* Templates */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-black text-ink-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Template gallery
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Ready-made automations for common business types — add in one click.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.slice(0, 9).map((t) => (
            <div
              key={t.key}
              className="border border-ink-100 bg-gradient-to-br from-white to-violet-50/30 p-4 flex flex-col"
            >
              <p className="text-2xl mb-2">{t.icon}</p>
              <p className="font-bold text-sm text-ink-900">{t.name}</p>
              <p className="text-xs text-ink-500 mt-1 flex-1">{t.description}</p>
              {t.keyFlows?.length > 0 && (
                <p className="text-[10px] text-ink-400 mt-2">
                  Includes: {t.keyFlows.slice(0, 2).join(", ")}
                  {t.keyFlows.length > 2 ? "…" : ""}
                </p>
              )}
              <button
                type="button"
                onClick={() => useTemplate(t.key, t.name)}
                disabled={installing === t.key}
                className="mt-3 btn btn-outline text-xs w-full justify-center"
              >
                {installing === t.key ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Use template"
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
