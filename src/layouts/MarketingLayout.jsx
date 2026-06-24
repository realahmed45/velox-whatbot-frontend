import { Link, Outlet } from "react-router-dom";
import Logo from "@/components/Logo";
import PublicHeader from "@/components/layout/PublicHeader";

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
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
