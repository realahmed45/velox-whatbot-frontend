import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Check, Mail } from "lucide-react";
import { Aurora, Reveal } from "@/components/fx";

const SECTIONS = [
  {
    h: "Introduction",
    p: 'Botlify ("we", "our", "us") operates the Botlify platform at botlify.site — a channel manager that lets hotels and other accommodation businesses sync their rooms, rates and availability across online travel agencies and automate replies to their guests\' messages in those platforms\' messaging inboxes and on WhatsApp. This Privacy Policy explains what information we collect, how we use it, who we share it with, and the rights you have. By creating an account or connecting an online travel agency or WhatsApp account, you agree to this policy.',
  },
  {
    h: "Who the Data Belongs To",
    p: "Botlify processes two kinds of people's data. It's important to be clear about both:",
    ul: [
      'Account holders (our customers) — the business owners and their team members who sign up for Botlify.',
      "End users (your audience) — the guests who message our customers through connected online travel agency inboxes or WhatsApp. For their data, our customer is the controller and Botlify is a processor acting on the customer's instructions.",
    ],
  },
  {
    h: "Information We Collect",
    p: "Account & profile: name, email address, password (stored only as a salted bcrypt hash — never in plain text), and, if you sign in with Google, your Google account ID and profile picture. When you connect an online travel agency account through our connectivity partner, or a WhatsApp Business number through our messaging provider, we collect the account and listing identifiers, your WhatsApp Business phone number, and the access credentials used to sync your listings and to send and receive messages on your behalf.",
    ul: [
      "Guest messages received through connected online travel agency inboxes and WhatsApp and processed by your automations, reservation details synced from connected platforms, and the guest records (name, phone number or platform ID, tags, notes) they generate",
      "Content you create in Botlify: flows, automations, broadcasts, scheduled posts, AI knowledge, and business settings",
      "Usage and diagnostic data: log-ins, feature usage, message counts, IP address, browser/device info, and error reports",
      "Payment status and plan (handled by our payment processor — we do not store full card numbers)",
    ],
  },
  {
    h: "How We Use Your Information",
    p: "We use the information solely to operate and improve the Service:",
    ul: [
      "Deliver the automations you configure — rate and availability sync across connected online travel agencies, auto-replies to guest messages in their inboxes and on WhatsApp, drips, broadcasts, and scheduled posts",
      "Generate AI-assisted replies using the business knowledge you provide",
      "Show you analytics about your automation performance",
      "Authenticate you, secure your account, prevent abuse, and enforce our limits and plans",
      "Send you service and account emails, and respond to support requests",
    ],
  },
  {
    h: "AI Processing",
    p: "When AI smart replies are enabled, the text of an incoming message and the business knowledge you have provided are sent to our AI provider(s) to generate a suggested reply. This data is transmitted securely and used only to produce the response; we do not permit it to be used to train third-party public models. You can disable AI replies at any time in Settings.",
  },
  {
    h: "Third-Party Services (Sub-Processors)",
    p: "We rely on a small set of vetted providers to run Botlify. Each processes only the data needed for its function:",
    ul: [
      "Channel connectivity partner — connects your online travel agency accounts, syncs rooms, rates, availability and reservations, and delivers guest messages from their inboxes",
      "WhatsApp messaging provider (Zernio) — connects your WhatsApp Business number through Meta's WhatsApp Business API and delivers messages/webhooks",
      "AI provider (Google Gemini) — generates AI replies from message text and your knowledge base",
      "Email (Brevo) — sends verification codes, password resets, and account notifications",
      "Media storage (Cloudinary) — hosts images you upload for posts and messages",
      "Infrastructure (MongoDB Atlas, Render, Vercel, Upstash) — database and hosting",
      "Bot protection (Cloudflare Turnstile) and error monitoring — security and reliability",
    ],
  },
  {
    h: "Data Sharing",
    p: "We do not sell your personal data, and we do not share it for advertising. We disclose data only to the sub-processors listed above (to run the Service), to comply with a valid legal request, or to protect the rights and safety of Botlify and its users. If Botlify is ever involved in a merger or acquisition, we will notify you before your data becomes subject to a different privacy policy.",
  },
  {
    h: "Data Security",
    p: "We apply industry-standard safeguards: encryption in transit (HTTPS), encryption at rest for connected-platform access credentials, hashed passwords, rate limiting, input sanitization, and role-based access controls for team members. No system is perfectly secure, but we work continuously to protect your data and will notify affected users of any material breach as required by law.",
  },
  {
    h: "Data Retention & Deletion",
    p: "We keep your data while your account is active. When you disconnect an online travel agency or WhatsApp account we stop processing its messages immediately. When you delete your workspace or account, we permanently delete the associated data within 30 days (backups within 90 days). You can request deletion at any time by emailing contactus@botlify.site, and end users can ask the connected business to remove their contact record.",
  },
  {
    h: "Your Rights",
    p: "Depending on where you live (including under GDPR and CCPA), you have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. You can manage most of this from your account settings or by contacting us. You may disconnect any connected online travel agency or WhatsApp account at any time to revoke our access, and unsubscribe from non-essential emails.",
  },
  {
    h: "Cookies",
    p: "Botlify uses only essential cookies and browser storage needed to keep you signed in and remember your preferences. We do not use third-party advertising or cross-site tracking cookies.",
  },
  {
    h: "Children",
    p: "Botlify is a business tool not intended for anyone under 16 (or the minimum age in your country). We do not knowingly collect data from children, and will delete such data if we become aware of it.",
  },
  {
    h: "Changes to This Policy",
    p: "We may update this policy as the Service evolves. When we make material changes we will update the date below and, where appropriate, notify you by email or in the app. Continued use after an update means you accept the revised policy.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      updated="July 26, 2026"
      sections={SECTIONS}
    />
  );
}

