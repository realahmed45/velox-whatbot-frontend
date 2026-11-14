/**
 * Botlify Help & Resources Page
 * Comprehensive help center with guides, tutorials, and documentation
 */
import { Book, Zap, Bot, ArrowRight, LifeBuoy, CalendarSync, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Aurora, Magnetic, Reveal, Spotlight } from "@/components/fx";

const tile =
  "h-11 w-11 rounded-xl grid place-items-center transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-8deg]";

const quickStart = [
  {
    to: "/guide",
    icon: CalendarSync,
    title: "Connect your OTAs",
    body: "Link Booking.com, Airbnb and Expedia so rooms, rates and availability sync on one calendar.",
  },
  {
    icon: Bot,
    title: "Train your AI concierge",
    body: "Teach it your rooms, policies and local tips so it answers every guest message, 24/7.",
  },
  {
    icon: MessageCircle,
    title: "Turn on guest messaging",
    body: "Let the AI reply inside your OTA inboxes and on WhatsApp — no more manual guest replies.",
  },
];

const topics = [
  {
    title: "Getting Started",
    items: [
      "How to sign up",
      "Adding your property & rooms",
      "Understanding plans & pricing",
      "Your first synced calendar",
    ],
  },
  {
    title: "Channel Manager",
    items: [
      "Connecting Booking.com",
      "Connecting Airbnb",
      "Connecting Expedia",
      "Rates & availability sync",
    ],
  },
  {
    title: "AI Guest Messaging",
    items: [
      "Replies in OTA inboxes",
      "Connecting WhatsApp",
      "Training with your hotel info",
      "When to hand off to staff",
    ],
  },
  {
    title: "Bookings & Guests",
    items: [
      "Bookings the AI closes",
      "Guest profiles",
      "Airport transfers",
      "Your direct booking site",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#FBFAF8] text-ink-950">
      <Aurora />
      <div className="absolute inset-0 -z-10 bg-dot-grid mask-fade-b opacity-50" aria-hidden />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        {/* Header */}
        <Reveal className="text-center mb-14 sm:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-600 ring-1 ring-ink-900/[0.08] shadow-sm">
            <LifeBuoy className="h-3.5 w-3.5 text-sunset-flame" strokeWidth={1.8} />
            Help center
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1] mb-5">
            Help &amp;{" "}
            <span className="font-serif italic font-normal text-sunset">Resources</span>
          </h1>
          <p className="text-base sm:text-lg text-ink-600 max-w-2xl mx-auto">
            Everything you need to run Botlify — the AI channel manager that syncs
            Booking.com, Airbnb and Expedia and answers every guest message for you.
          </p>
        </Reveal>

        {/* Quick Start Guides */}
        <section className="mb-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] mb-6">
              Quick Start Guides
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {quickStart.map((q, i) => {
              const Icon = q.icon;
              const inner = (
                <>
                  <div className={`${tile} bg-sunset-soft mb-5`}>
                    <Icon className="w-5 h-5 text-sunset-flame" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-[-0.02em] mb-2 flex items-center gap-2">
                    {q.title}
                    {q.to && (
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 transition-all duration-500 ease-spring group-hover:opacity-100 group-hover:translate-x-0" />
                    )}
                  </h3>
                  <p className="text-ink-600 text-sm leading-relaxed">{q.body}</p>
                </>
              );
              return (
                <Reveal key={q.title} delay={i * 0.07}>
                  {q.to ? (
                    <Spotlight
                      as={Link}
                      to={q.to}
                      className="card group block h-full p-6 transition-transform duration-500 ease-spring hover:-translate-y-1 active:scale-[0.98]"
                    >
                      {inner}
                    </Spotlight>
                  ) : (
                    <Spotlight className="card group h-full p-6">{inner}</Spotlight>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Resources */}
        <section className="mb-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] mb-6">
              Resources
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
            <Reveal>
              <Spotlight className="card group h-full p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className={`${tile} bg-emerald-500/10`}>
                    <Book className="w-5 h-5 text-emerald-600" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold tracking-[-0.02em] mb-2">
                      Documentation
                    </h3>
                    <p className="text-ink-600 text-sm mb-5">
                      Detailed documentation covering every feature and API
                      endpoint.
                    </p>
                    <Link to="/docs" className="btn-secondary text-sm">
                      Read Docs
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Spotlight>
            </Reveal>

            <Reveal delay={0.07}>
              <Spotlight className="card group h-full p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className={`${tile} bg-sunset-soft`}>
                    <Zap className="w-5 h-5 text-sunset-flame" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold tracking-[-0.02em] mb-2">
                      Setup Guide
                    </h3>
                    <p className="text-ink-600 text-sm mb-5">
                      A step-by-step walkthrough — from connecting your first OTA
                      to the AI answering its first guest.
                    </p>
                    <Link to="/guide" className="btn-secondary text-sm">
                      Open the guide
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          </div>
        </section>

        {/* Common Topics */}
        <Reveal>
          <div className="card p-6 sm:p-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] mb-8">
              Common Topics
            </h2>

            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              {topics.map((t) => (
                <div key={t.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500 mb-3">
                    {t.title}
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {t.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="group -mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink-700 transition-all duration-300 ease-spring hover:bg-ink-900/[0.04] hover:text-ink-950 hover:translate-x-1"
                        >
                          <span className="h-1 w-1 rounded-full bg-ink-300 transition-colors group-hover:bg-sunset-flame" />
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Still Need Help */}
        <Reveal className="mt-16 text-center">
          <p className="text-ink-600 mb-5">Can't find what you're looking for?</p>
          <Magnetic>
            <Link to="/contact" className="btn-primary px-7 py-3">
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </div>
  );
}
