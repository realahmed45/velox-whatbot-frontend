import { Link, Outlet } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";

export default function MarketingLayout() {
  const token = useAuthStore((s) => s.token);
  const isAuthed = !!token;
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-ink-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-ink-600">
            <Link to="/" className="hover:text-ink-900">
              Home
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
                <Link to="/login" className="btn-ghost text-sm">
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
      <footer className="bg-ink-950 text-ink-400 py-10 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs">
            © {new Date().getFullYear()} Botlify. Built for creators.
          </p>
          <div className="flex gap-5 text-sm">
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
