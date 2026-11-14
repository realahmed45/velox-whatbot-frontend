/**
 * Botlify Contact Page
 * Professional contact page with email and support info
 */
import { Mail, MessageSquare, ArrowRight, ArrowUpRight } from "lucide-react";
import { Aurora, Magnetic, Reveal, Spotlight } from "@/components/fx";
import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#FBFAF8] text-ink-950">
      <Aurora />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-dot-grid mask-fade-b opacity-50" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center mb-14">
          <Reveal>
            <h1 className="font-display text-5xl sm:text-7xl font-semibold tracking-[-0.05em] leading-[0.95] text-ink-950 mb-5">
              Get in{" "}
              <span className="font-serif italic font-normal tracking-[-0.02em] text-sunset pr-1">
                Touch
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-base sm:text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed">
              Questions about connecting Booking.com, Airbnb, Expedia or WhatsApp? Need help?
              We're here for you. Reach out and we'll get back to you as soon as possible.
            </p>
          </Reveal>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {/* Email */}
          <Reveal delay={0.1} className="h-full">
            <Spotlight
              as="a"
              href="mailto:contactus@botlify.site"
              className="card group block h-full p-7 sm:p-8 transition-transform duration-500 ease-spring hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-10px_rgba(255,61,119,0.6)] transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-10deg]">
                  <Mail className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-950 mb-1.5">
                    Email Us
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Send us an email and we'll respond within 24 hours.
                  </p>
                  <p className="inline-flex items-center gap-1 break-all text-sm font-semibold text-sunset-flame">
                    contactus@botlify.site
                    <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </div>
            </Spotlight>
          </Reveal>

          {/* Help Center */}
          <Reveal delay={0.16} className="h-full">
            <Spotlight
              as={Link}
              to="/help"
              className="card group block h-full p-7 sm:p-8 transition-transform duration-500 ease-spring hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sunset-soft text-sunset-flame transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-10deg]">
                  <MessageSquare className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-950 mb-1.5">
                    Help Center
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Browse our guides and tutorials to get started quickly.
                  </p>
                  <p className="inline-flex items-center gap-1 text-sm font-semibold text-ink-800">
                    Visit Help Center{" "}
                    <span className="transition-transform duration-500 ease-spring group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </div>
            </Spotlight>
          </Reveal>
        </div>

        {/* FAQ Section */}
        <Reveal>
          <div className="card p-6 sm:p-9">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-950 mb-7">
              Frequently Asked{" "}
              <span className="font-serif italic font-normal">Questions</span>
            </h2>

            <div className="divide-y divide-ink-900/[0.06]">
              {[
                [
                  "How quickly will I get a response?",
                  "We typically respond to all inquiries within 24 hours during business days (Monday-Friday).",
                ],
                [
                  "What information should I include in my email?",
                  "Please include your workspace email, a detailed description of your issue or question, and any relevant screenshots if applicable.",
                ],
                [
                  "Do you offer phone support?",
                  "Currently, we provide support via email. This allows us to give you detailed, documented responses and serve you better.",
                ],
                [
                  "Can I request a new feature?",
                  "Absolutely! We love hearing from our users. Email us your feature request and we'll review it for our product roadmap.",
                ],
              ].map(([q, a]) => (
                <div key={q} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="font-semibold text-ink-950 mb-1.5">{q}</h3>
                  <p className="text-[15px] text-ink-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="text-center mt-14">
            <p className="text-ink-600 mb-5">Ready to let Botlify answer your guests on every OTA and WhatsApp?</p>
            <Magnetic strength={0.3}>
              <Link to="/register" className="group btn-primary px-8 py-3.5 text-[15px]">
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
