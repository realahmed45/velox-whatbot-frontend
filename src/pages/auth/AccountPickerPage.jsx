/**
 * AccountPicker — the "choose an account" screen shown right after login.
 * One Botlify identity → many accounts (each a workspace with its own hotel,
 * AI, data and billing). Picking one persists it server-side and enters it.
 *
 * - 0 accounts  → straight into onboarding (create the first one).
 * - 1 account   → auto-enter it (no needless click).
 * - 2+ accounts → the picker grid.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Check, Building2, LogOut, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import {
  fetchAccounts,
  switchAccount,
  addAccount,
  deleteAccount,
  planBadge,
} from "@/services/accounts";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import BotlifyMark from "@/components/BotlifyMark";
import { motion } from "framer-motion";
import { Aurora, Reveal } from "@/components/fx";

export default function AccountPickerPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user, logout, setActiveWorkspace } = useAuthStore();
  const [accounts, setAccounts] = useState(null);
  const [entering, setEntering] = useState(null); // id being switched into
  const [removing, setRemoving] = useState(null); // id being deleted

  useEffect(() => {
    let alive = true;
    fetchAccounts()
      .then(({ accounts }) => {
        if (!alive) return;
        if (!accounts.length) {
          // No accounts yet → first-run onboarding.
          navigate("/onboarding/pricing", { replace: true });
          return;
        }
        if (accounts.length === 1) {
          // Only one → skip the picker, enter it directly.
          enter(accounts[0]._id, true);
          return;
        }
        setAccounts(accounts);
      })
      .catch(() => alive && setAccounts([]));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enter = async (wsId, silent = false) => {
    setEntering(wsId);
    try {
      // For the single-account fast path we still persist the choice.
      setActiveWorkspace(wsId);
      await switchAccount(wsId); // persists + hard-navigates to /dashboard
    } catch {
      if (!silent) setEntering(null);
    }
  };

  const create = async () => {
    setEntering("new");
    try {
      await addAccount();
    } catch {
      setEntering(null);
    }
  };

  const remove = async (acc, e) => {
    e.stopPropagation();
    if (accounts.length <= 1) {
      toast.error("This is your only account — you can't delete it.");
      return;
    }
    const ok = await confirm({
      title: `Delete ${acc.name}?`,
      description:
        "This permanently deletes this account's bot, contacts, appointments and settings. If it has a paid subscription, cancel that separately in its Billing page — deleting here does not cancel Creem billing.",
      confirmLabel: "Delete account",
      danger: true,
    });
    if (!ok) return;
    setRemoving(acc._id);
    try {
      await deleteAccount(acc._id);
      setAccounts((list) => list.filter((a) => a._id !== acc._id));
      toast.success("Account deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete account");
    } finally {
      setRemoving(null);
    }
  };

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (accounts === null) {
    return (
      <div className="relative isolate min-h-screen grid place-items-center bg-[#FBFAF8] overflow-hidden">
        <Aurora />
        <div className="w-full max-w-lg px-4 space-y-3" aria-busy="true">
          <div className="mx-auto mb-8 h-14 w-14 rounded-2xl bg-ink-900/[0.04] animate-pulse" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[88px] rounded-2xl bg-ink-900/[0.04] ring-1 ring-ink-900/[0.08] animate-pulse" />
          ))}
          <span className="sr-only">
            <Loader2 className="w-8 h-8 animate-spin" />
            Loading accounts
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen bg-[#FBFAF8] text-ink-950 flex flex-col items-center px-4 py-14 overflow-hidden">
      <Aurora />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />
      <div className="w-full max-w-lg">
        <Reveal className="text-center mb-9">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-20 blur-2xl" />
            <div className="relative">
              <BotlifyMark size={56} className="mx-auto" />
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-ink-950">
            Choose an{" "}
            <span className="font-serif italic font-normal text-sunset">account</span>
          </h1>
          <p className="text-ink-600 mt-2 text-[15px]">
            Signed in as{" "}
            <span className="font-semibold text-ink-950 break-all">{user?.email}</span>
          </p>
        </Reveal>

        <div className="space-y-3">
          {accounts.map((a, i) => {
            const isEntering = entering === a._id;
            return (
              <Reveal key={a._id} delay={0.05 + i * 0.06}>
                <motion.button
                  onClick={() => enter(a._id)}
                  disabled={!!entering}
                  whileHover={entering ? undefined : { y: -3 }}
                  whileTap={entering ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className={`group card w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 text-left disabled:opacity-60 transition-shadow duration-500 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.3),0_18px_40px_-18px_rgba(255,61,119,0.35)] ${
                    isEntering ? "ring-1 ring-sunset-flame/60" : ""
                  }`}
                >
                  <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sunset flex items-center justify-center text-white text-lg font-display font-semibold flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-105">
                      {(a.name?.[0] || "A").toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink-950 truncate">{a.name}</p>
                    <p className="text-sm text-ink-500 truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" /> Hotel workspace
                    </p>
                  </div>
                  <span
                    className={`hidden min-[380px]:inline-flex text-[11px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 ring-1 ring-inset ${
                      a.lifetime
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : a.subscriptionStatus === "trialing"
                          ? "bg-sky-50 text-sky-700 ring-sky-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    }`}
                  >
                    {planBadge(a)}
                  </span>
                  {isEntering ? (
                    <Loader2 className="w-5 h-5 text-sunset-flame animate-spin flex-shrink-0" />
                  ) : (
                    <Check className="w-5 h-5 text-ink-400 flex-shrink-0 transition-all duration-500 ease-spring group-hover:text-sunset-flame group-hover:scale-110" />
                  )}
                  {accounts.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => remove(a, e)}
                      onKeyDown={(e) => e.key === "Enter" && remove(a, e)}
                      title="Delete account"
                      className="flex-shrink-0 h-9 w-9 grid place-items-center rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition duration-300 ease-spring"
                    >
                      {removing === a._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </motion.button>
              </Reveal>
            );
          })}

          <Reveal delay={0.05 + accounts.length * 0.06}>
            <motion.button
              onClick={create}
              disabled={!!entering}
              whileHover={entering ? undefined : { y: -3 }}
              whileTap={entering ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="group w-full flex items-center gap-3 sm:gap-4 border border-dashed border-ink-900/15 hover:border-sunset-flame/50 hover:bg-ink-900/[0.04] rounded-2xl p-3.5 sm:p-4 transition-colors duration-300 text-left text-ink-950 disabled:opacity-60"
            >
              <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-dashed border-sunset-flame/40 bg-sunset-soft flex items-center justify-center flex-shrink-0 text-sunset-flame">
                {entering === "new" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 transition-transform duration-500 ease-spring group-hover:rotate-90" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-display font-semibold">Add another account</p>
                <p className="text-sm text-ink-500">
                  Another hotel — separate AI &amp; billing
                </p>
              </div>
            </motion.button>
          </Reveal>
        </div>

        <div className="text-center mt-9">
          <button
            onClick={signOut}
            className="btn-secondary group text-sm"
          >
            <LogOut className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" />{" "}
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
