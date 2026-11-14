/**
 * Botlify public footer — shared by the landing page and every marketing page.
 * Quiet and structured: brand blurb, three link columns, a hairline bottom bar.
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

const LINK = "text-[14px] text-ink-500 transition-colors hover:text-ink-950";

export default function Footer() {
  return (
    <footer className="border-t border-ink-200/80 bg-white font-geist">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo size="sm" />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ink-500">
              The AI channel manager for hotels. Rooms, rates and availability in sync across Airbnb,
              Booking.com and Expedia — and every guest message answered, 24/7.
            </p>
            <a
              href="mailto:contactus@botlify.site"
              className="mt-4 inline-block text-[14px] text-ink-700 underline decoration-ink-300 underline-offset-4 transition-colors hover:decoration-ink-950"
            >
              contactus@botlify.site
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="text-[13px] font-medium text-ink-950">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
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
        <div className="mt-14 flex flex-col gap-2 border-t border-ink-100 pt-6 text-[13px] text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Botlify. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Answering guests 24/7
          </p>
        </div>
      </div>
    </footer>
  );
}
