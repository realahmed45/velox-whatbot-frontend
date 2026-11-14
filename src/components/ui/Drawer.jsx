import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

/**
 * Side drawer that slides in from the right (default) or left.
 * Closes on ESC or backdrop click. Liquid-glass panel on a spring.
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
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-night-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: fromRight ? "104%" : "-104%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: fromRight ? "104%" : "-104%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
            className={clsx(
              "glass-strong absolute bottom-0 top-0 flex flex-col overflow-hidden sm:bottom-2 sm:top-2",
              fromRight ? "right-0 rounded-l-3xl sm:right-2 sm:rounded-3xl" : "left-0 rounded-r-3xl sm:left-2 sm:rounded-3xl",
              width,
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* sunset hairline along the top edge */}
            <div aria-hidden className="absolute inset-x-6 top-0 h-px bg-sunset opacity-60" />
            {title && (
              <div className="flex items-center justify-between gap-4 border-b border-ink-900/[0.06] px-5 py-4">
                <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="group -mr-1 grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-800 active:scale-90"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-ink-900/[0.06] bg-white/50 px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
