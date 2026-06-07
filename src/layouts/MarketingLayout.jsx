import { Link, Outlet } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";

export default function MarketingLayout() {
  const token = useAuthStore((s) => s.token);
  const isAuthed = !!token;
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600">
            <Link to="/#platforms" className="hover:text-ink-900">
              Platforms
            </Link>
            <Link to="/#automations" className="hover:text-ink-900">
              Automations
            </Link>
            <Link to="/#results" className="hover:text-ink-900">
              Results
            </Link>
            <Link to="/pricing" className="hover:text-ink-900">
              Pricing
            </Link>
            <Link to="/guide" className="hover:text-ink-900">
              Guide
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <Link to="/dashboard" className="btn-primary text-sm shadow-glow">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex btn-ghost text-sm"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="bg-ink-950 text-ink-400 py-10 mt-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" dark />
          <p className="text-xs order-last sm:order-none">
            © {new Date().getFullYear()} Botlify. Built for creators.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/pricing" className="hover:text-white transition">
              Pricing
            </Link>
            <Link to="/guide" className="hover:text-white transition">
              Guide
            </Link>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
