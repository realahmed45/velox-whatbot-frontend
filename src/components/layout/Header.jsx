/**
 * Botlify App Header
 * - Account (workspace) switcher — each account is a separate hotel business
 *   with its own channels, billing and data. Accounts are named by the
 *   property/business name, never by a social handle.
 * - User avatar dropdown
 * - Search shortcut
 *
 * NOTE: properties live INSIDE an account and are switched in the sidebar
 * (see PropertySwitcher). Don't conflate the two — "+ Add account" here
 * creates a whole new business, not another property.
 */
import {
  Menu,
  Search,
  LogOut,
  Settings as SettingsIcon,
  CreditCard,
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const pop = {
  initial: { opacity: 0, y: -6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: { type: "spring", stiffness: 420, damping: 30 },
};
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import {
  fetchAccounts,
  switchAccount,
  addAccount,
  planBadge,
} from "@/services/accounts";

export default function Header({ onMenuClick, onSearchClick }) {
  const { workspace } = useWorkspaceStore();
  const { user, logout, activeWorkspace } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
      if (wsRef.current && !wsRef.current.contains(e.target)) setWsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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

  const activeAcc =
    accounts.find((a) => String(a._id) === String(activeWorkspace)) || null;
  const activeLabel = activeAcc?.name || workspace?.name || "Account";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const doSwitch = async (wsId) => {
    if (String(wsId) === String(activeWorkspace)) {
      setWsOpen(false);
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

  return (
    <header className="relative z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-white/70 bg-white/55 px-4 backdrop-blur-2xl backdrop-saturate-150 sm:px-6 shadow-[0_1px_0_rgba(15,23,42,0.05)]">
      {/* Left: mobile menu + search + channel switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="btn-ghost lg:hidden p-2"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onSearchClick}
          className="group flex items-center gap-2.5 rounded-xl bg-white/70 px-3.5 py-2 text-[13px] text-ink-500 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-white hover:text-ink-800 hover:ring-sunset-flame/30 hover:shadow-[0_10px_24px_-12px_rgba(255,106,43,0.45)] sm:min-w-[260px]"
          aria-label="Search"
        >
          <Search className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-[-12deg] group-hover:scale-110" />
          <span className="hidden sm:inline">Search guests, bookings, pages…</span>
          <kbd className="ml-auto hidden rounded-md bg-ink-900/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-ink-400 ring-1 ring-ink-900/[0.06] md:inline">
            ⌘K
          </kbd>
        </button>

        {/* Channel switcher removed — ManyChat-style: unified account view,
            no per-channel toggle. The dashboard shows all connected channels
            at once; disconnected channels surface inline as Connect CTAs. */}
      </div>

      {/* Right: setup pills + user menu */}
      <div className="flex items-center gap-2">
        {/* Account switcher — one identity, many accounts. Always available so
            "+ Add account" is reachable even with a single account. */}
        <div className="relative hidden sm:block" ref={wsRef}>
          <button
            onClick={() => setWsOpen((v) => !v)}
            disabled={busy}
            className="btn-secondary max-w-[210px] gap-2 px-2.5 py-1.5 text-xs"
          >
            <span className="w-5 h-5 rounded-lg bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {(activeAcc?.name?.[0] || initial).toUpperCase()}
            </span>
            <span className="truncate font-medium">{activeLabel}</span>
            {busy ? (
              <Loader2 className="w-3 h-3 text-ink-400 animate-spin flex-shrink-0" />
            ) : (
              <ChevronDown className="w-3 h-3 text-ink-400 flex-shrink-0" />
            )}
          </button>
          <AnimatePresence>{wsOpen && (
            <motion.div {...pop} style={{ transformOrigin: "top right" }} className="glass-strong absolute right-0 z-50 mt-2 w-72 rounded-2xl py-1.5">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                Your accounts
              </p>
              <div className="max-h-80 overflow-y-auto">
                {accounts.map((a) => {
                  const isActive = String(a._id) === String(activeWorkspace);
                  // Secondary line describes the business, never a social
                  // handle. /workspaces/accounts only carries `industry`
                  // alongside the name, so that (or a neutral fallback) it is.
                  const sub = a.industry || "Hotel account";
                  return (
                    <button
                      key={a._id}
                      onClick={() => doSwitch(a._id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-sunset-soft"
                    >
                      <span className="w-8 h-8 rounded-lg bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(a.name?.[0] || "A").toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink-900 truncate">
                          {a.name}
                        </p>
                        <p className="text-[11px] text-ink-400 truncate">
                          {sub}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                          a.lifetime
                            ? "bg-amber-100 text-amber-700"
                            : a.subscriptionStatus === "trialing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {planBadge(a)}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-ink-100 mt-1 pt-1">
                <button
                  onClick={doAddAccount}
                  disabled={busy}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-sunset-soft disabled:opacity-60"
                >
                  <span className="w-8 h-8 rounded-lg border-2 border-dashed border-brand-300 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-brand-600">
                      Add another account
                    </span>
                    <span className="block text-[11px] text-ink-400 leading-snug">
                      A separate business with its own billing. To add a
                      property to this account, use Property &amp; Rooms.
                    </span>
                  </span>
                </button>
              </div>
            </motion.div>
          )}</AnimatePresence>
        </div>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-white transition-transform duration-500 ease-spring hover:scale-110 hover:rotate-6"
            aria-label="Account menu"
          >
            <span className="w-9 h-9 rounded-full bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] flex items-center justify-center text-white font-bold text-xs ">
              {initial}
            </span>
          </button>

          <AnimatePresence>{menuOpen && (
            <motion.div {...pop} style={{ transformOrigin: "top right" }} className="glass-strong absolute right-0 z-50 mt-2 w-56 rounded-2xl py-1.5">
              {/* User info */}
              <div className="px-3 py-2 border-b border-ink-100 mb-1">
                <p className="text-xs font-semibold text-ink-900 truncate">
                  {user?.name || "Account"}
                </p>
                <p className="text-[11px] text-ink-400 truncate">
                  {user?.email}
                </p>
              </div>

              <MenuItem
                icon={SettingsIcon}
                label="Settings"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard/settings");
                }}
              />
              <MenuItem
                icon={CreditCard}
                label="Plan & Billing"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard/billing");
                }}
              />

              <div className="border-t border-ink-100 mt-1 pt-1">
                <MenuItem
                  icon={LogOut}
                  label="Sign out"
                  danger
                  onClick={handleLogout}
                />
              </div>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-2.5 mx-1 px-2.5 py-2 rounded-xl text-xs font-medium transition ${
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-ink-900/[0.04] hover:text-ink-950"
      }`}
      style={{ width: "calc(100% - 0.5rem)" }}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-300 ease-spring group-hover:scale-125" />
      {label}
    </button>
  );
}
