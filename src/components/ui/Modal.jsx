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
 *
 * Look: crisp white panel, orange top edge, black/40 backdrop. On phones it
 * docks to the bottom as a sheet.
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
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => closeOnBackdrop && onClose?.()}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
            className={clsx(
              // Flex column capped at 90vh so tall content never pushes the
              // header/footer off-screen — the body scrolls instead.
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_0_0_1px_rgba(10,10,10,0.06),0_32px_80px_-24px_rgba(10,10,10,0.45)] focus:outline-none sm:max-h-[90vh] sm:rounded-3xl",
              sizes[size] || sizes.md,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[#FF5A1F]" />
            {(title || onClose) && (
              <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-black/[0.06] px-6 pb-4 pt-5">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id="modal-title"
                      className="font-geist text-lg font-semibold tracking-[-0.02em] text-neutral-950"
                    >
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="group -mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 active:scale-90"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:rotate-90" />
                  </button>
                )}
              </div>
            )}
            <div className="relative flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="relative flex shrink-0 items-center justify-end gap-2 border-t border-black/[0.06] bg-neutral-50/80 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
