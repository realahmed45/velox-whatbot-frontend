import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Plus,
  Save,
  ArrowLeft,
  Play,
  Pause,
  Workflow,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import NodePalette from "./components/NodePalette";
import NodeConfigPanel from "./components/NodeConfigPanel";
import FlowListSidebar from "./components/FlowListSidebar";
import FlowHelpPanel from "./components/FlowHelpPanel";
import StarterGallery from "./components/StarterGallery";
import { NODE_TYPES_MAP, NODE_LABELS, nodeCategory } from "./nodeTypes";
import EmptyState from "@/components/ui/EmptyState";
import { AnimatePresence, motion } from "framer-motion";

// Sunset edge colour (flame stop) — solid so smoothstep segments that are
// perfectly vertical/horizontal never lose their stroke.
const EDGE = "#FF6A2B";
const toolBtn =
  "btn-secondary group/tb text-xs gap-1 px-2.5 sm:px-3 py-1.5 shrink-0";
const toolIcon =
  "w-3.5 h-3.5 transition-transform duration-500 ease-spring";

let nodeIdCounter = 1;
const getId = () => `node_${Date.now()}_${nodeIdCounter++}`;

// Sensible starting config per node type so new nodes are valid immediately.
const defaultData = (nodeType) => {
  const base = { label: NODE_LABELS[nodeType] || nodeType };
  switch (nodeType) {
    case "keyword_trigger":
      return { ...base, keywords: [], matchType: "contains" };
    case "send_text":
      return { ...base, message: "" };
    case "delay":
      return { ...base, delaySeconds: 3 };
    case "condition":
      return { ...base, conditionOperator: "equals" };
    default:
      return base;
  }
};

