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
        <div className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex gap-4">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
                  state.danger
                    ? "bg-rose-100 text-rose-600"
                    : "bg-brand-100 text-brand-600"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-ink-900">
                  {state.title || "Are you sure?"}
                </h3>
                {state.description && (
                  <p className="text-sm text-ink-500 mt-1">
                    {state.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => close(false)}
                className="btn-secondary"
                autoFocus
              >
                {state.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                className={state.danger ? "btn-danger" : "btn-primary"}
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
