import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

const POP = { type: "spring", stiffness: 420, damping: 30 };

/**
 * Provider — mount once near the top of the dashboard tree.
 * Use the returned `confirm` from useConfirm() inside any component:
 *   const confirm = useConfirm();
 *   if (await confirm({ title, description, confirmLabel, danger })) ...
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setState({ ...opts, resolve });
      }),
    [],
  );

  const close = (result) => {
    state?.resolve?.(result);
    setState(null);
  };

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            key="confirm"
            className="fixed inset-0 z-[95] flex items-center justify-center bg-night-950/40 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => close(false)}
          >
            <motion.div
              className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-center sm:p-7"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, transitionEnd: { filter: "none" } }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={POP}
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
            >
              {/* soft wash behind the icon */}
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${
                  state.danger ? "bg-rose-400/25" : "bg-sunset opacity-25"
                }`}
              />
              <motion.div
                initial={{ scale: 0.6, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.05 }}
                className={`relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ring-1 ring-inset ${
                  state.danger
                    ? "bg-rose-50 text-rose-500 ring-rose-500/15"
                    : "bg-sunset-soft text-sunset-flame ring-sunset-flame/15"
                }`}
              >
                <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
              </motion.div>

              <h3 className="relative font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
                {state.title || "Are you sure?"}
              </h3>
              {state.description && (
                <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{state.description}</p>
              )}

              <div className="relative mt-6 flex flex-col-reverse gap-2.5 sm:flex-row">
                <button onClick={() => close(false)} className="btn-secondary flex-1">
                  {state.cancelLabel || "Cancel"}
                </button>
                <button
                  onClick={() => close(true)}
                  autoFocus
                  className={`flex-1 ${state.danger ? "btn-danger" : "btn-primary"}`}
                >
                  {state.confirmLabel || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Safe fallback if provider isn't mounted: use native confirm
    // eslint-disable-next-line no-alert
    return async (opts) =>
      window.confirm(opts?.description || opts?.title || "Are you sure?");
  }
  return ctx;
};
