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
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

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
    return () => { alive = false; };
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
            data: { label: "Keyword Trigger", keywords: [], matchType: "contains" },
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
    try {
      await api.patch(`/flows/${flow._id}`, { active: !flow.active });
      setFlows((prev) => prev.map((f) => f._id === flow._id ? { ...f, active: !f.active } : f));
    } catch {
      toast.error("Could not update flow");
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
      <PageHeader
        icon={Workflow}
        title="Custom Flows"
        subtitle="Build multi-step, branching conversations with a visual drag-and-drop editor"
      >
        <button
          onClick={createFlow}
          disabled={creating}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New flow
        </button>
      </PageHeader>

      {/* ── What are flows ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: "Trigger-based", desc: "Start a flow when a keyword is sent, a story is replied to, or a comment is made." },
          { icon: Workflow, title: "Visual builder", desc: "Drag nodes, connect branches, add delays and conditions — no code needed." },
          { icon: ArrowRight, title: "Multi-step", desc: "Send a series of messages, ask questions, collect emails, route to your team." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border border-ink-100 bg-white rounded-xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">{title}</p>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{desc}</p>
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
              Build a multi-step conversation or start from one of the templates below.
            </p>
            <button onClick={createFlow} disabled={creating} className="mt-4 btn btn-primary text-sm inline-flex items-center gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${flow.active ? "bg-emerald-500" : "bg-ink-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{flow.name || "Untitled flow"}</p>
                  <p className="text-xs text-ink-400">
                    {flow.nodes?.length || 0} nodes · {flow.active ? "Active" : "Inactive"}
                    {flow.updatedAt ? ` · Updated ${new Date(flow.updatedAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleFlow(flow)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    title={flow.active ? "Pause" : "Activate"}
                  >
                    {flow.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/flow-builder/${flow._id}`)}
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
                  onClick={() => navigate(`/dashboard/flow-builder/${flow._id}`)}
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
          <h2 className="text-base font-black text-ink-900 mb-3">Start from a template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => useTemplate(t.key, t.name)}
                disabled={installing === t.key}
                className="group text-left border border-ink-100 bg-white rounded-xl p-4 hover:border-violet-300 hover:shadow-md transition"
              >
                <p className="text-sm font-bold text-ink-900 mb-1">{t.name}</p>
                <p className="text-xs text-ink-500 leading-relaxed flex-1">{t.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-700 group-hover:text-violet-900">
                  {installing === t.key ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Adding…</>
                  ) : (
                    <>Use template <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
