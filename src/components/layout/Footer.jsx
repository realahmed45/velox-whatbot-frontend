/**
 * Botlify public footer — shared by the landing page and every marketing page.
 * Black, with an orange status dot and an oversized wordmark sign-off.
 */
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", to: "/pricing" },
      { label: "Guide", to: "/guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Consultant program", to: "/consultants" },
      { label: "Help", to: "/help" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

const LINK = "text-[14.5px] text-white/60 transition-colors hover:text-[#FF5A1F]";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0A0A0A] font-geist text-white">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo size="sm" dark />
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-white/60">
              The AI channel manager for hotels. Rooms, rates and availability in sync across Airbnb,
              Booking.com, Expedia and Trip.com — and every guest message answered, 24/7.
            </p>
            <a
              href="mailto:contactus@botlify.site"
              className="mt-5 inline-block text-[14.5px] font-medium text-white underline decoration-[#FF5A1F] decoration-2 underline-offset-4 transition-colors hover:text-[#FF5A1F]"
            >
              contactus@botlify.site
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/40">{c.title}</p>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.to ? (
                        <Link to={l.to} className={LINK}>
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className={LINK}>
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Botlify. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" aria-hidden />
            Answering guests 24/7
          </p>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-6 select-none whitespace-nowrap text-center text-[25vw] font-semibold leading-[0.78] tracking-[-0.07em] text-white/[0.06] lg:text-[300px]"
        >
          botlify<span className="text-[#FF5A1F]/40">.</span>
        </p>
      </div>
    </footer>
  );
}
