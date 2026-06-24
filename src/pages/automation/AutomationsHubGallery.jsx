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
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

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
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showAllFlows, setShowAllFlows] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get("/flows"),
      api.get("/flows/templates"),
    ])
      .then(([flowsRes, tplRes]) => {
        if (!alive) return;
        setFlows(flowsRes.data.flows || []);
        setTemplates(tplRes.data.templates || []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const createFlow = async () => {
    setCreating(true);
    try {
      const triggerId = `node_${Date.now()}`;
      const { data } = await api.post("/flows", {
        name: "New automation",
        nodes: [
          {
            id: triggerId,
            type: "trigger",
            nodeType: "keyword_trigger",
            position: { x: 250, y: 80 },
            data: { label: "Keyword Trigger", keywords: [], matchType: "contains" },
          },
        ],
        edges: [],
      });
      navigate(`/dashboard/flow-builder/${data.flow._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not create automation");
    } finally {
      setCreating(false);
    }
  };

  const useTemplate = async (templateKey, name) => {
    setInstalling(templateKey);
    try {
      const { data } = await api.post("/flows/from-template", { templateKey });
      toast.success(`${name} added to your account`);
      const first = data.flows?.[0];
      if (first?._id) navigate(`/dashboard/flow-builder/${first._id}`);
      else setFlows((f) => [...(data.flows || []), ...f]);
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

      {/* Custom flows */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-base font-black text-ink-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-violet-600" />
              Custom automations
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Visual flows with branches, delays, and conditions.
            </p>
          </div>
          <button
            type="button"
            onClick={createFlow}
            disabled={creating}
            className="btn btn-primary text-xs inline-flex items-center gap-1.5"
          >
            {creating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            New flow
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-ink-400 py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : flows.length === 0 ? (
          <div className="border border-dashed border-ink-200 bg-ink-50/50 p-8 text-center">
            <p className="text-sm font-semibold text-ink-700">No custom flows yet</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              Build multi-step conversations or start from a template below.
            </p>
            <button
              type="button"
              onClick={createFlow}
              className="mt-4 btn btn-outline text-xs"
            >
              Create your first flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllFlows ? flows : flows.slice(0, 6)).map((f) => (
              <button
                key={f._id}
                type="button"
                onClick={() => navigate(`/dashboard/flow-builder/${f._id}`)}
                className="text-left border border-ink-100 bg-white p-4 hover:border-violet-300 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-ink-900 truncate">
                    {f.name}
                  </p>
                  <span
                    className={clsx(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 border",
                      f.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-ink-50 text-ink-500 border-ink-200",
                    )}
                  >
                    {f.status === "active" ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-ink-500 mt-2 line-clamp-2">
                  {f.description || "Open in the flow builder to edit."}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-700">
                  Open builder <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        )}
        {flows.length > 6 && !showAllFlows && (
          <button
            type="button"
            onClick={() => setShowAllFlows(true)}
            className="mt-3 text-xs font-bold text-violet-700 hover:underline"
          >
            View all {flows.length} flows
          </button>
        )}
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
