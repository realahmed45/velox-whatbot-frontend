import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

/**
 * HelpHint — a compact contextual-help control for dashboard pages.
 *
 * Renders a small "?" button; clicking opens a popover with a title + a list of
 * short tips (and an optional footer). Use it in a page/section header so users
 * always have guidance right where they are.
 *
 *   <HelpHint
 *     title="AI Bot"
 *     tips={[
 *       "The bot replies when no automation rule matches the message.",
 *       "Add your website + FAQs under Knowledge so answers sound like you.",
 *     ]}
 *   />
 */
export default function HelpHint({ title = "How this works", tips = [], footer, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary group gap-1.5 rounded-xl px-2.5 py-1.5 text-xs"
        aria-label="Help"
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5 text-sunset-flame transition-transform duration-500 ease-spring group-hover:rotate-[-12deg] group-hover:scale-110" />
        Help
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, scale: 0.96, y: -4, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: align === "right" ? "top right" : "top left" }}
            className={`glass-strong absolute top-full z-50 mt-2 w-72 rounded-2xl p-4 sm:w-80 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <div className="mb-2.5 flex items-start justify-between gap-3">
              <p className="font-display text-sm font-semibold tracking-[-0.01em] text-ink-900">{title}</p>
              <button
                onClick={() => setOpen(false)}
                className="group -mr-1.5 -mt-1 grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-700"
                aria-label="Close"
              >
                <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
              </button>
            </div>
            <ul className="space-y-2">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-ink-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            {footer && (
              <div className="mt-3 border-t border-ink-900/[0.06] pt-3 text-[12px] text-ink-500">{footer}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
