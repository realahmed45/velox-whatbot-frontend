import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import { Magnetic } from "@/components/fx";

/**
 * Shared public marketing header — used on the landing page, pricing, guide,
 * privacy and terms so every public page has identical chrome.
 *
 * A floating light-glass pill: blur + specular edge, tightens as you scroll,
 * hover highlight glides between links, and the CTA leans toward the pointer.
 *
 * Anchor links point at "/#section" so they work from any page (navigate home
 * then scroll); real routes use <Link>.
 */
const FULL_NAV = [
  { label: "Features", href: "/#features", anchor: true },
  { label: "Results", href: "/#results", anchor: true },
  { label: "Pricing", to: "/pricing" },
  { label: "Consultants", to: "/consultants" },
  { label: "Docs", to: "/docs" },
];

// On pages that AREN'T the landing page (pricing, guide), the home-anchor links
// (#features / #results) would jump away — so keep it minimal: just Home +
// Pricing, nothing more.
const MINIMAL_NAV = [
  { label: "Home", to: "/" },
  { label: "Pricing", to: "/pricing" },
];

export default function PublicHeader() {
  const token = useAuthStore((s) => s.token);
  const isAuthed = !!token;
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Simplified nav on the standalone marketing pages.
  const minimal = pathname === "/pricing" || pathname === "/guide";
  const NAV_LINKS = minimal ? MINIMAL_NAV : FULL_NAV;

  const linkCls = "relative z-10 rounded-full px-3.5 py-2 transition-colors duration-200";

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`relative mx-auto max-w-6xl rounded-[22px] bg-white/80 ring-1 ring-ink-900/[0.07] backdrop-blur-xl transition-all duration-500 ease-out-expo ${
          scrolled
            ? "shadow-[0_16px_40px_-18px_rgba(15,23,42,0.25),inset_0_1px_0_#fff]"
            : "shadow-[0_4px_16px_-10px_rgba(15,23,42,0.15),inset_0_1px_0_#fff]"
        }`}
      >
        {/* sunset filament along the top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sunset-flame/50 to-transparent"
        />
        <div
          className={`flex items-center justify-between pl-4 pr-2 transition-[height] duration-500 ease-out-expo sm:pl-5 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link to="/" className="group flex items-center">
            <span className="transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
              <Logo size="md" />
            </span>
          </Link>

          <nav
            className="hidden items-center text-sm font-medium text-ink-600 md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {NAV_LINKS.map((l) => {
              const active = !l.anchor && l.to === pathname;
              const inner = (
                <>
                  {hovered === l.label && (
                    <motion.span
                      layoutId="public-nav-hover"
                      className="absolute inset-0 -z-10 rounded-full bg-ink-900/[0.05]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-px rounded-full bg-sunset" aria-hidden />
                  )}
                </>
              );
              return l.anchor ? (
                <a
                  key={l.label}
                  href={l.href}
                  onMouseEnter={() => setHovered(l.label)}
                  className={`${linkCls} hover:text-ink-950`}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  onMouseEnter={() => setHovered(l.label)}
                  className={`${linkCls} ${active ? "text-ink-950" : "hover:text-ink-950"}`}
                >
                  {inner}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {isAuthed ? (
              <Magnetic strength={0.25}>
                <Link to="/dashboard" className="btn-primary rounded-full px-4 text-sm">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              </Magnetic>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-900/[0.05] hover:text-ink-950 sm:inline-flex"
                >
                  Sign in
                </Link>
                <Magnetic strength={0.25}>
                  <Link to="/register" className="btn-primary group rounded-full px-4 text-sm">
                    Start free
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </Magnetic>
              </>
            )}
            <button
              className="ml-0.5 grid h-10 w-10 place-items-center rounded-full text-ink-700 transition hover:bg-ink-900/[0.05] hover:text-ink-950 active:scale-90 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="menu"
              aria-expanded={open}
            >
              <ChevronDown className={`h-5 w-5 transition-transform duration-500 ease-spring ${open ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="overflow-hidden md:hidden"
            >
              <div className="mx-3 space-y-0.5 border-t border-ink-900/[0.07] py-3 text-sm font-medium text-ink-700">
                {NAV_LINKS.map((l, i) => {
                  const cls =
                    "flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-ink-900/[0.04] hover:text-ink-950";
                  const body = (
                    <motion.span
                      className="flex w-full items-center justify-between"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, type: "spring", stiffness: 420, damping: 30 }}
                    >
                      {l.label}
                      <ArrowUpRight className="h-4 w-4 text-ink-400" />
                    </motion.span>
                  );
                  return l.anchor ? (
                    <a key={l.label} href={l.href} onClick={() => setOpen(false)} className={cls}>
                      {body}
                    </a>
                  ) : (
                    <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className={cls}>
                      {body}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
