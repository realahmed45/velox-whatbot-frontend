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
  Sparkles,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";
import StarterGallery from "./components/StarterGallery";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, PulseDot, Reveal, SlidingTabs, Spotlight } from "@/components/fx";

const iconBtn =
  "group/ib w-10 h-10 sm:w-9 sm:h-9 rounded-xl grid place-items-center text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-90";

export default function CustomFlowsPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
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
    const ok = await confirm({
      title: "Delete this flow?",
      description: "This flow will be permanently deleted.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/flows/${id}`);
      setFlows((prev) => prev.filter((f) => f._id !== id));
      toast.success("Flow deleted");
    } catch {
      toast.error("Could not delete flow");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 max-w-5xl mx-auto space-y-8">
      <StatHero
        icon={Workflow}
        title="Custom Flows"
        subtitle="Automated, multi-step DM conversations"
        help={{
          title: "Custom Flows",
          tips: [
            "A flow is a visual, multi-step DM conversation you build by connecting blocks.",
            "Start from a ready-made template, or hit New flow for a blank canvas.",
            "Every flow begins with a trigger (a keyword or comment) that starts the conversation.",
            "Edit and reword any step to match your business before going live.",
            "A flow only runs once you activate it; drafts stay paused.",
          ],
        }}
        stats={[
          { label: "Active", value: flows.filter((f) => f.status === "active").length, accent: true },
          { label: "Total flows", value: flows.length },
          { label: "Templates", value: templates.length },
        ]}
      >
        <button
          onClick={() => setShowStarters(true)}
          className="btn-glass-dark group/t text-sm px-3 sm:px-4 py-2"
        >
          <Sparkles className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/t:rotate-[-12deg] group-hover/t:scale-110" />
          <span className="hidden sm:inline">Templates</span>
        </button>
        <Magnetic strength={0.25}>
          <button
            onClick={createFlow}
            disabled={creating}
            className="btn-primary group/n text-sm px-3 sm:px-4 py-2 disabled:opacity-60"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/n:rotate-90" />
            )}
            New flow
          </button>
        </Magnetic>
      </StatHero>

      {/* ── Your flows ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">Your flows</h2>
          {flows.length > 0 && (
            <span className="text-xs text-ink-500 tabular-nums">
              {flows.filter((f) => f.status === "active").length} active ·{" "}
              {flows.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="card divide-y divide-ink-900/[0.06]" aria-busy="true">
            <span className="sr-only">Loading flows…</span>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-2 h-2 rounded-full bg-ink-900/[0.08] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 max-w-full rounded-md bg-ink-900/[0.06] animate-pulse" />
                  <div className="h-3 w-56 max-w-full rounded-md bg-ink-900/[0.06] animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-xl bg-ink-900/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        ) : flows.length === 0 ? (
          <Reveal className="card p-10 text-center">
            <div className="relative mx-auto w-14 h-14 mb-4">
              <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
              <div className="relative w-14 h-14 rounded-2xl bg-sunset-soft text-sunset-flame grid place-items-center animate-float">
                <Workflow className="w-7 h-7" strokeWidth={1.8} />
              </div>
            </div>
            <p className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">No flows yet</p>
            <p className="text-sm text-ink-500 mt-1 max-w-xs mx-auto">
              Build a multi-step conversation or start from one of the templates
              below.
            </p>
            <button
              onClick={createFlow}
              disabled={creating}
              className="mt-5 btn btn-primary group/c text-sm inline-flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/c:rotate-90" />
              )}
              Create first flow
            </button>
          </Reveal>
        ) : (
          <div className="card divide-y divide-ink-900/[0.06] overflow-hidden">
            <AnimatePresence initial={false}>
            {flows.map((flow, i) => (
              <motion.div
                key={flow._id}
                layout
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: Math.min(i, 8) * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ opacity: 0, x: -16, transition: { duration: 0.25 } }}
                className="group px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 transition-colors hover:bg-white/80"
              >
                {flow.status === "active" ? (
                  <PulseDot color="bg-emerald-500" className="flex-shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-ink-300" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">
                    {flow.name || "Untitled flow"}
                  </p>
                  <p className="text-xs text-ink-500 truncate">
                    {flow.nodes?.length || 0} nodes ·{" "}
                    {flow.status === "active" ? "Active" : "Inactive"}
                    {flow.updatedAt
                      ? ` · Updated ${new Date(flow.updatedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleFlow(flow)}
                    className={`${iconBtn} hover:text-emerald-600 hover:bg-emerald-50`}
                    title={flow.status === "active" ? "Pause" : "Activate"}
                  >
                    {flow.status === "active" ? (
                      <Pause className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/ib:scale-110" />
                    ) : (
                      <Play className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/ib:scale-110 group-hover/ib:translate-x-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/flow-builder/${flow._id}`)
                    }
                    className={`${iconBtn} hover:text-sunset-flame hover:bg-sunset-soft`}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/ib:rotate-[-12deg]" />
                  </button>
                  <button
                    onClick={() => deleteFlow(flow._id)}
                    className={`${iconBtn} hover:text-rose-600 hover:bg-rose-50`}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/ib:rotate-[-12deg]" />
                  </button>
                </div>
                <button
                  onClick={() =>
                    navigate(`/dashboard/flow-builder/${flow._id}`)
                  }
                  className="hidden sm:grid w-8 h-8 place-items-center text-ink-300 hover:text-sunset-flame transition-colors flex-shrink-0"
                  aria-label="Open flow"
                >
                  <ChevronRight className="w-5 h-5 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />
                </button>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Templates ── */}
      {templates.length > 0 && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
                  Start from a{" "}
                  <span className="font-serif italic font-normal">template</span>
                </h2>
                <span className="badge-brand text-[10px] uppercase tracking-wide tabular-nums">
                  {templates.length} ready
                </span>
              </div>
              <p className="text-[13px] text-ink-500 mt-1">
                Proven flows you can install in one click, then reword to match
                your business.
              </p>
            </div>
            <div className="max-w-full overflow-x-auto no-scrollbar">
              <SlidingTabs
                size="sm"
                className="whitespace-nowrap"
                value={tplCat}
                onChange={setTplCat}
                items={tplCategories.map((c) => ({ value: c, label: c }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shownTemplates.map((t, i) => (
              <Reveal key={t.key} delay={Math.min(i, 9) * 0.05} className="h-full">
              <Spotlight
                as="button"
                type="button"
                onClick={() => useTemplate(t.key, t.name)}
                disabled={!!installing}
                className="card-hover group w-full h-full text-left flex flex-col p-5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="w-11 h-11 rounded-xl bg-sunset-soft grid place-items-center text-2xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">{t.icon}</span>
                  <span className="badge-gray text-[10px] uppercase tracking-wide tabular-nums">
                    {t.steps} steps
                  </span>
                </div>
                <p className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900 mt-3">{t.name}</p>
                <p className="text-[13px] text-ink-500 leading-relaxed flex-1 mt-1">
                  {t.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sunset-flame">
                  {installing === t.key ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…
                    </>
                  ) : (
                    <>
                      Use this <ChevronRight className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </Spotlight>
              </Reveal>
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
