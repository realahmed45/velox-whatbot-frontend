import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";

/**
 * Shared public header — the landing page and every marketing page (pricing,
 * guide, docs, help, legal) draw the same bar.
 *
 * Quiet by design: transparent at the top, a solid white bar with a 1px
 * hairline once you scroll. No blur, no glow, no magnetic buttons.
 *
 * On "/" the section links are in-page anchors; elsewhere they point back at
 * "/#section" so they still work.
 */
const HOME_NAV = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Guide", to: "/guide" },
];

const SITE_NAV = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Guide", to: "/guide" },
  { label: "Consultants", to: "/consultants" },
  { label: "Help", to: "/help" },
];

function NavItem({ l, className, onClick, active }) {
  return l.to ? (
    <Link to={l.to} className={className} onClick={onClick} aria-current={active ? "page" : undefined}>
      {l.label}
    </Link>
  ) : (
    <a href={l.href} className={className} onClick={onClick}>
      {l.label}
    </a>
  );
}

export default function PublicHeader() {
  const isAuthed = !!useAuthStore((s) => s.token);
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Close the mobile sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  const links = pathname === "/" ? HOME_NAV : SITE_NAV;
  const solid = scrolled || open;

  return (
    <header
      className={`sticky top-0 z-50 font-geist transition-[background-color,border-color] duration-200 ${
        solid ? "border-b border-ink-200/80 bg-white" : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Botlify home" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="hidden items-center gap-0.5 md:flex">
            {links.map((l) => {
              const active = l.to && l.to === pathname;
              return (
                <NavItem
                  key={l.label}
                  l={l}
                  active={active}
                  className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                    active ? "text-ink-950" : "text-ink-500 hover:text-ink-950"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link
              to="/dashboard"
              className="hidden h-9 items-center gap-1.5 rounded-lg bg-ink-950 px-3.5 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(2,6,23,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors hover:bg-ink-800 sm:inline-flex"
            >
              Open dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden h-9 items-center rounded-lg px-3 text-[14px] text-ink-600 transition-colors hover:text-ink-950 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-950 px-3.5 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(2,6,23,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors hover:bg-ink-800"
              >
                Start free
              </Link>
            </>
          )}
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-700 ring-1 ring-ink-200 transition-colors hover:bg-ink-50 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute inset-x-0 top-full border-b border-ink-200/80 bg-white px-4 pb-5 pt-2 shadow-[0_16px_32px_-16px_rgba(15,23,42,0.18)] md:hidden"
          >
            {links.map((l) => (
              <NavItem
                key={l.label}
                l={l}
                onClick={() => setOpen(false)}
                className="block border-b border-ink-100 py-3 text-[15px] text-ink-800 last:border-0"
              />
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {isAuthed ? (
                <Link
                  to="/dashboard"
                  className="col-span-2 inline-flex h-11 items-center justify-center rounded-lg bg-ink-950 text-[14px] font-medium text-white"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-lg text-[14px] font-medium text-ink-900 ring-1 ring-ink-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-950 text-[14px] font-medium text-white"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
