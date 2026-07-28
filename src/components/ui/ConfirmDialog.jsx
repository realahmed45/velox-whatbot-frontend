import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

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
      {state && (
        <div
          className="fixed inset-0 z-[95] bg-ink-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_.12s_ease-out]"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 text-center animate-[popIn_.16s_cubic-bezier(.16,1,.3,1)]"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div
              className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                state.danger
                  ? "bg-rose-50 text-rose-500"
                  : "bg-brand-50 text-brand-500"
              }`}
            >
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-ink-900">
              {state.title || "Are you sure?"}
            </h3>
            {state.description && (
              <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                {state.description}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6">
              <button
                onClick={() => close(false)}
                className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50 transition"
              >
                {state.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition ${
                  state.danger
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                {state.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
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
