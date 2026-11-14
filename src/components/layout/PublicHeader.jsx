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
 * A floating night-glass pill: blur + specular edge, tightens as you scroll,
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
        className={`relative mx-auto max-w-6xl rounded-[22px] bg-night-900/60 ring-1 ring-white/10 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 ease-out-expo ${
          scrolled
            ? "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.1)]"
            : "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        }`}
      >
        {/* sunset filament along the top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sunset-flame/70 to-transparent"
        />
        <div
          className={`flex items-center justify-between pl-4 pr-2 transition-[height] duration-500 ease-out-expo sm:pl-5 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link to="/" className="group flex items-center">
            <span className="transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
              <Logo size="md" dark />
            </span>
          </Link>

          <nav
            className="hidden items-center text-sm font-medium text-white/60 md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {NAV_LINKS.map((l) => {
              const active = !l.anchor && l.to === pathname;
              const inner = (
                <>
                  {hovered === l.label && (
                    <motion.span
                      layoutId="public-nav-hover"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
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
                  className={`${linkCls} hover:text-white`}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  onMouseEnter={() => setHovered(l.label)}
                  className={`${linkCls} ${active ? "text-white" : "hover:text-white"}`}
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
                  className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
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
              className="ml-0.5 grid h-10 w-10 place-items-center rounded-full text-white/70 transition hover:bg-white/[0.08] hover:text-white active:scale-90 md:hidden"
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
              <div className="mx-3 space-y-0.5 border-t border-white/[0.08] py-3 text-sm font-medium text-white/75">
                {NAV_LINKS.map((l, i) => {
                  const cls =
                    "flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06] hover:text-white";
                  const body = (
                    <motion.span
                      className="flex w-full items-center justify-between"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, type: "spring", stiffness: 420, damping: 30 }}
                    >
                      {l.label}
                      <ArrowUpRight className="h-4 w-4 text-white/30" />
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
