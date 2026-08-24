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
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-ink-100 flex items-center justify-between px-4 sm:px-5 flex-shrink-0 z-10">
      {/* Left: mobile menu + search + channel switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-ink-500 hover:bg-ink-50"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-ink-200 bg-ink-50/70 hover:bg-white hover:border-brand-300 text-[13px] text-ink-500 transition"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white border border-ink-200 font-mono text-ink-400">
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
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 hover:border-brand-300 text-xs text-ink-700 transition max-w-[190px] disabled:opacity-60"
          >
            <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {(activeAcc?.name?.[0] || initial).toUpperCase()}
            </span>
            <span className="truncate font-medium">{activeLabel}</span>
            {busy ? (
              <Loader2 className="w-3 h-3 text-ink-400 animate-spin flex-shrink-0" />
            ) : (
              <ChevronDown className="w-3 h-3 text-ink-400 flex-shrink-0" />
            )}
          </button>
          {wsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-white/60 shadow-glass rounded-xl py-1.5 z-50">
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
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-brand-50 text-left"
                    >
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-brand-50 text-left disabled:opacity-60"
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
            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-brand-200 transition"
            aria-label="Account menu"
          >
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-glow">
              {initial}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-xl border border-white/60 shadow-glass rounded-xl py-1.5 z-50">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 mx-1 px-2.5 py-2 rounded-lg text-xs transition ${
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-brand-50 hover:text-brand-700"
      }`}
      style={{ width: "calc(100% - 0.5rem)" }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </button>
  );
}
