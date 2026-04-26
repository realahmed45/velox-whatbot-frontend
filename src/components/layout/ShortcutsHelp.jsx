import { useEffect } from "react";
import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Open command palette" },
  { keys: ["?"], desc: "Show this help" },
  { keys: ["g", "i"], desc: "Go to Inbox" },
  { keys: ["g", "d"], desc: "Go to Dashboard" },
  { keys: ["g", "a"], desc: "Go to Analytics" },
  { keys: ["g", "f"], desc: "Go to Flow Builder" },
  { keys: ["Esc"], desc: "Close dialogs" },
];

export default function ShortcutsHelp({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-900">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 text-ink-400 hover:text-ink-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.desc}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-ink-600">{s.desc}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-0.5 text-[11px] bg-ink-100 border border-ink-200 rounded font-mono text-ink-700"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
