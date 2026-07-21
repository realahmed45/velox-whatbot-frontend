/**
 * Custom Flows — dedicated page for the visual flow builder list.
 * Accessible via /dashboard/flows (sidebar "Custom Flows" item).
 * Prominently introduces what flows are and lists existing ones.
 */
import { useEffect, useState } from "react";
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

export default function CustomFlowsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [installing, setInstalling] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.get("/flows"), api.get("/flows/templates")])
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

  const useTemplate = async (templateKey, name) => {
    setInstalling(templateKey);
    try {
      const { data } = await api.post("/flows/from-template", { templateKey });
      toast.success(`${name} added`);
      const first = data.flows?.[0];
      if (first?._id) navigate(`/dashboard/flow-builder/${first._id}`);
      else setFlows((f) => [...(data.flows || []), ...f]);
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
            className="rounded-2xl border border-ink-100 bg-white p-5 flex gap-3.5 hover:border-violet-200 hover:shadow-sm transition"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
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
                className="border border-ink-100 bg-white rounded-xl px-4 py-3 flex items-center gap-3 hover:border-violet-200 hover:shadow-sm transition"
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-violet-600 hover:bg-violet-50 transition"
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
                  className="text-ink-300 hover:text-violet-600 transition flex-shrink-0"
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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-black text-ink-900">
              Start from a template
            </h2>
          </div>
          <p className="text-xs text-ink-500 -mt-2 mb-4">
            Ready-made flows for common business types — add one, then customize
            it in the builder.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.key}
                className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                {t.icon && <p className="text-2xl mb-2">{t.icon}</p>}
                <p className="text-sm font-bold text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-500 leading-relaxed flex-1 mt-1">
                  {t.description}
                </p>
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
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-xs font-bold py-2 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors"
                >
                  {installing === t.key ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…
                    </>
                  ) : (
                    <>
                      Use template <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
