import {
  AlignLeft,
  HelpCircle,
  MousePointer,
  Clock,
  Tag,
  User,
  GitBranch,
  X,
  Image,
  FileText,
  List,
  MessageSquare,
  Zap,
} from "lucide-react";

const GROUPS = [
  {
    title: "Triggers",
    hint: "Start here",
    nodes: [
      { type: "keyword_trigger", label: "Keyword Trigger", icon: MessageSquare, color: "text-brand-600", bg: "bg-brand-50" },
      { type: "any_message_trigger", label: "Any Message", icon: Zap, color: "text-brand-600", bg: "bg-brand-50" },
    ],
  },
  {
    title: "Send",
    nodes: [
      { type: "send_text", label: "Send Text", icon: AlignLeft, color: "text-blue-600", bg: "bg-blue-50" },
      { type: "send_image", label: "Send Image", icon: Image, color: "text-purple-600", bg: "bg-purple-50" },
      { type: "send_file", label: "Send File", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
      { type: "ask_question", label: "Ask Question", icon: HelpCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
      { type: "button_menu", label: "Button Menu", icon: MousePointer, color: "text-orange-600", bg: "bg-orange-50" },
      { type: "list_menu", label: "List Menu", icon: List, color: "text-pink-600", bg: "bg-pink-50" },
    ],
  },
  {
    title: "Logic & actions",
    nodes: [
      { type: "condition", label: "Condition", icon: GitBranch, color: "text-red-600", bg: "bg-red-50" },
      { type: "delay", label: "Delay", icon: Clock, color: "text-ink-600", bg: "bg-ink-50" },
      { type: "tag_contact", label: "Tag Contact", icon: Tag, color: "text-green-600", bg: "bg-green-50" },
      { type: "assign_agent", label: "Assign Agent", icon: User, color: "text-teal-600", bg: "bg-teal-50" },
      { type: "end_flow", label: "End Flow", icon: X, color: "text-ink-500", bg: "bg-ink-50" },
    ],
  },
];

export default function NodePalette({ onClose, onAdd }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("nodeType", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="bg-white rounded-lg border border-ink-200 shadow-lg p-3 w-52 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
          Add a node
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-ink-100 text-ink-400"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-[11px] text-ink-400 mb-2 leading-snug">
        Drag onto the canvas, or click to add.
      </p>
      {GROUPS.map((group) => (
        <div key={group.title} className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider">
              {group.title}
            </span>
            {group.hint && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                {group.hint}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {group.nodes.map(({ type, label, icon: Icon, color, bg }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                onClick={() => onAdd?.(type)}
                className="flex items-center gap-2 p-2 rounded-lg cursor-grab hover:bg-ink-50 transition border border-transparent hover:border-ink-200"
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${bg} flex-shrink-0`}
                >
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
                <span className="text-xs font-medium text-ink-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
