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
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-brand-50/40 to-white">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 via-white to-white flex flex-col items-center px-4 py-14">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <BotlifyMark size={56} className="mx-auto mb-4" />
          <h1 className="text-3xl font-black text-ink-900 tracking-tight">
            Choose an account
          </h1>
          <p className="text-ink-500 mt-2">
            Signed in as{" "}
            <span className="font-semibold text-ink-700">{user?.email}</span>
          </p>
        </div>

        <div className="space-y-3">
          {accounts.map((a) => {
            const handle = a.instagram?.username
              ? `@${a.instagram.username}`
              : "No Instagram connected";
            const isEntering = entering === a._id;
            return (
              <button
                key={a._id}
                onClick={() => enter(a._id)}
                disabled={!!entering}
                className="w-full flex items-center gap-4 bg-white border border-ink-200 hover:border-brand-400 hover:shadow-lg rounded-2xl p-4 transition text-left disabled:opacity-60"
              >
                {a.instagram?.profilePicture ? (
                  <img
                    src={a.instagram.profilePicture}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                    {(a.name?.[0] || "A").toUpperCase()}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-900 truncate">{a.name}</p>
                  <p className="text-sm text-ink-500 truncate flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5" /> {handle}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                    a.lifetime
                      ? "bg-amber-100 text-amber-700"
                      : a.subscriptionStatus === "trialing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {planBadge(a)}
                </span>
                {isEntering ? (
                  <Loader2 className="w-5 h-5 text-brand-500 animate-spin flex-shrink-0" />
                ) : (
                  <Check className="w-5 h-5 text-ink-300 flex-shrink-0" />
                )}
                {accounts.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => remove(a, e)}
                    onKeyDown={(e) => e.key === "Enter" && remove(a, e)}
                    title="Delete account"
                    className="flex-shrink-0 p-1.5 rounded-lg text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition"
                  >
                    {removing === a._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={create}
            disabled={!!entering}
            className="w-full flex items-center gap-4 border-2 border-dashed border-ink-200 hover:border-brand-400 rounded-2xl p-4 transition text-left text-brand-600 disabled:opacity-60"
          >
            <span className="w-14 h-14 rounded-full border-2 border-dashed border-brand-300 flex items-center justify-center flex-shrink-0">
              {entering === "new" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </span>
            <div>
              <p className="font-bold">Add another account</p>
              <p className="text-sm text-brand-500/80">
                Connect a new Instagram — separate bot &amp; billing
              </p>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 transition"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