function FlowBuilderInner() {
  const { flowId } = useParams();
  const { activeWorkspace } = useAuthStore();
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();

  const [flows, setFlows] = useState([]);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [flowName, setFlowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false);
  // Palette lives in a real sidebar (not a ReactFlow Panel) so drag-and-drop
  // reaches the canvas. Open by default — it's the main way to build.
  const [showPalette, setShowPalette] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showStarters, setShowStarters] = useState(false);
  const reactFlowWrapper = useRef(null);

  useEffect(() => {
    loadFlows();
  }, [activeWorkspace]);
  useEffect(() => {
    if (flowId) loadFlow(flowId);
    else {
      setCurrentFlow(null);
      setNodes([]);
      setEdges([]);
    }
  }, [flowId]);

  const loadFlows = async () => {
    try {
      const { data } = await api.get("/flows");
      setFlows(data.flows || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFlow = async (id) => {
    try {
      const { data } = await api.get(`/flows/${id}`);
      const flow = data.flow;
      setCurrentFlow(flow);
      setFlowName(flow.name || "");
      setNodes(
        (flow.nodes || []).map((n) => ({
          id: n.id,
          type: n.nodeType,
          position: n.position || { x: 100, y: 100 },
          data: { ...n.data },
        })),
      );
      setEdges(flow.edges || []);
      setSelectedNode(null);
    } catch (err) {
      toast.error("Failed to load flow");
    }
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "smoothstep",
          animated: true,
          style: { stroke: EDGE, strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE },
        },
        eds,
      ),
    );
  }, []);

  // Consistent look for edges loaded from the server too.
  const defaultEdgeOptions = {
    type: "smoothstep",
    animated: true,
    style: { stroke: EDGE, strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE },
  };

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const addNodeAt = useCallback(
    (nodeType, position) => {
      const newNode = {
        id: getId(),
        type: nodeType,
        position,
        data: defaultData(nodeType),
      };
      setNodes((ns) => [...ns, newNode]);
      setSelectedNode(newNode);
    },
    [setNodes],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("nodeType");
      if (!nodeType) return;
      // screenToFlowPosition accounts for pan/zoom — drops land where you expect.
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNodeAt(nodeType, position);
    },
    [screenToFlowPosition, addNodeAt],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Click-to-add drops the node near the centre of the visible canvas.
  const addNodeCentered = useCallback(
    (nodeType) => {
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const center = bounds
        ? screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          })
        : { x: 200, y: 200 };
      // Slight scatter so stacked clicks don't overlap perfectly.
      addNodeAt(nodeType, {
        x: center.x + (Math.random() * 60 - 30),
        y: center.y + (Math.random() * 60 - 30),
      });
    },
    [screenToFlowPosition, addNodeAt],
  );

  const updateNodeData = (nodeId, updates) => {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n,
      ),
    );
    if (selectedNode?.id === nodeId)
      setSelectedNode((s) => ({ ...s, data: { ...s.data, ...updates } }));
  };

  const deleteNode = (nodeId) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) =>
      es.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
    setSelectedNode(null);
  };

  const createNewFlow = async () => {
    try {
      // Seed with a keyword trigger so the canvas is never empty/confusing.
      const triggerId = getId();
      const { data } = await api.post("/flows", {
        name: "New Flow",
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
      setFlows((f) => [data.flow, ...f]);
      navigate(`/dashboard/flow-builder/${data.flow._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create flow");
    }
  };

  const saveFlow = async () => {
    if (!currentFlow) return;
    setSaving(true);
    try {
      const payload = {
        name: flowName?.trim() || "Untitled Flow",
        nodes: nodes.map((n) => ({
          id: n.id,
          type: nodeCategory(n.type),
          nodeType: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || undefined,
          targetHandle: e.targetHandle || undefined,
          label: e.label || undefined,
        })),
      };
      const { data } = await api.put(`/flows/${currentFlow._id}`, payload);
      setCurrentFlow(data.flow);
      setFlows((fs) =>
        fs.map((f) => (f._id === data.flow._id ? data.flow : f)),
      );
      toast.success("Flow saved");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!currentFlow) return;
    // Persist the latest canvas before activating so we never run a stale flow.
    // If that save fails, stop — activating would publish stale nodes.
    if (currentFlow.status !== "active") {
      const saved = await saveFlow();
      if (!saved) return;
    }
    try {
      const newStatus = currentFlow.status === "active" ? "draft" : "active";
      await api.put(`/flows/${currentFlow._id}`, { status: newStatus });
      setCurrentFlow((f) => ({ ...f, status: newStatus }));
      setFlows((fs) =>
        fs.map((f) =>
          f._id === currentFlow._id ? { ...f, status: newStatus } : f,
        ),
      );
      toast.success(
        newStatus === "active"
          ? "Flow is live — it now runs on incoming DMs"
          : "Flow deactivated",
      );
    } catch (err) {
      // Surface the server's specific reason (e.g. which node is unreachable)
      // instead of a generic failure the user can't act on.
      toast.error(
        err.response?.data?.message ||
          "Couldn't activate this flow — check that your trigger is connected.",
        { duration: 6000 },
      );
    }
  };

  const hasTrigger = nodes.some(
    (n) => n.type === "keyword_trigger" || n.type === "any_message_trigger",
  );

  return (
    <div className="relative flex h-full">
      <FlowListSidebar
        flows={flows}
        currentFlowId={currentFlow?._id}
        onSelect={(id) => navigate(`/dashboard/flow-builder/${id}`)}
        onNew={createNewFlow}
      />

      <div className="flex-1 flex flex-col relative" ref={reactFlowWrapper}>
        {currentFlow ? (
          <>
            <div className="min-h-[3rem] py-1.5 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/70 shadow-[0_1px_0_rgba(15,23,42,0.05)] flex flex-wrap items-center justify-between px-2 sm:px-4 gap-x-3 gap-y-1.5 z-10">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <button
                  onClick={() => navigate("/dashboard/automation")}
                  className="btn-ghost group/back p-1.5 flex-shrink-0"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/back:-translate-x-0.5" />
                </button>
                <input
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="font-display font-semibold tracking-[-0.01em] text-ink-900 text-sm bg-transparent border-0 rounded-lg px-2 py-1 min-w-0 w-full max-w-[220px] ring-1 ring-transparent hover:bg-white/60 focus:ring-sunset-flame/40 focus:bg-white focus:outline-none focus:shadow-[0_0_0_4px_rgba(255,106,43,0.12)] transition-all"
                  placeholder="Flow name"
                />
                <span
                  className={`badge flex-shrink-0 inline-flex items-center gap-1.5 ${currentFlow.status === "active" ? "badge-green" : "badge-gray"}`}
                >
                  {currentFlow.status === "active" && (
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping-soft" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  {currentFlow.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 max-w-full overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setShowStarters(true)}
                  className={toolBtn}
                  title="Start from a ready-made template"
                >
                  <Sparkles className={`${toolIcon} group-hover/tb:rotate-[-12deg] group-hover/tb:scale-110`} />
                  <span className="hidden lg:inline">Templates</span>
                </button>
                <button
                  onClick={() => {
                    setShowHelp((v) => !v);
                    setSelectedNode(null);
                  }}
                  className={`${toolBtn} ${showHelp ? "!ring-sunset-flame/40 !text-ink-900" : ""}`}
                  title="How to build a flow"
                >
                  <HelpCircle className={`${toolIcon} group-hover/tb:rotate-[-12deg]`} />
                  <span className="hidden lg:inline">Help</span>
                </button>
                <button
                  onClick={() => setShowPalette(!showPalette)}
                  className={toolBtn}
                >
                  <Plus className={`${toolIcon} ${showPalette ? "rotate-45" : ""} group-hover/tb:scale-110`} />
                  <span className="hidden sm:inline">{showPalette ? "Hide nodes" : "Add Node"}</span>
                </button>
                <button
                  onClick={toggleActive}
                  disabled={!hasTrigger && currentFlow.status !== "active"}
                  title={
                    !hasTrigger
                      ? "Add a trigger node before activating"
                      : undefined
                  }
                  className={`btn group/tb text-xs gap-1 px-2.5 sm:px-3 py-1.5 shrink-0 disabled:opacity-50 ${currentFlow.status === "active" ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 hover:-translate-y-0.5" : "btn-secondary"}`}
                >
                  {currentFlow.status === "active" ? (
                    <>
                      <Pause className={`${toolIcon} group-hover/tb:scale-110`} /> Deactivate
                    </>
                  ) : (
                    <>
                      <Play className={`${toolIcon} group-hover/tb:translate-x-0.5 group-hover/tb:scale-110`} /> Activate
                    </>
                  )}
                </button>
                <button
                  onClick={saveFlow}
                  className="btn-primary group/tb text-xs gap-1 px-3 py-1.5 shrink-0"
                  disabled={saving}
                >
                  <Save className={`${toolIcon} group-hover/tb:-translate-y-0.5`} />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
            {!hasTrigger && (
              <motion.div
                key="no-trigger"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-2 bg-amber-50/80 backdrop-blur border-b border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
                  <Workflow className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Add a <b>Trigger</b> node (Add Node → Triggers) so this flow knows
                    when to run.
                  </span>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Palette is a real sidebar (NOT a ReactFlow Panel) — a Panel sits
                on top of the canvas and swallows the drop, which is why
                drag-and-drop used to do nothing. */}
            <div className="relative flex-1 min-h-0 flex">
              {showPalette && (
                <NodePalette
                  onClose={() => setShowPalette(false)}
                  onAdd={addNodeCentered}
                />
              )}

              <div
                className="flex-1 min-w-0 relative"
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={NODE_TYPES_MAP}
                  defaultEdgeOptions={defaultEdgeOptions}
                  connectionLineStyle={{ stroke: EDGE, strokeWidth: 2.5 }}
                  fitView
                  fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
                  proOptions={{ hideAttribution: true }}
                  className="!bg-[#F7F5F2]/60"
                >
                  <Background
                    color="#d9d3cc"
                    gap={22}
                    size={1.5}
                    variant="dots"
                  />
                  <Controls
                    showInteractive={false}
                    className="!bg-white/70 !backdrop-blur-xl !border !border-white/80 !rounded-xl overflow-hidden !shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_10px_24px_-12px_rgba(15,23,42,0.25)]"
                  />
                  <MiniMap
                    pannable
                    zoomable
                    className="!hidden sm:!block !bg-white/70 !backdrop-blur-xl !rounded-2xl !border !border-white/80 overflow-hidden !shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_10px_24px_-12px_rgba(15,23,42,0.25)]"
                    nodeColor="#FF6A2B"
                    maskColor="rgba(247,245,242,0.6)"
                  />
                </ReactFlow>

                {/* First-run hint when the canvas has only the trigger */}
                <AnimatePresence>
                {nodes.length <= 1 && (
                  <motion.div
                    key="first-run"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, scale: 0.97, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className="glass-strong pointer-events-auto text-center max-w-xs rounded-3xl p-5"
                    >
                      <div className="relative mx-auto w-12 h-12 mb-3">
                        <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-25 blur-2xl" />
                        <div className="relative w-12 h-12 rounded-2xl bg-sunset-soft text-sunset-flame grid place-items-center animate-float">
                          <Workflow className="w-6 h-6" strokeWidth={1.8} />
                        </div>
                      </div>
                      <p className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-[15px]">
                        Add your first step
                      </p>
                      <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                        Drag a node from the left (or click it), then connect it
                        to your trigger.
                      </p>
                      <button
                        onClick={() => setShowStarters(true)}
                        className="btn-primary group/tpl mt-4 text-xs px-3 py-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/tpl:rotate-[-12deg]" /> Or use a template
                      </button>
                    </motion.div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <EmptyState
              className="max-w-lg w-full"
              icon={Workflow}
              title="Select or create a flow"
              description="Build automated Instagram DM conversations with a visual drag-and-drop editor. Start from a ready-made template, or build from scratch."
              action={
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setShowStarters(true)}
                    className="btn-primary group/b gap-2"
                  >
                    <Sparkles className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/b:rotate-[-12deg]" />
                    Browse templates
                  </button>
                  <button onClick={createNewFlow} className="btn-secondary group/n gap-2">
                    <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/n:rotate-90" />
                    Blank flow
                  </button>
                </div>
              }
            />
          </div>
        )}
      </div>

      {/* Right rail: node config takes precedence over help */}
      {selectedNode ? (
        <NodeConfigPanel
          node={selectedNode}
          onChange={(updates) => updateNodeData(selectedNode.id, updates)}
          onDelete={() => deleteNode(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      ) : (
        <FlowHelpPanel
          open={showHelp}
          onClose={() => setShowHelp(false)}
          onOpenTemplates={() => setShowStarters(true)}
        />
      )}

      <StarterGallery
        open={showStarters}
        onClose={() => setShowStarters(false)}
        onInstalled={(flow) => {
          setFlows((fs) => [flow, ...fs]);
          navigate(`/dashboard/flow-builder/${flow._id}`);
        }}
      />
    </div>
  );
}

export default function FlowBuilderPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