/* ── Shared polished legal-page shell ─────────────────────────── */
export function LegalShell({ icon: Icon, eyebrow, title, updated, sections }) {
  return (
    <div className="relative isolate overflow-hidden bg-[#FBFAF8] text-ink-950 py-16 sm:py-24 px-4">
      <Aurora />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-dot-grid mask-fade-b opacity-50" />
      <div className="relative max-w-3xl mx-auto">
        {/* header */}
        <div className="text-center">
          <Reveal>
            <span className="group relative mx-auto mb-6 grid h-14 w-14 place-items-center">
              <span aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-25 blur-xl" />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-500 ease-spring hover:-translate-y-1 hover:rotate-[-8deg]">
                <Icon className="w-7 h-7" strokeWidth={1.8} />
              </span>
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              {eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold tracking-[-0.05em] leading-[0.98] text-ink-950">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-ink-500 ring-1 ring-ink-900/[0.08] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-sunset-flame" />
              Last updated {updated}
            </p>
          </Reveal>
        </div>

        {/* card */}
        <Reveal delay={0.2}>
          <div className="mt-12 card p-6 sm:p-10">
            <div className="space-y-9">
              {sections.map((s, i) => (
                <Reveal
                  as="section"
                  key={i}
                  y={14}
                  className={i > 0 ? "pt-9 border-t border-ink-900/[0.06]" : ""}
                >
                  <h2 className="group flex items-baseline gap-3 font-display text-lg sm:text-xl font-semibold tracking-[-0.02em] text-ink-950">
                    <span className="font-mono text-[11px] font-medium tabular-nums text-sunset-flame transition-transform duration-500 ease-spring group-hover:-translate-y-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.h}
                  </h2>
                  {s.p && (
                    <p className="mt-3 text-[15px] text-ink-600 leading-relaxed">
                      {s.p}
                    </p>
                  )}
                  {s.ul && (
                    <ul className="mt-4 space-y-2.5">
                      {s.ul.map((li, k) => (
                        <li
                          key={k}
                          className="flex items-start gap-2.5 text-[15px] text-ink-600 leading-relaxed"
                        >
                          <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sunset-flame/10 text-sunset-flame">
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </span>
                          <span>{li}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}

              {/* contact */}
              <section className="pt-9 border-t border-ink-900/[0.06]">
                <h2 className="flex items-baseline gap-3 font-display text-lg sm:text-xl font-semibold tracking-[-0.02em] text-ink-950">
                  <span className="font-mono text-[11px] font-medium text-sunset-flame">@</span>
                  Contact
                </h2>
                <a
                  href="mailto:contactus@botlify.site"
                  className="group mt-4 inline-flex max-w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-ink-900/[0.08] shadow-sm transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:ring-sunset-flame/40 hover:shadow-[0_14px_34px_-14px_rgba(255,61,119,0.4)] active:scale-[0.97]"
                >
                  <span className="w-10 h-10 rounded-xl bg-sunset flex items-center justify-center text-white shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-10deg]">
                    <Mail className="w-4 h-4" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink-950">
                      contactus@botlify.site
                    </span>
                    <span className="block text-xs text-ink-500">
                      Questions about this policy? We reply within a few hours.
                    </span>
                  </span>
                </a>
              </section>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-950"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-x-1" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
