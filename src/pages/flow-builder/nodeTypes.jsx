import { Handle, Position } from "@xyflow/react";
import {
  MessageSquare,
  HelpCircle,
  MousePointer,
  Clock,
  Tag,
  User,
  GitBranch,
  X,
  AlignLeft,
  Image,
  FileText,
  List,
  Zap,
} from "lucide-react";

// Node cards share a uniform white surface + neutral border, with an orange
// selected state — only the icon/label/handle carries the per-type colour so
// types stay distinguishable without a rainbow of card borders.
const COLORS = {
  blue: { text: "text-blue-600", dot: "!bg-blue-400" },
  purple: { text: "text-purple-600", dot: "!bg-purple-400" },
  indigo: { text: "text-indigo-600", dot: "!bg-indigo-400" },
  yellow: { text: "text-amber-600", dot: "!bg-amber-400" },
  orange: { text: "text-sunset-flame", dot: "!bg-sunset-flame" },
  pink: { text: "text-pink-600", dot: "!bg-pink-400" },
  gray: { text: "text-ink-600", dot: "!bg-ink-400" },
  green: { text: "text-emerald-600", dot: "!bg-emerald-400" },
  teal: { text: "text-teal-600", dot: "!bg-teal-400" },
  red: { text: "text-red-600", dot: "!bg-red-400" },
};

// Liquid-glass node cards: frosted fill, specular top edge, hairline ring.
// Selected = sunset ring + warm glow.
const CARD_BORDER =
  "border-white/80 ring-1 ring-ink-900/[0.07] hover:ring-sunset-flame/30";
const CARD_SEL =
  "border-white ring-2 ring-sunset-flame/70 shadow-[inset_0_1px_0_#fff,0_0_0_4px_rgba(255,106,43,0.12),0_18px_40px_-16px_rgba(255,61,119,0.45)]";

const baseStyle =
  "min-w-[190px] max-w-[240px] rounded-2xl border bg-white/80 backdrop-blur-xl text-xs font-medium shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(15,23,42,0.05),0_10px_28px_-14px_rgba(15,23,42,0.22)] transition-[box-shadow,ring-color] duration-300 hover:shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(15,23,42,0.05),0_18px_36px_-14px_rgba(255,106,43,0.35)]";

// Best-effort one-line preview of whatever the node is configured to do.
const previewText = (data = {}) => {
  if (data.keywords?.length) return data.keywords.join(", ");
  return (
    data.message ||
    data.questionText ||
    data.content ||
    data.caption ||
    data.tagName ||
    data.conditionVariable ||
    (data.delaySeconds != null ? `${data.delaySeconds}s delay` : "") ||
    "(not configured)"
  );
};

const HANDLE =
  "!w-3 !h-3 !border-2 !border-white !shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_2px_6px_rgba(255,106,43,0.35)] transition-transform duration-300 hover:!scale-125";

