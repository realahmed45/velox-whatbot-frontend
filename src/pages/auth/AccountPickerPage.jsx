/**
 * AccountPicker — the "choose an account" screen shown right after login.
 * One Botlify identity → many accounts (each a workspace with its own IG, bot,
 * data and billing). Picking one persists it server-side and enters it.
 *
 * - 0 accounts  → straight into onboarding (create the first one).
 * - 1 account   → auto-enter it (no needless click).
 * - 2+ accounts → the picker grid.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Check, Instagram, LogOut, Trash2 } from "lucide-react";
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
      <div className="relative isolate min-h-screen grid place-items-center bg-night-950 overflow-hidden grain">
        <Aurora variant="dark" />
        <div className="w-full max-w-lg px-4 space-y-3" aria-busy="true">
          <div className="mx-auto mb-8 h-14 w-14 rounded-2xl bg-white/[0.06] animate-pulse" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[88px] rounded-2xl bg-white/[0.05] ring-1 ring-white/[0.06] animate-pulse" />
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
    <div className="relative isolate min-h-screen bg-night-950 text-white flex flex-col items-center px-4 py-14 overflow-hidden grain">
      <Aurora variant="dark" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-dot-grid-dark opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />
      <div className="w-full max-w-lg">
        <Reveal className="text-center mb-9">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-25 blur-2xl" />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <BotlifyMark size={56} className="mx-auto" />
            </motion.div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
            Choose an{" "}
            <span className="font-serif italic font-normal text-sunset">account</span>
          </h1>
          <p className="text-white/60 mt-2 text-[15px]">
            Signed in as{" "}
            <span className="font-semibold text-white break-all">{user?.email}</span>
          </p>
        </Reveal>

        <div className="space-y-3">
          {accounts.map((a, i) => {
            const handle = a.instagram?.username
              ? `@${a.instagram.username}`
              : "No Instagram connected";
            const isEntering = entering === a._id;
            return (
              <Reveal key={a._id} delay={0.05 + i * 0.06}>
                <motion.button
                  onClick={() => enter(a._id)}
                  disabled={!!entering}
                  whileHover={entering ? undefined : { y: -3 }}
                  whileTap={entering ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className={`group card-dark w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 text-left disabled:opacity-60 transition-shadow duration-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_rgba(255,106,43,0.35),0_20px_50px_-20px_rgba(255,61,119,0.55)] ${
                    isEntering ? "ring-1 ring-sunset-flame/60" : ""
                  }`}
                >
                  {a.instagram?.profilePicture ? (
                    <img
                      src={a.instagram.profilePicture}
                      alt=""
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover flex-shrink-0 ring-1 ring-white/15 transition-transform duration-500 ease-spring group-hover:-rotate-3 group-hover:scale-105"
                    />
                  ) : (
                    <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sunset flex items-center justify-center text-white text-lg font-display font-semibold flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-105">
                      {(a.name?.[0] || "A").toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white truncate">{a.name}</p>
                    <p className="text-sm text-white/50 truncate flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 flex-shrink-0" /> {handle}
                    </p>
                  </div>
                  <span
                    className={`hidden min-[380px]:inline-flex text-[11px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 ring-1 ring-inset ${
                      a.lifetime
                        ? "bg-amber-400/15 text-amber-200 ring-amber-300/25"
                        : a.subscriptionStatus === "trialing"
                          ? "bg-sky-400/15 text-sky-200 ring-sky-300/25"
                          : "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25"
                    }`}
                  >
                    {planBadge(a)}
                  </span>
                  {isEntering ? (
                    <Loader2 className="w-5 h-5 text-sunset-gold animate-spin flex-shrink-0" />
                  ) : (
                    <Check className="w-5 h-5 text-white/25 flex-shrink-0 transition-all duration-500 ease-spring group-hover:text-sunset-gold group-hover:scale-110" />
                  )}
                  {accounts.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => remove(a, e)}
                      onKeyDown={(e) => e.key === "Enter" && remove(a, e)}
                      title="Delete account"
                      className="flex-shrink-0 h-9 w-9 grid place-items-center rounded-lg text-white/30 hover:text-rose-300 hover:bg-rose-500/15 active:scale-90 transition duration-300 ease-spring"
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
              className="group w-full flex items-center gap-3 sm:gap-4 border border-dashed border-white/15 hover:border-sunset-flame/50 hover:bg-white/[0.03] rounded-2xl p-3.5 sm:p-4 transition-colors duration-300 text-left text-white disabled:opacity-60"
            >
              <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-dashed border-sunset-gold/40 bg-sunset-soft flex items-center justify-center flex-shrink-0 text-sunset-gold">
                {entering === "new" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 transition-transform duration-500 ease-spring group-hover:rotate-90" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-display font-semibold">Add another account</p>
                <p className="text-sm text-white/50">
                  Connect a new Instagram — separate bot &amp; billing
                </p>
              </div>
            </motion.button>
          </Reveal>
        </div>

        <div className="text-center mt-9">
          <button
            onClick={signOut}
            className="btn-glass-dark group text-sm"
          >
            <LogOut className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" />{" "}
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
