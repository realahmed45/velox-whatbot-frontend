/**
 * Custom Flows — dedicated page for the visual flow builder list.
 * Accessible via /dashboard/flows (sidebar "Custom Flows" item).
 * Prominently introduces what flows are and lists existing ones.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Workflow,
  Plus,
  Loader2,
  Play,
  Pause,
  Pencil,
  Trash2,
  ChevronRight,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";
import StarterGallery from "./components/StarterGallery";

export default function CustomFlowsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [installing, setInstalling] = useState(null);
  const [showStarters, setShowStarters] = useState(false);
  const [tplCat, setTplCat] = useState("All");

  const tplCategories = useMemo(
    () => ["All", ...new Set(templates.map((t) => t.category).filter(Boolean))],
    [templates],
  );
  const shownTemplates = useMemo(
    () =>
      tplCat === "All"
        ? templates
        : templates.filter((t) => t.category === tplCat),
    [templates, tplCat],
  );

  useEffect(() => {
    let alive = true;
    Promise.all([api.get("/flows"), api.get("/flows/starters")])
      .then(([flowsRes, tplRes]) => {
        if (!alive) return;
        setFlows(flowsRes.data.flows || []);
        setTemplates(tplRes.data.starters || []);
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
        name: "New flow",
        nodes: [
          {
            id: triggerId,
            type: "trigger",
            nodeType: "keyword_trigger",
            position: { x: 250, y: 80 },
            data: {
              label: "Keyword Trigger",
              keywords: [],
              matchType: "contains",
            },
          },
        ],
        edges: [],
      });
      navigate(`/dashboard/flow-builder/${data.flow._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not create flow");
    } finally {
      setCreating(false);
    }
  };

  const useTemplate = async (starterKey, name) => {
    setInstalling(starterKey);
    try {
      const { data } = await api.post("/flows/from-starter", { starterKey });
      toast.success(`"${name}" added — edit it, then hit Activate`);
      if (data.flow?._id) navigate(`/dashboard/flow-builder/${data.flow._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not add template");
    } finally {
      setInstalling(null);
    }
  };

  const toggleFlow = async (flow) => {
    const isActive = flow.status === "active";
    const nextStatus = isActive ? "draft" : "active";
    try {
      await api.put(`/flows/${flow._id}`, { status: nextStatus });
      setFlows((prev) =>
        prev.map((f) =>
          f._id === flow._id ? { ...f, status: nextStatus } : f,
        ),
      );
      toast.success(isActive ? "Flow paused" : "Flow activated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update flow");
    }
  };

  const deleteFlow = async (id) => {
    if (!window.confirm("Delete this flow?")) return;
    try {
      await api.delete(`/flows/${id}`);
      setFlows((prev) => prev.filter((f) => f._id !== id));
      toast.success("Flow deleted");
    } catch {
      toast.error("Could not delete flow");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <StatHero
        icon={Workflow}
        title="Custom Flows"
        subtitle="Visual, multi-step branching conversations"
      >
        <button
          onClick={() => setShowStarters(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 text-white font-bold text-sm px-4 py-2 hover:bg-white/25 transition"
        >
          <Sparkles className="w-4 h-4" />
          Templates
        </button>
        <button
          onClick={createFlow}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-ink-900 font-bold text-sm px-4 py-2 hover:bg-white/90 transition disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New flow
        </button>
      </StatHero>

      {/* ── What are flows ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Zap,
            title: "Trigger-based",
            desc: "Start a flow when a keyword is sent, a story is replied to, or a comment is made.",
          },
          {
            icon: Workflow,
            title: "Visual builder",
            desc: "Drag nodes, connect branches, add delays and conditions — no code needed.",
          },
          {
            icon: ArrowRight,
            title: "Multi-step",
            desc: "Send a series of messages, ask questions, collect emails, route to your team.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-ink-100 bg-white p-5 flex gap-3.5 hover:border-brand-200 hover:shadow-sm transition"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">{title}</p>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Your flows ── */}
      <section>
        <h2 className="text-base font-black text-ink-900 mb-3">Your flows</h2>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-ink-400 py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading flows…
          </div>
        ) : flows.length === 0 ? (
          <div className="border-2 border-dashed border-ink-200 rounded-xl p-10 text-center bg-ink-50/30">
            <Workflow className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-ink-700">No flows yet</p>
            <p className="text-xs text-ink-500 mt-1 max-w-xs mx-auto">
              Build a multi-step conversation or start from one of the templates
              below.
            </p>
            <button
              onClick={createFlow}
              disabled={creating}
              className="mt-4 btn btn-primary text-sm inline-flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create first flow
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {flows.map((flow) => (
              <div
                key={flow._id}
                className="border border-ink-100 bg-white rounded-xl px-4 py-3 flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${flow.status === "active" ? "bg-emerald-500" : "bg-ink-300"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">
                    {flow.name || "Untitled flow"}
                  </p>
                  <p className="text-xs text-ink-400">
                    {flow.nodes?.length || 0} nodes ·{" "}
                    {flow.status === "active" ? "Active" : "Inactive"}
                    {flow.updatedAt
                      ? ` · Updated ${new Date(flow.updatedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleFlow(flow)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    title={flow.status === "active" ? "Pause" : "Activate"}
                  >
                    {flow.status === "active" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/flow-builder/${flow._id}`)
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFlow(flow._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() =>
                    navigate(`/dashboard/flow-builder/${flow._id}`)
                  }
                  className="text-ink-300 hover:text-brand-600 transition flex-shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Templates ── */}
      {templates.length > 0 && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h2 className="text-base font-black text-ink-900">
                  Start from a template
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                  {templates.length} ready
                </span>
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Proven flows you can install in one click, then reword to match
                your business.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {tplCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setTplCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    tplCat === c
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-ink-600 border-ink-200 hover:border-brand-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shownTemplates.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => useTemplate(t.key, t.name)}
                disabled={!!installing}
                className="group text-left flex flex-col rounded-2xl border border-ink-100 bg-white p-5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400 bg-ink-50 rounded-full px-2 py-0.5">
                    {t.steps} steps
                  </span>
                </div>
                <p className="text-sm font-bold text-ink-900 mt-2.5">{t.name}</p>
                <p className="text-xs text-ink-500 leading-relaxed flex-1 mt-1">
                  {t.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:gap-1.5 transition-all">
                  {installing === t.key ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…
                    </>
                  ) : (
                    <>
                      Use this <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <StarterGallery
        open={showStarters}
        onClose={() => setShowStarters(false)}
        onInstalled={(flow) => navigate(`/dashboard/flow-builder/${flow._id}`)}
      />
    </div>
  );
}
