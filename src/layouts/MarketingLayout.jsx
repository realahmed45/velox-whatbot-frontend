import { Link, Outlet } from "react-router-dom";
import Logo from "@/components/Logo";
import PublicHeader from "@/components/layout/PublicHeader";

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
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
