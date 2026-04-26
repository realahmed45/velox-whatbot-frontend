import {
  Menu,
  Search,
  LogOut,
  User,
  Settings as SettingsIcon,
  CreditCard,
  ChevronDown,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

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

  const usagePct = workspace
    ? Math.round(
        (workspace.usage?.messagesThisMonth /
          (workspace.usage?.messagesLimit || 1)) *
          100,
      )
    : 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const workspaces = user?.workspaces || [];
  const igPic = workspace?.instagram?.profilePicture;
  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const switchWorkspace = (wsId) => {
    setActiveWorkspace(wsId);
    setWsOpen(false);
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-ink-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ink-200 bg-ink-50 hover:bg-white hover:border-ink-300 text-sm text-ink-500 transition"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search or jump toâ€¦</span>
          <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white border border-ink-200 font-mono text-ink-400">
            âŒ˜K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Workspace switcher */}
        {workspaces.length > 0 && (
          <div className="relative hidden sm:block" ref={wsRef}>
            <button
              onClick={() => setWsOpen((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 text-sm text-ink-700 transition max-w-[180px]"
              aria-label="Switch workspace"
            >
              <span className="truncate">{workspace?.name || "Workspace"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
            </button>
            {wsOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-ink-100 rounded-xl shadow-lg py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                  Workspaces
                </div>
                {workspaces.map((w) => {
                  const id = w._id || w;
                  const name = w.name || workspace?.name || "Workspace";
                  const isActive = id === activeWorkspace;
                  return (
                    <button
                      key={id}
                      onClick={() => switchWorkspace(id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-ink-50 text-ink-700"
                    >
                      <span className="truncate">{name}</span>
                      {isActive && (
                        <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {workspace && (
          <button
            onClick={() => navigate("/dashboard/billing")}
            className="hidden md:flex items-center gap-2 text-xs text-ink-500 hover:text-ink-700 transition"
            aria-label={`Usage ${usagePct}%`}
          >
            <span>Messages:</span>
            <div className="w-24 h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePct > 90
                    ? "bg-rose-500"
                    : usagePct > 70
                      ? "bg-amber-400"
                      : "bg-brand-500"
                }`}
                style={{ width: `${Math.min(usagePct, 100)}%` }}
              />
            </div>
            <span className="font-medium text-ink-700">{usagePct}%</span>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shadow-glow hover:ring-2 hover:ring-brand-200 transition active:scale-95"
            aria-label="Account menu"
          >
            {igPic ? (
              <img
                src={igPic}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-semibold text-sm">
                {initial}
              </span>
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-ink-100 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-ink-100">
                <p className="text-sm font-medium text-ink-900 truncate">
                  {user?.name || user?.email}
                </p>
                {user?.email && (
                  <p className="text-xs text-ink-500 truncate">{user.email}</p>
                )}
              </div>
              <MenuItem
                icon={User}
                label="Profile"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard/settings");
                }}
              />
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
                label="Billing"
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
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-ink-50 ${
        danger ? "text-rose-600" : "text-ink-700"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
