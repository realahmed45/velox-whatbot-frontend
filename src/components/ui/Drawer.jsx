import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

/**
 * Side drawer that slides in from the right (default) or left.
 * Closes on ESC or backdrop click.
 */
export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  width = "w-full max-w-md",
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const fromRight = side === "right";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: fromRight ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: fromRight ? "100%" : "-100%" }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
            className={clsx(
              "absolute top-0 bottom-0 bg-white shadow-card-lg flex flex-col",
              fromRight ? "right-0" : "left-0",
              width,
            )}
            role="dialog"
            aria-modal="true"
          >
            {title && (
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-ink-100">
                <h2 className="text-base font-semibold text-ink-900">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-ink-400 hover:text-ink-700 transition p-1 -mr-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="px-5 py-4 border-t border-ink-100 bg-ink-50/60 flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
