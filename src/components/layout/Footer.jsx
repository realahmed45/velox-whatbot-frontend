/**
 * Botlify Unified Footer
 * One footer for the marketing site — night canvas, a big editorial sign-off,
 * then the link columns. Hover: links slide, icons hop.
 */
import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { Magnetic } from "@/components/fx";

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-white/55 transition-colors duration-300 hover:text-white"
    >
      <span className="transition-transform duration-500 ease-spring group-hover:translate-x-0.5">{children}</span>
      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-500 ease-spring group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="grain relative isolate overflow-hidden bg-night-950 pb-10 pt-20 text-white/55 sm:pt-28">
      {/* sunset glow rising from below the sign-off */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -bottom-40 left-1/2 h-[28rem] w-[60rem] max-w-[140%] -translate-x-1/2 rounded-full bg-sunset opacity-[0.16] blur-[120px]" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 [mask-image:radial-gradient(ellipse_at_bottom,black,transparent_70%)]" />
      </div>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Editorial sign-off ───────────────────────────────── */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 sm:mb-20 lg:flex-row lg:items-end">
          <h2 className="max-w-3xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
            Every booking,
            <br />
            <span className="font-serif font-normal italic tracking-[-0.02em] text-white/85">one</span>{" "}
            <span className="text-sunset">place.</span>
          </h2>
          <Magnetic strength={0.3}>
            <a
              href="mailto:contactus@botlify.site"
              className="btn-glass-dark group rounded-full px-5 py-3 text-sm"
            >
              <Mail className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />
              contactus@botlify.site
            </a>
          </Magnetic>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {/* Brand Column */}
          <div className="space-y-5 sm:col-span-2 md:col-span-1">
            <Logo size="sm" dark />
            <p className="text-sm leading-relaxed text-white/45">
              One place for every booking channel. Botlify connects Booking.com,
              Airbnb, Agoda, Expedia, Traveloka and 55 more, syncs every booking
              into one calendar, books guests automatically and talks to them
              like a human would.
            </p>
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Follow us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/bot_lify"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram — @bot_lify"
                  className="group grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 transition duration-300 hover:bg-sunset hover:text-white hover:ring-transparent hover:shadow-[0_10px_24px_-8px_rgba(255,61,119,0.7)]"
                >
                  <Instagram size={18} className="transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] group-hover:scale-110" />
                </a>
                <a
                  href="https://www.instagram.com/bot_lify"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-white/55 transition hover:text-white"
                >
                  @bot_lify
                </a>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <FooterLink to="/pricing">Pricing</FooterLink>
              </li>
              <li>
                <FooterLink to="/#platform">Platform</FooterLink>
              </li>
              <li>
                <FooterLink to="/guide">Guide</FooterLink>
              </li>
              <li>
                <FooterLink to="/help">Help & Resources</FooterLink>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/terms">Terms of Service</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Contact Us</FooterLink>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-white/35" />
                <a href="mailto:contactus@botlify.site" className="break-all text-white/55 transition hover:text-white">
                  contactus@botlify.site
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-sm text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Botlify. All rights reserved.</p>
          <p className="font-serif text-[15px] italic text-white/45">Made with care · Karachi · Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
