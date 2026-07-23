import { useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";

// Field keys here MUST match the backend Flow nodeData schema + the runtime
// flow engine so config saves, reloads, and executes consistently.
const FIELDS = {
  keyword_trigger: [
    {
      key: "keywords",
      label: "Trigger keywords (one per line)",
      type: "keywords",
      placeholder: "price\nhow much\norder",
    },
    {
      key: "matchType",
      label: "Match type",
      type: "select",
      options: ["contains", "exact", "starts_with", "ends_with"],
    },
  ],
  any_message_trigger: [],
  send_text: [
    {
      key: "message",
      label: "Message text",
      type: "textarea",
      placeholder: "Hi {{name}}! How can I help?",
    },
  ],
  send_image: [
    { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
    { key: "caption", label: "Caption (optional)", type: "text", placeholder: "Check this out!" },
  ],
  send_file: [
    { key: "fileUrl", label: "File URL", type: "text", placeholder: "https://..." },
    { key: "fileName", label: "File name", type: "text", placeholder: "document.pdf" },
  ],
  ask_question: [
    {
      key: "questionText",
      label: "Question text",
      type: "textarea",
      placeholder: "What's your name?",
    },
    {
      key: "variableName",
      label: "Save answer as variable",
      type: "text",
      placeholder: "customerName",
    },
  ],
  button_menu: [
    {
      key: "content",
      label: "Message body",
      type: "textarea",
      placeholder: "Choose an option:",
    },
    {
      key: "buttonsJson",
      label: "Buttons (one per line, max 3)",
      type: "textarea",
      placeholder: "Book Table\nView Menu\nContact Us",
    },
  ],
  list_menu: [
    { key: "header", label: "Header", type: "text", placeholder: "Our Services" },
    {
      key: "content",
      label: "Body",
      type: "textarea",
      placeholder: "Choose a service from the list.",
    },
    { key: "buttonText", label: "Button text", type: "text", placeholder: "View options" },
    {
      key: "itemsJson",
      label: "List items (one per line)",
      type: "textarea",
      placeholder: "Haircut\nColoring\nSpa Treatment",
    },
  ],
  delay: [
    { key: "delaySeconds", label: "Delay (seconds, max 8)", type: "number", placeholder: "3" },
  ],
  tag_contact: [
    { key: "tagName", label: "Tag name", type: "text", placeholder: "VIP Customer" },
  ],
  assign_agent: [
    { key: "agentId", label: "Assign to", type: "agents" },
    {
      key: "agentNote",
      label: "Note to agent (optional)",
      type: "text",
      placeholder: "Customer needs urgent help",
    },
  ],
  condition: [
    {
      key: "conditionVariable",
      label: "Variable to check",
      type: "text",
      placeholder: "customerName",
    },
    {
      key: "conditionOperator",
      label: "Operator",
      type: "select",
      options: [
        "equals",
        "not_equals",
        "contains",
        "not_contains",
        "starts_with",
        "ends_with",
        "greater_than",
        "less_than",
      ],
    },
    { key: "conditionValue", label: "Compare value", type: "text", placeholder: "VIP" },
  ],
  end_flow: [],
};

const HELP = {
  keyword_trigger:
    "Starts the flow when an incoming DM matches one of these keywords. Add at least one keyword or the flow can never fire.",
  any_message_trigger:
    "⚠️ Starts on EVERY incoming DM. While active, this flow takes priority over your AI bot, keyword automations and welcome DM.",
  ask_question:
    "Sends the question, waits for the reply, and stores it. Use it later with {{variableName}}.",
  condition:
    "Branches the flow. The green (Yes) path runs when the check passes, red (No) otherwise.",
  delay: "Pauses briefly before the next step (capped at 8s for reliability).",
  button_menu:
    "Sends a numbered list of options. Connect one line out of this node per option — option 1 follows the first connection, option 2 the second, and so on.",
  list_menu:
    "Sends a numbered list of options. Connect one line out of this node per option — option 1 follows the first connection, option 2 the second, and so on.",
  send_image: "Sends a real image attachment. The caption goes with it.",
  send_file: "Shares a file as a labelled download link.",
  tag_contact:
    "Adds a tag to this contact in Contacts. Variables like {{answer}} work here.",
  assign_agent:
    "Hands the chat to a human, pauses the bot, and marks it as needing a reply.",
};

export default function NodeConfigPanel({ node, onChange, onDelete, onClose }) {
  const fields = FIELDS[node.type] || [];
  const data = node.data || {};
  const { workspace } = useWorkspaceStore();

  // Teammates come straight off the loaded workspace — no extra request.
  const agents = useMemo(
    () =>
      (workspace?.members || [])
        .map((m) => ({
          id: String(m.user?._id || m.user || m._id || ""),
          name:
            m.user?.name || m.name || m.user?.email || m.email || "Teammate",
          role: m.role,
        }))
        .filter((a) => a.id),
    [workspace],
  );

  const handleChange = (key, value) => onChange({ [key]: value });

  return (
    <div className="w-72 bg-white border-l border-ink-100 flex flex-col flex-shrink-0">
      <div className="h-12 flex items-center justify-between px-4 border-b border-ink-100">
        <span className="font-semibold text-sm text-ink-800 capitalize">
          {node.type?.replace(/_/g, " ")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-ink-400 hover:bg-ink-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {HELP[node.type] && (
          <p className="text-xs text-ink-500 bg-ink-50 rounded-lg p-2.5 leading-snug">
            {HELP[node.type]}
          </p>
        )}
        <div>
          <label className="label">Node label</label>
          <input
            className="input"
            value={data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            placeholder="Node label"
          />
        </div>
        {fields.map(({ key, label, type, placeholder, options }) => (
          <div key={key}>
            <label className="label">{label}</label>
            {type === "keywords" ? (
              <textarea
                className="input resize-none"
                rows={3}
                value={(data[key] || []).join("\n")}
                onChange={(e) =>
                  handleChange(
                    key,
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder={placeholder}
              />
            ) : type === "textarea" ? (
              <textarea
                className="input resize-none"
                rows={3}
                value={data[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
              />
            ) : type === "agents" ? (
              <>
                <select
                  className="input"
                  value={data[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                >
                  <option value="">Anyone on the team</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.role ? ` · ${a.role}` : ""}
                    </option>
                  ))}
                </select>
                {agents.length === 0 && (
                  <p className="text-[11px] text-ink-400 mt-1">
                    Invite teammates on the Team page to assign a specific
                    person.
                  </p>
                )}
              </>
            ) : type === "select" ? (
              <select
                className="input"
                value={data[key] || options[0]}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={type}
                value={data[key] ?? ""}
                onChange={(e) =>
                  handleChange(
                    key,
                    type === "number" ? Number(e.target.value) : e.target.value,
                  )
                }
                placeholder={placeholder}
              />
            )}
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-ink-400">No configuration needed.</p>
        )}
      </div>
    </div>
  );
}
