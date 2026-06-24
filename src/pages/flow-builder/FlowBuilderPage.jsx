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
  Panel,
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
} from "lucide-react";
import NodePalette from "./components/NodePalette";
import NodeConfigPanel from "./components/NodeConfigPanel";
import FlowListSidebar from "./components/FlowListSidebar";
import { NODE_TYPES_MAP, NODE_LABELS, nodeCategory } from "./nodeTypes";
import EmptyState from "@/components/ui/EmptyState";

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
  const [showPalette, setShowPalette] = useState(false);
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
        { ...params, animated: true, style: { stroke: "#16a34a" } },
        eds,
      ),
    );
  }, []);

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!currentFlow) return;
    // Persist the latest canvas before activating so we never run a stale flow.
    if (currentFlow.status !== "active") await saveFlow();
    try {
      const newStatus = currentFlow.status === "active" ? "draft" : "active";
      const { data } = await api.put(`/flows/${currentFlow._id}`, {
        status: newStatus,
      });
      setCurrentFlow((f) => ({ ...f, status: newStatus }));
      setFlows((fs) =>
        fs.map((f) => (f._id === currentFlow._id ? { ...f, status: newStatus } : f)),
      );
      toast.success(
        newStatus === "active"
          ? "Flow is live — it now runs on incoming DMs"
          : "Flow deactivated",
      );
    } catch (err) {
      toast.error("Failed to toggle flow");
    }
  };

  const hasTrigger = nodes.some(
    (n) => n.type === "keyword_trigger" || n.type === "any_message_trigger",
  );

  return (
    <div className="flex h-full">
      <FlowListSidebar
        flows={flows}
        currentFlowId={currentFlow?._id}
        onSelect={(id) => navigate(`/dashboard/flow-builder/${id}`)}
        onNew={createNewFlow}
      />

      <div className="flex-1 flex flex-col relative" ref={reactFlowWrapper}>
        {currentFlow ? (
          <>
            <div className="h-12 bg-white border-b border-ink-100 flex items-center justify-between px-4 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => navigate("/dashboard/automation")}
                  className="btn-ghost p-1.5 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <input
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="font-semibold text-ink-800 text-sm bg-transparent border-0 focus:ring-0 focus:outline-none focus:bg-ink-50 rounded px-1.5 py-0.5 min-w-0 max-w-[220px]"
                  placeholder="Flow name"
                />
                <span
                  className={`badge flex-shrink-0 ${currentFlow.status === "active" ? "badge-green" : "badge-gray"}`}
                >
                  {currentFlow.status}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowPalette(!showPalette)}
                  className="btn-secondary text-xs gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Node
                </button>
                <button
                  onClick={toggleActive}
                  disabled={!hasTrigger && currentFlow.status !== "active"}
                  title={
                    !hasTrigger
                      ? "Add a trigger node before activating"
                      : undefined
                  }
                  className={`btn text-xs gap-1 disabled:opacity-50 ${currentFlow.status === "active" ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100" : "btn-secondary"}`}
                >
                  {currentFlow.status === "active" ? (
                    <>
                      <Pause className="w-3 h-3" /> Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Activate
                    </>
                  )}
                </button>
                <button
                  onClick={saveFlow}
                  className="btn-primary text-xs gap-1"
                  disabled={saving}
                >
                  <Save className="w-3 h-3" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            {!hasTrigger && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 flex items-center gap-2">
                <Workflow className="w-3.5 h-3.5 flex-shrink-0" />
                Add a <b>Trigger</b> node (Add Node → Triggers) so this flow knows
                when to run.
              </div>
            )}

            <div className="flex-1 min-h-0">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={NODE_TYPES_MAP}
                fitView
                className="bg-ink-50"
              >
                <Background color="#e5e7eb" gap={20} />
                <Controls />
                <MiniMap pannable zoomable />
                {showPalette && (
                  <Panel position="top-left">
                    <NodePalette
                      onClose={() => setShowPalette(false)}
                      onAdd={addNodeCentered}
                    />
                  </Panel>
                )}
              </ReactFlow>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              className="max-w-lg w-full"
              icon={Workflow}
              title="Select or create a flow"
              description="Build automated Instagram DM conversations with a visual drag-and-drop editor. Pick a flow from the left or start from scratch."
              action={
                <button onClick={createNewFlow} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Create new flow
                </button>
              }
            />
          </div>
        )}
      </div>

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onChange={(updates) => updateNodeData(selectedNode.id, updates)}
          onDelete={() => deleteNode(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
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
