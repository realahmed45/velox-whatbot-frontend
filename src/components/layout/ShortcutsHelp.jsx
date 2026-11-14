import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X } from "lucide-react";

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="shortcuts"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-night-950/40 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-6"
            initial={{ opacity: 0, scale: 0.94, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, scale: 0.96, y: 6, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-sunset opacity-60" />
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
                  <Keyboard className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">Keyboard shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="group grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-700 active:scale-90"
                aria-label="Close"
              >
                <X className="h-5 w-5 transition-transform duration-500 ease-spring group-hover:rotate-90" />
              </button>
            </div>
            <ul className="divide-y divide-ink-900/[0.06]">
              {SHORTCUTS.map((s) => (
                <li key={s.desc} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink-600">{s.desc}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="min-w-[24px] rounded-md bg-white px-2 py-0.5 text-center font-mono text-[11px] text-ink-700 shadow-[inset_0_-1px_0_rgba(15,23,42,0.1)] ring-1 ring-ink-900/[0.08]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
