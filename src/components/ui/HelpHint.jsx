import { useState, useRef, useEffect } from "react";
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-600 transition"
        aria-label="Help"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Help
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 top-full w-72 sm:w-80 rounded-xl border border-ink-100 bg-white shadow-card-lg p-4 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-black text-ink-900">{title}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-400 hover:text-ink-700 -mr-1 -mt-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink-600 leading-snug">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          {footer && (
            <div className="mt-3 pt-3 border-t border-ink-100 text-[12px] text-ink-500">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
