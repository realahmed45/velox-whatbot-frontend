import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";

/**
 * Shared public header — the landing page and every marketing page draw it.
 *
 * tone="dark"  → for the black homepage hero: transparent at the top, a black
 *                bar (the only backdrop-blur on the site) once you scroll.
 * tone="light" → default for white marketing pages: white bar on scroll.
 *
 * Primary action is always orange with black text (AA). On "/" the section
 * links are in-page anchors; elsewhere they point back at "/#section".
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

const CTA =
  "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FF5A1F] px-4 text-[14px] font-semibold text-[#0A0A0A] transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-[#FF6B33] active:translate-y-0 active:scale-[0.97]";

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

export default function PublicHeader({ tone = "light" }) {
  const isAuthed = !!useAuthStore((s) => s.token);
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dark = tone === "dark";

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

  const bar = dark
    ? solid
      ? "border-b border-white/10 bg-[#0A0A0A]/85 backdrop-blur-md"
      : "border-b border-transparent bg-transparent"
    : solid
      ? "border-b border-neutral-200 bg-white"
      : "border-b border-transparent bg-transparent";

  const linkIdle = dark ? "text-white/65 hover:text-white" : "text-neutral-600 hover:text-[#0A0A0A]";
  const linkActive = dark ? "text-white" : "text-[#0A0A0A]";

  return (
    <header className={`sticky top-0 z-50 font-geist transition-[background-color,border-color] duration-200 ${bar}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Botlify home" className="shrink-0">
            <Logo size="sm" dark={dark} />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.to && l.to === pathname;
              return (
                <NavItem
                  key={l.label}
                  l={l}
                  active={active}
                  className={`group relative rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors ${
                    active ? linkActive : linkIdle
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link to="/dashboard" className={`${CTA} hidden sm:inline-flex`}>
              Open dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden h-9 items-center rounded-full px-3.5 text-[14px] font-medium transition-colors sm:inline-flex ${linkIdle}`}
              >
                Sign in
              </Link>
              <Link to="/register" className={CTA}>
                Start free trial
              </Link>
            </>
          )}
          <button
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors md:hidden ${
              dark ? "text-white ring-1 ring-white/20 hover:bg-white/10" : "text-[#0A0A0A] ring-1 ring-neutral-300 hover:bg-neutral-100"
            }`}
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
            className={`absolute inset-x-0 top-full px-4 pb-5 pt-2 md:hidden ${
              dark
                ? "border-b border-white/10 bg-[#0A0A0A]"
                : "border-b border-neutral-200 bg-white shadow-[0_16px_32px_-16px_rgba(10,10,10,0.18)]"
            }`}
          >
            {links.map((l) => (
              <NavItem
                key={l.label}
                l={l}
                onClick={() => setOpen(false)}
                className={`block border-b py-3.5 text-[16px] font-medium last:border-0 ${
                  dark ? "border-white/10 text-white" : "border-neutral-100 text-[#0A0A0A]"
                }`}
              />
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {isAuthed ? (
                <Link
                  to="/dashboard"
                  className="col-span-2 inline-flex h-12 items-center justify-center rounded-full bg-[#FF5A1F] text-[15px] font-semibold text-[#0A0A0A]"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`inline-flex h-12 items-center justify-center rounded-full text-[15px] font-semibold ring-1 ${
                      dark ? "text-white ring-white/25" : "text-[#0A0A0A] ring-neutral-300"
                    }`}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#FF5A1F] text-[15px] font-semibold text-[#0A0A0A]"
                  >
                    Start free trial
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
