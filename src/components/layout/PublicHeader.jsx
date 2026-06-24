import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";

/**
 * Shared public marketing header — used on the landing page, pricing, guide,
 * privacy and terms so every public page has identical chrome.
 *
 * Anchor links point at "/#section" so they work from any page (navigate home
 * then scroll); real routes use <Link>.
 */
const NAV_LINKS = [
  { label: "Features", href: "/#features", anchor: true },
  { label: "Results", href: "/#results", anchor: true },
  { label: "Pricing", to: "/pricing" },
  { label: "Guide", to: "/guide" },
];

export default function PublicHeader() {
  const token = useAuthStore((s) => s.token);
  const isAuthed = !!token;
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600">
          {NAV_LINKS.map((l) =>
            l.anchor ? (
              <a key={l.label} href={l.href} className="hover:text-ink-900">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.to} className="hover:text-ink-900">
                {l.label}
              </Link>
            ),
          )}
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
          <button
            className="md:hidden ml-1 p-2 rounded-md hover:bg-ink-50"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            <ChevronDown
              className={`w-5 h-5 transition ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white px-4 py-3 space-y-2 text-sm font-medium text-ink-700">
          {NAV_LINKS.map((l) =>
            l.anchor ? (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                {l.label}
              </Link>
            ),
          )}
        </div>
      )}
    </header>
  );
}
