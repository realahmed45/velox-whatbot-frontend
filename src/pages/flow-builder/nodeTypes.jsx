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
  orange: { text: "text-brand-600", dot: "!bg-brand-400" },
  pink: { text: "text-pink-600", dot: "!bg-pink-400" },
  gray: { text: "text-ink-600", dot: "!bg-ink-400" },
  green: { text: "text-emerald-600", dot: "!bg-emerald-400" },
  teal: { text: "text-teal-600", dot: "!bg-teal-400" },
  red: { text: "text-red-600", dot: "!bg-red-400" },
};

const CARD_BORDER = "border-ink-200";
const CARD_SEL = "border-brand-500 ring-2 ring-brand-200/60";

const baseStyle =
  "min-w-[170px] max-w-[230px] rounded-xl border-2 bg-white shadow-card text-xs font-medium transition";

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

const mkNode = (icon, label, color) => {
  const c = COLORS[color] || COLORS.gray;
  const Comp = ({ data, selected }) => (
    <div className={`${baseStyle} ${selected ? CARD_SEL : CARD_BORDER} p-3`}>
      <Handle type="target" position={Position.Top} className="!bg-ink-300" />
      <div className={`flex items-center gap-2 ${c.text} mb-1`}>
        {icon}
        <span className="font-semibold text-xs">{data.label || label}</span>
      </div>
      <p className="text-ink-500 truncate text-xs">{previewText(data)}</p>
      <Handle type="source" position={Position.Bottom} className={c.dot} />
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
      <Handle type="target" position={Position.Top} className="!bg-ink-300" />
      <div className={`flex items-center gap-2 ${c.text} mb-1`}>
        <GitBranch className="w-3 h-3" />
        <span className="font-semibold text-xs">{data.label || "Condition"}</span>
      </div>
      <p className="text-ink-500 truncate text-xs">
        {data.conditionVariable
          ? `${data.conditionVariable} ${data.conditionOperator || "equals"} ${data.conditionValue || ""}`
          : "(not configured)"}
      </p>
      <div className="flex justify-between mt-1 text-[10px]">
        <span className="text-green-600 font-semibold">Yes</span>
        <span className="text-red-600 font-semibold">No</span>
      </div>
      <Handle
        id="true"
        type="source"
        position={Position.Bottom}
        style={{ left: "25%" }}
        className="!bg-green-500"
      />
      <Handle
        id="false"
        type="source"
        position={Position.Bottom}
        style={{ left: "75%" }}
        className="!bg-red-500"
      />
    </div>
  );
};

export const EndFlowNode = ({ data, selected }) => (
  <div className={`${baseStyle} ${selected ? "border-ink-500" : "border-ink-300"} p-3 bg-ink-50`}>
    <Handle type="target" position={Position.Top} className="!bg-ink-300" />
    <div className="flex items-center gap-2 text-ink-500">
      <X className="w-3 h-3" />
      <span className="font-semibold text-xs">{data.label || "End Flow"}</span>
    </div>
  </div>
);

// ── Trigger nodes (entry points — source handle only) ───────────────────────
export const KeywordTriggerNode = ({ data, selected }) => (
  <div className={`${baseStyle} ${selected ? "border-brand-600" : "border-brand-400"} p-3 bg-brand-50`}>
    <div className="flex items-center gap-2 text-brand-700 mb-1">
      <MessageSquare className="w-3 h-3" />
      <span className="font-semibold text-xs">{data.label || "Keyword Trigger"}</span>
    </div>
    <p className="text-brand-600 text-xs truncate">
      {data.keywords?.length ? data.keywords.join(", ") : "(no keywords yet)"}
    </p>
    <Handle type="source" position={Position.Bottom} className="!bg-brand-500" />
  </div>
);

export const AnyMessageTriggerNode = ({ data, selected }) => (
  <div className={`${baseStyle} ${selected ? "border-brand-600" : "border-brand-400"} p-3 bg-brand-50`}>
    <div className="flex items-center gap-2 text-brand-700 mb-1">
      <Zap className="w-3 h-3" />
      <span className="font-semibold text-xs">{data.label || "Any Message"}</span>
    </div>
    <p className="text-brand-600 text-xs truncate">Fires on any incoming DM</p>
    <Handle type="source" position={Position.Bottom} className="!bg-brand-500" />
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
