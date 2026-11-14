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
      { type: "keyword_trigger", label: "Keyword Trigger", icon: MessageSquare, color: "text-sunset-flame", bg: "bg-sunset-soft" },
      { type: "any_message_trigger", label: "Any Message", icon: Zap, color: "text-sunset-flame", bg: "bg-sunset-soft" },
    ],
  },
  {
    title: "Send",
    nodes: [
      { type: "send_text", label: "Send Text", icon: AlignLeft, color: "text-blue-600", bg: "bg-blue-50" },
      { type: "send_image", label: "Send Image", icon: Image, color: "text-purple-600", bg: "bg-purple-50" },
      { type: "send_file", label: "Send File", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
      { type: "ask_question", label: "Ask Question", icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50" },
      { type: "button_menu", label: "Button Menu", icon: MousePointer, color: "text-sunset-flame", bg: "bg-sunset-soft" },
      { type: "list_menu", label: "List Menu", icon: List, color: "text-pink-600", bg: "bg-pink-50" },
    ],
  },
  {
    title: "Logic & actions",
    nodes: [
      { type: "condition", label: "Condition", icon: GitBranch, color: "text-red-600", bg: "bg-red-50" },
      { type: "delay", label: "Delay", icon: Clock, color: "text-ink-600", bg: "bg-ink-50" },
      { type: "tag_contact", label: "Tag Contact", icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50" },
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
    <div className="absolute md:relative inset-y-0 left-0 z-20 w-56 flex-shrink-0 bg-white/75 md:bg-white/55 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/70 shadow-[1px_0_0_rgba(15,23,42,0.05),12px_0_30px_-20px_rgba(15,23,42,0.25)] md:shadow-[1px_0_0_rgba(15,23,42,0.05)] flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[11px] font-semibold text-ink-800 uppercase tracking-[0.12em]">
          Add a node
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 grid place-items-center rounded-lg hover:bg-ink-900/[0.05] text-ink-400 hover:text-ink-700 hover:rotate-90 active:scale-90 transition-all duration-300 ease-spring"
          title="Hide panel"
          aria-label="Hide panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[11px] text-ink-400 px-3 pb-2 leading-snug">
        Drag onto the canvas — or click to drop it in.
      </p>
      {GROUPS.map((group) => (
        <div key={group.title} className="mb-3 px-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider">
              {group.title}
            </span>
            {group.hint && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sunset-soft text-sunset-flame ring-1 ring-inset ring-sunset-flame/20 font-semibold">
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
                className="group flex items-center gap-2 p-2 rounded-xl cursor-grab active:cursor-grabbing select-none ring-1 ring-transparent hover:bg-white hover:ring-ink-900/[0.07] hover:shadow-[inset_0_1px_0_#fff,0_6px_16px_-10px_rgba(15,23,42,0.25)] hover:translate-x-0.5 active:scale-[0.97] transition-all duration-300 ease-spring"
              >
                <div
                  className={`w-7 h-7 rounded-lg grid place-items-center ${bg} flex-shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.8} />
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
