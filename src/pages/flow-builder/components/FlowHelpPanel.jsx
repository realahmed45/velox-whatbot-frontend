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
    <div className="absolute md:relative inset-y-0 right-0 z-30 w-full max-w-[20rem] md:w-80 bg-white/80 md:bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border-l border-white/70 shadow-[-1px_0_0_rgba(15,23,42,0.05),-12px_0_30px_-20px_rgba(15,23,42,0.25)] flex flex-col flex-shrink-0">
      <div className="h-12 flex items-center justify-between px-4 border-b border-ink-900/[0.06]">
        <span className="font-display font-semibold tracking-[-0.01em] text-sm text-ink-900">
          How to build a flow
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 grid place-items-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-900/[0.05] hover:rotate-90 active:scale-90 transition-all duration-300 ease-spring"
          aria-label="Close help"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Fast path */}
        <div className="rounded-2xl bg-sunset-soft ring-1 ring-sunset-flame/15 p-3.5">
          <p className="font-display text-sm font-semibold text-ink-900">In a <span className="font-serif italic font-normal">hurry?</span></p>
          <p className="text-xs text-ink-600 mt-1 leading-relaxed">
            Start from a ready-made template and just change the wording. It's
            the fastest way to get something live.
          </p>
          <button
            onClick={onOpenTemplates}
            className="btn-primary mt-3 text-xs px-3 py-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Browse templates
          </button>
        </div>

        {/* Steps */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 mb-2">
            The 4 steps
          </p>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sunset text-white text-[10px] font-semibold tabular-nums grid place-items-center shrink-0 mt-0.5">
                  {s.n}
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-900">{s.title}</p>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 mb-2">
            Worth knowing
          </p>
          <div className="space-y-3">
            {RULES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl ring-1 ring-ink-900/[0.06] p-3 bg-white/70 shadow-[inset_0_1px_0_#fff]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-sunset-flame" strokeWidth={1.8} />
                  <p className="text-xs font-semibold text-ink-900">{title}</p>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 mb-2">
            A simple example
          </p>
          <div className="rounded-xl bg-ink-900/[0.03] ring-1 ring-ink-900/[0.06] p-3 text-xs text-ink-600 leading-relaxed font-mono">
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
