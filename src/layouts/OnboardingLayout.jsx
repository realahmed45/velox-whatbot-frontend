/**
 * OnboardingLayout — full-screen, sidebar-less layout for first-time setup.
 *
 * Used by /onboarding/* routes. Shows only the Botlify logo, a workspace
 * indicator, and a logout link. The dashboard sidebar/header NEVER render
 * until the user has connected at least one channel.
 */
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";

export default function OnboardingLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-brand-50/30 flex flex-col">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur border-b border-ink-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-bold text-ink-900">Botlify</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:inline text-xs text-ink-500">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-500 hover:text-ink-800 hover:bg-ink-50 rounded-md transition"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
