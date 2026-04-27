import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

/**
 * Centered modal dialog. Closes on ESC, backdrop click, or the close button.
 * Implements focus trap and aria-modal for accessibility.
 *
 *  <Modal open={open} onClose={close} title="Create flow" size="md">
 *    ...content
 *  </Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;

    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      );

    // initial focus
    const els = focusable();
    (els[0] || dialogRef.current)?.focus?.();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        const list = focusable();
        if (list.length === 0) {
          e.preventDefault();
          return;
        }
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-md"
            onClick={() => closeOnBackdrop && onClose?.()}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={clsx(
              "relative w-full bg-white rounded-lg shadow-card-lg overflow-hidden focus:outline-none",
              sizes[size],
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-ink-100">
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-base font-semibold text-ink-900"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-ink-500 mt-0.5">{description}</p>
                  )}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-ink-400 hover:text-ink-700 transition p-1 -mr-1"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-ink-100 bg-ink-50/60 flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
