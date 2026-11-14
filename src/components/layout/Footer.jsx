/**
 * Botlify Unified Footer
 * One footer for the marketing site — warm light canvas, a big editorial
 * sign-off, then the link columns. Hover: links slide, icons hop.
 */
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { Magnetic } from "@/components/fx";

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-ink-600 transition-colors duration-300 hover:text-ink-950"
    >
      <span className="transition-transform duration-500 ease-spring group-hover:translate-x-0.5">{children}</span>
      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-500 ease-spring group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#F5F2EE] pb-10 pt-20 text-ink-600 sm:pt-28">
      {/* soft sunset wash rising from below the sign-off (static) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 115%, rgba(255,106,43,0.14), transparent 70%), radial-gradient(35% 45% at 90% 100%, rgba(124,92,255,0.08), transparent 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-900/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Editorial sign-off ───────────────────────────────── */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 sm:mb-20 lg:flex-row lg:items-end">
          <h2 className="max-w-3xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.05em] text-ink-950 sm:text-6xl md:text-7xl">
            Every guest,
            <br />
            <span className="font-serif font-normal italic tracking-[-0.02em] text-ink-800">answered</span>{" "}
            <span className="text-sunset">instantly.</span>
          </h2>
          <Magnetic strength={0.3}>
            <a
              href="mailto:contactus@botlify.site"
              className="btn-secondary group rounded-full px-5 py-3 text-sm"
            >
              <Mail className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />
              contactus@botlify.site
            </a>
          </Magnetic>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {/* Brand Column */}
          <div className="space-y-5 sm:col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="text-sm leading-relaxed text-ink-500">
              The AI channel manager for hotels. Botlify syncs rooms, rates and
              availability across Airbnb, Booking.com and Expedia — and its AI
              answers every guest message inside those inboxes and on WhatsApp,
              24/7.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Product</h3>
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
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Company</h3>
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
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-ink-400" />
                <a href="mailto:contactus@botlify.site" className="break-all text-ink-600 transition hover:text-ink-950">
                  contactus@botlify.site
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink-900/[0.07] pt-8 text-sm text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Botlify. All rights reserved.</p>
          <p className="font-serif text-[15px] italic text-ink-500">Made with care · Karachi · Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