const mkNode = (icon, label, color) => {
  const c = COLORS[color] || COLORS.gray;
  const Comp = ({ data, selected }) => (
    <div className={`${baseStyle} ${selected ? CARD_SEL : CARD_BORDER} p-3.5`}>
      <Handle
        type="target"
        position={Position.Top}
        className={`${HANDLE} !bg-ink-300`}
      />
      <div className={`flex items-center gap-2 ${c.text} mb-1.5`}>
        <span className={`w-6 h-6 rounded-lg bg-white ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] grid place-items-center ${c.text}`}>
          {icon}
        </span>
        <span className="font-display font-semibold tracking-[-0.01em] text-[13px] text-ink-800">
          {data.label || label}
        </span>
      </div>
      <p className="text-ink-500 truncate text-[11px] pl-0.5">
        {previewText(data)}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${HANDLE} !bg-sunset`}
      />
    </div>
  );
  return Comp;
};

export const SendTextNode = mkNode(<AlignLeft className="w-3 h-3" />, "Send Text", "blue");
export const SendImageNode = mkNode(<Image className="w-3 h-3" />, "Send Image", "purple");
export const SendFileNode = mkNode(<FileText className="w-3 h-3" />, "Send File", "indigo");
export const AskQuestionNode = mkNode(<HelpCircle className="w-3 h-3" />, "Ask Question", "yellow");
export const ButtonMenuNode = mkNode(<MousePointer className="w-3 h-3" />, "Button Menu", "orange");
export const ListMenuNode = mkNode(<List className="w-3 h-3" />, "List Menu", "pink");
export const DelayNode = mkNode(<Clock className="w-3 h-3" />, "Delay", "gray");
export const TagContactNode = mkNode(<Tag className="w-3 h-3" />, "Tag Contact", "green");
export const AssignAgentNode = mkNode(<User className="w-3 h-3" />, "Assign Agent", "teal");

// Condition node — two labelled outputs (true / false).
export const ConditionNode = ({ data, selected }) => {
  const c = COLORS.red;
  return (
    <div className={`${baseStyle} ${selected ? CARD_SEL : CARD_BORDER} p-3`}>
      <Handle type="target" position={Position.Top} className={`${HANDLE} !bg-ink-300`} />
      <div className={`flex items-center gap-2 ${c.text} mb-1`}>
        <span className="w-6 h-6 rounded-lg bg-white ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] grid place-items-center">
          <GitBranch className="w-3 h-3" />
        </span>
        <span className="font-display font-semibold tracking-[-0.01em] text-[13px] text-ink-800">{data.label || "Condition"}</span>
      </div>
      <p className="text-ink-500 truncate text-xs">
        {data.conditionVariable
          ? `${data.conditionVariable} ${data.conditionOperator || "equals"} ${data.conditionValue || ""}`
          : "(not configured)"}
      </p>
      <div className="flex justify-between mt-1 text-[10px]">
        <span className="text-emerald-600 font-semibold">Yes</span>
        <span className="text-rose-600 font-semibold">No</span>
      </div>
      <Handle
        id="true"
        type="source"
        position={Position.Bottom}
        style={{ left: "25%" }}
        className={`${HANDLE} !bg-emerald-500`}
      />
      <Handle
        id="false"
        type="source"
        position={Position.Bottom}
        style={{ left: "75%" }}
        className={`${HANDLE} !bg-rose-500`}
      />
    </div>
  );
};

export const EndFlowNode = ({ data, selected }) => (
  <div className={`${baseStyle} ${selected ? CARD_SEL : CARD_BORDER} p-3 !bg-ink-50/80`}>
    <Handle type="target" position={Position.Top} className={`${HANDLE} !bg-ink-300`} />
    <div className="flex items-center gap-2 text-ink-500">
      <X className="w-3 h-3" />
      <span className="font-semibold text-xs">{data.label || "End Flow"}</span>
    </div>
  </div>
);

// ── Trigger nodes (entry points — source handle only) ───────────────────────
const triggerStyle = (selected) =>
  `${baseStyle} p-3.5 !bg-sunset text-white border-white/30 ${
    selected
      ? "ring-2 ring-sunset-flame/70 ring-offset-2 ring-offset-white/80 shadow-[0_18px_40px_-14px_rgba(255,61,119,0.6)]"
      : "ring-1 ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_32px_-14px_rgba(255,61,119,0.55)]"
  }`;

export const KeywordTriggerNode = ({ data, selected }) => (
  <div className={triggerStyle(selected)}>
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/20 ring-1 ring-inset ring-white/25 rounded-md px-1.5 py-0.5">
        Trigger
      </span>
      <MessageSquare className="w-3.5 h-3.5" />
      <span className="font-display font-semibold tracking-[-0.01em] text-[13px]">
        {data.label || "Keyword Trigger"}
      </span>
    </div>
    <p className="text-white/85 text-[11px] truncate pl-0.5">
      {data.keywords?.length ? data.keywords.join(", ") : "(add keywords)"}
    </p>
    <Handle
      type="source"
      position={Position.Bottom}
      className={`${HANDLE} !bg-white`}
    />
  </div>
);

export const AnyMessageTriggerNode = ({ data, selected }) => (
  <div className={triggerStyle(selected)}>
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/20 ring-1 ring-inset ring-white/25 rounded-md px-1.5 py-0.5">
        Trigger
      </span>
      <Zap className="w-3.5 h-3.5" />
      <span className="font-display font-semibold tracking-[-0.01em] text-[13px]">{data.label || "Any Message"}</span>
    </div>
    <p className="text-white/85 text-[11px] truncate pl-0.5">
      Fires on any incoming DM
    </p>
    <Handle
      type="source"
      position={Position.Bottom}
      className={`${HANDLE} !bg-white`}
    />
  </div>
);

export const NODE_TYPES_MAP = {
  send_text: SendTextNode,
  send_image: SendImageNode,
  send_file: SendFileNode,
  ask_question: AskQuestionNode,
  button_menu: ButtonMenuNode,
  list_menu: ListMenuNode,
  delay: DelayNode,
  tag_contact: TagContactNode,
  assign_agent: AssignAgentNode,
  condition: ConditionNode,
  end_flow: EndFlowNode,
  keyword_trigger: KeywordTriggerNode,
  any_message_trigger: AnyMessageTriggerNode,
};

// Node type → schema category (Flow.js `type` field).
export const NODE_CATEGORY = {
  keyword_trigger: "trigger",
  any_message_trigger: "trigger",
  condition: "condition",
};
export const nodeCategory = (nodeType) => NODE_CATEGORY[nodeType] || "action";

export const NODE_LABELS = {
  send_text: "Send Text",
  send_image: "Send Image",
  send_file: "Send File",
  ask_question: "Ask Question",
  button_menu: "Button Menu",
  list_menu: "List Menu",
  delay: "Delay",
  tag_contact: "Tag Contact",
  assign_agent: "Assign Agent",
  condition: "Condition",
  end_flow: "End Flow",
  keyword_trigger: "Keyword Trigger",
  any_message_trigger: "Any Message",
};
