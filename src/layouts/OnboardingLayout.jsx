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
import Logo from "@/components/Logo";

export default function OnboardingLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-ink-50 via-white to-brand-50/30 flex flex-col overflow-hidden">
      {/* Ambient glass backdrop — matches the dashboard aesthetic */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[36rem] h-[36rem] rounded-full bg-brand-200/40 blur-[130px]" />
        <div className="absolute top-1/2 -left-24 w-[30rem] h-[30rem] rounded-full bg-amber-200/30 blur-[130px]" />
      </div>

      {/* Top bar */}
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <Logo size="sm" />
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
      <main className="relative flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
