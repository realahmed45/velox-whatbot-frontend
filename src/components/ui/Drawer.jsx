import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

/**
 * Side drawer that slides in from the right (default) or left.
 * Closes on ESC or backdrop click. Crisp white panel on a spring with an
 * orange top edge.
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
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: fromRight ? "104%" : "-104%" }}
            animate={{ x: 0 }}
            exit={{ x: fromRight ? "104%" : "-104%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", stiffness: 420, damping: 40, mass: 0.9 }}
            className={clsx(
              "absolute bottom-0 top-0 flex flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(10,10,10,0.06),0_32px_80px_-24px_rgba(10,10,10,0.45)] sm:bottom-2 sm:top-2",
              fromRight ? "right-0 rounded-l-3xl sm:right-2 sm:rounded-3xl" : "left-0 rounded-r-3xl sm:left-2 sm:rounded-3xl",
              width,
            )}
            role="dialog"
            aria-modal="true"
          >
            <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[#FF5A1F]" />
            {title && (
              <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
                <h2 className="font-geist text-base font-semibold tracking-[-0.02em] text-neutral-950">{title}</h2>
                <button
                  onClick={onClose}
                  className="group -mr-1 grid h-9 w-9 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 active:scale-90"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:rotate-90" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-neutral-50/80 px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
