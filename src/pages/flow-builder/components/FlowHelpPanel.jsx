import { X, Zap, MousePointer, GitBranch, Braces, Play } from "lucide-react";

/**
 * FlowHelpPanel — the "how do I use this?" drawer inside the builder.
 * Written for a non-technical business owner, not a developer.
 */

const STEPS = [
  {
    n: 1,
    title: "Pick what starts the flow",
    body: "Every flow begins with a Trigger. Use “Keyword Trigger” and type the words customers actually send (price, order, book). “Any Message” fires on every DM — powerful, but it overrides your AI bot and other automations.",
  },
  {
    n: 2,
    title: "Add your steps",
    body: "Drag a node from the left panel onto the canvas (or click it to drop it in the middle). Send Text is the workhorse — Ask Question, Menu, Condition and Tag do the clever parts.",
  },
  {
    n: 3,
    title: "Connect them",
    body: "Drag from the dot at the bottom of one node to the dot on top of the next. Nothing runs unless it's connected to the trigger.",
  },
  {
    n: 4,
    title: "Save, then Activate",
    body: "Save keeps your work. Activate makes it live on real DMs. If activation is blocked we'll tell you exactly what to fix.",
  },
];

const RULES = [
  {
    icon: MousePointer,
    title: "Menus branch by connection order",
    body: "A Button/List Menu sends numbered options. Draw one connection out of the menu per option — the FIRST connection you draw is option 1, the second is option 2, and so on.",
  },
  {
    icon: GitBranch,
    title: "Conditions have Yes / No outputs",
    body: "The green dot (left) is the Yes path, the red dot (right) is No. Wire both so no one hits a dead end.",
  },
  {
    icon: Braces,
    title: "Use answers later with variables",
    body: "Ask Question saves the reply under a name you choose. Use it in any later message as {{yourName}} — plus {{name}} and {{username}} always work.",
  },
  {
    icon: Zap,
    title: "Only one flow runs per message",
    body: "Flows are checked in priority order and the first match wins. Keep triggers specific so they don't overlap.",
  },
];

export default function FlowHelpPanel({ open, onClose, onOpenTemplates }) {
  if (!open) return null;

  return (
    <div className="w-80 bg-white border-l border-ink-100 flex flex-col flex-shrink-0">
      <div className="h-12 flex items-center justify-between px-4 border-b border-ink-100">
        <span className="font-bold text-sm text-ink-900">
          How to build a flow
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Fast path */}
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-3.5">
          <p className="text-sm font-bold text-ink-900">In a hurry?</p>
          <p className="text-xs text-ink-600 mt-1 leading-relaxed">
            Start from a ready-made template and just change the wording. It's
            the fastest way to get something live.
          </p>
          <button
            onClick={onOpenTemplates}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 transition"
          >
            <Play className="w-3.5 h-3.5" /> Browse templates
          </button>
        </div>

        {/* Steps */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
            The 4 steps
          </p>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {s.n}
                </span>
                <div>
                  <p className="text-xs font-bold text-ink-900">{s.title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules worth knowing */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
            Worth knowing
          </p>
          <div className="space-y-3">
            {RULES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-ink-100 p-3 bg-white"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-brand-600" />
                  <p className="text-xs font-bold text-ink-900">{title}</p>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
            A simple example
          </p>
          <div className="rounded-xl bg-ink-50 border border-ink-100 p-3 text-xs text-ink-600 leading-relaxed font-mono">
            Keyword “price”
            <br />
            ↓<br />
            Send Text “Our packages start at…”
            <br />
            ↓<br />
            Tag Contact “price-enquiry”
          </div>
          <p className="text-[11px] text-ink-400 mt-2 leading-relaxed">
            Three nodes, two connections — that's a working flow.
          </p>
        </div>
      </div>
    </div>
  );
}
