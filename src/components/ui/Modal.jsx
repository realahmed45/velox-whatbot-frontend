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
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-night-950/40 backdrop-blur-md"
            onClick={() => closeOnBackdrop && onClose?.()}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0, transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={clsx(
              // Flex column capped at 90vh so tall content never pushes the
              // header/footer off-screen — the body scrolls instead.
              "glass-strong relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl focus:outline-none",
              sizes[size],
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* specular sunset hairline + a faint warm wash in the corner */}
            <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-sunset opacity-60" />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-sunset opacity-[0.12] blur-3xl"
            />
            {(title || onClose) && (
              <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-ink-900/[0.06] px-6 pb-4 pt-5">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id="modal-title"
                      className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900"
                    >
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="group -mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-800 active:scale-90"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
                  </button>
                )}
              </div>
            )}
            <div className="relative flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="relative flex shrink-0 items-center justify-end gap-2 border-t border-ink-900/[0.06] bg-white/50 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
