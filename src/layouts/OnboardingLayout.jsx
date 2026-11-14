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
import { Aurora } from "@/components/fx";

export default function OnboardingLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-[#FBFAF8] text-ink-950">
      {/* Warm light canvas — static sunset aurora, faint dot grid */}
      <Aurora />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      {/* Top bar — floating light-glass pill */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between rounded-[20px] bg-white/80 pl-4 pr-2 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25),inset_0_1px_0_#fff] ring-1 ring-ink-900/[0.07] backdrop-blur-xl sm:pl-5">
          <Link to="/dashboard" className="group flex items-center">
            <span className="transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
              <Logo size="sm" />
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user?.email && (
              <span className="hidden max-w-[16rem] truncate rounded-full bg-ink-900/[0.04] px-3 py-1 text-xs text-ink-600 ring-1 ring-ink-900/[0.06] sm:inline">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="group inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-ink-600 transition hover:bg-ink-900/[0.05] hover:text-ink-950 active:scale-95"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />
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
