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
    <div className="grain relative isolate flex min-h-screen flex-col overflow-x-clip bg-night-950 text-white">
      {/* Cinematic canvas — night, slow sunset aurora, faint dot grid */}
      <Aurora variant="dark" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid-dark opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      {/* Top bar — floating night-glass pill */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between rounded-[20px] bg-night-900/60 pl-4 pr-2 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10 backdrop-blur-2xl backdrop-saturate-150 sm:pl-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sunset-flame/60 to-transparent"
          />
          <Link to="/dashboard" className="group flex items-center">
            <span className="transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
              <Logo size="sm" dark />
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user?.email && (
              <span className="hidden max-w-[16rem] truncate rounded-full bg-white/[0.05] px-3 py-1 text-xs text-white/55 ring-1 ring-white/[0.08] sm:inline">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="group inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
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
