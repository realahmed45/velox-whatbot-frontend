/**
 * Botlify App Header
 * - Workspace (account) switcher — ManyChat-style multi-account UX.
 * - Setup Instagram + Setup WhatsApp buttons when not connected
 * - User avatar dropdown
 * - Search shortcut
 *
 * Design: rectangular, no rounded corners — clean enterprise look.
 */
import {
  Menu,
  Search,
  LogOut,
  Settings as SettingsIcon,
  CreditCard,
  ChevronDown,
  Check,
  Instagram,
  MessageSquare,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

export default function Header({ onMenuClick, onSearchClick }) {
  const { workspace } = useWorkspaceStore();
  const { user, logout, activeWorkspace, setActiveWorkspace } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
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

  const igConnected = workspace?.instagram?.status === "connected";

  const workspaces = user?.workspaces || [];
  const igPic = igConnected ? workspace?.instagram?.profilePicture : null;
  const initial = (user?.name?.[0] || user?.email?.[0] || "B").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const switchWorkspace = (wsId) => {
    setActiveWorkspace(wsId);
    setWsOpen(false);
    window.location.reload();
  };

  const startIgOAuth = async () => {
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      /* api interceptor shows error toast */
    }
  };

  return (
    <header className="h-14 bg-white border-b border-ink-200 flex items-center justify-between px-4 sm:px-5 flex-shrink-0 z-10">
      {/* Left: mobile menu + search + channel switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ink-500 hover:bg-ink-50"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 border border-ink-200 bg-ink-50 hover:bg-white hover:border-ink-300 text-xs text-ink-500 transition"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 bg-white border border-ink-200 font-mono text-ink-400">
            ⌘K
          </kbd>
        </button>

        {/* Channel switcher removed — ManyChat-style: unified account view,
            no per-channel toggle. The dashboard shows all connected channels
            at once; disconnected channels surface inline as Connect CTAs. */}
      </div>

      {/* Right: setup pills + user menu */}
      <div className="flex items-center gap-2">
        {/* Setup Instagram — shown when not yet connected */}
        {!igConnected && (
          <button
            onClick={startIgOAuth}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-xs font-semibold text-pink-600 transition"
          >
            <Instagram className="w-3.5 h-3.5" />
            Setup Instagram
          </button>
        )}

        {/* Workspace switcher (only when multiple) */}
        {workspaces.length > 1 && (
          <div className="relative hidden sm:block" ref={wsRef}>
            <button
              onClick={() => setWsOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-ink-200 hover:bg-ink-50 text-xs text-ink-700 transition max-w-[140px]"
            >
              <span className="truncate">{workspace?.name || "Workspace"}</span>
              <ChevronDown className="w-3 h-3 text-ink-400 flex-shrink-0" />
            </button>
            {wsOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-ink-200 shadow-lg py-1.5 z-50">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                  Switch workspace
                </p>
                {workspaces.map((w) => {
                  const id = w._id || w;
                  const name = w.name || "Workspace";
                  const isActive = id === activeWorkspace;
                  return (
                    <button
                      key={id}
                      onClick={() => switchWorkspace(id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-ink-50 text-ink-700"
                    >
                      <span className="truncate">{name}</span>
                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-violet-200 transition"
            aria-label="Account menu"
          >
            {igPic ? (
              <img src={igPic} alt="" className="w-8 h-8 object-cover" />
            ) : (
              <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                {initial}
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-ink-200 shadow-lg py-1.5 z-50">
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
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition ${
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-ink-50"
      }`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </button>
  );
}
