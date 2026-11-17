/**
 * Account (workspace) switcher — each account is a separate hotel business
 * with its own channels, billing and data. Accounts are named by the
 * property/business name, never by a social handle.
 *
 * NOTE: properties live INSIDE an account (see PropertySwitcher). "+ Add
 * account" here creates a whole new business, not another property.
 *
 * variant="chip"  → compact trigger + dropdown (top bar)
 * variant="list"  → inline list (mobile "More" sheet)
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { clsx } from "clsx";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { fetchAccounts, switchAccount, addAccount, planBadge } from "@/services/accounts";

const pop = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } },
  transition: { type: "spring", stiffness: 520, damping: 36 },
};

function useAccounts() {
  const { workspace } = useWorkspaceStore();
  const { user, activeWorkspace } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [busy, setBusy] = useState(false);

  // Load the real, populated account list (name + plan + status) once.
  useEffect(() => {
    let alive = true;
    fetchAccounts()
      .then(({ accounts }) => alive && setAccounts(accounts))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const initial = (user?.name?.[0] || user?.email?.[0] || "B").toUpperCase();
  const activeAcc = accounts.find((a) => String(a._id) === String(activeWorkspace)) || null;
  const activeLabel = activeAcc?.name || workspace?.name || "Account";

  const doSwitch = async (wsId, close) => {
    if (String(wsId) === String(activeWorkspace)) {
      close?.();
      return;
    }
    setBusy(true);
    try {
      await switchAccount(wsId); // persists + hard-reloads
    } catch {
      setBusy(false);
    }
  };

  const doAddAccount = async () => {
    setBusy(true);
    try {
      await addAccount(); // creates ws + routes into onboarding
    } catch {
      setBusy(false);
    }
  };

  return { accounts, busy, initial, activeAcc, activeLabel, activeWorkspace, doSwitch, doAddAccount };
}

function AccountRows({ state, close }) {
  const { accounts, busy, activeWorkspace, doSwitch, doAddAccount } = state;
  return (
    <>
      <p className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Your accounts</p>
      <div className="max-h-72 overflow-y-auto px-1.5">
        {accounts.map((a) => {
          const isActive = String(a._id) === String(activeWorkspace);
          // Secondary line describes the business, never a social handle.
          const sub = a.industry || "Hotel account";
          return (
            <button
              key={a._id}
              onClick={() => doSwitch(a._id, close)}
              className={clsx(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                isActive ? "bg-[#FFF1EA]" : "hover:bg-neutral-100",
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0A0A0A] text-xs font-bold text-white">
                {(a.name?.[0] || "A").toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-neutral-950">{a.name}</span>
                <span className="block truncate text-[11.5px] text-neutral-500">{sub}</span>
              </span>
              <span
                className={clsx(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  a.lifetime
                    ? "bg-amber-100 text-amber-700"
                    : a.subscriptionStatus === "trialing"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-emerald-100 text-emerald-700",
                )}
              >
                {planBadge(a)}
              </span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-[#FF5A1F]" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>
      <div className="mx-1.5 mt-1 border-t border-black/[0.06] pt-1">
        <button
          onClick={doAddAccount}
          disabled={busy}
          className="group flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-neutral-100 disabled:opacity-60"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-dashed border-[#FF5A1F]/50 text-[#FF5A1F]">
            <Plus className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:rotate-90" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-[#E84A12]">Add another account</span>
            <span className="block text-[11.5px] leading-snug text-neutral-500">
              A separate business with its own billing. To add a property to this account, use Property &amp; Rooms.
            </span>
          </span>
        </button>
      </div>
    </>
  );
}

export default function AccountSwitcher({ variant = "chip", className }) {
  const state = useAccounts();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "list") {
    return (
      <div className={clsx("surface py-1.5", className)}>
        <AccountRows state={state} />
      </div>
    );
  }

  const { busy, activeAcc, activeLabel, initial } = state;
  return (
    <div className={clsx("relative", className)} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        title={activeLabel}
        className={clsx(
          "flex h-9 max-w-[200px] items-center gap-2 rounded-full pl-1 pr-2.5 text-[13px] font-medium ring-1 transition active:scale-[0.97]",
          open ? "bg-neutral-100 ring-black/[0.1]" : "bg-white ring-black/[0.08] hover:bg-neutral-50 hover:ring-black/[0.14]",
        )}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0A0A0A] text-[11px] font-bold text-white">
          {(activeAcc?.name?.[0] || initial).toUpperCase()}
        </span>
        <span className="hidden truncate text-neutral-900 xl:inline">{activeLabel}</span>
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-neutral-400" />
        ) : (
          <ChevronDown className={clsx("h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-300 ease-spring", open && "rotate-180")} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...pop} style={{ transformOrigin: "top right" }} className="popover absolute right-0 z-50 mt-2.5 w-80 py-1.5">
            <AccountRows state={state} close={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
