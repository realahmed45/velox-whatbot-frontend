import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Check, Mail } from "lucide-react";

const SECTIONS = [
  {
    h: "Introduction",
    p: 'Botlify ("we", "our", "us") operates the Botlify platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service for Instagram DM automation.',
  },
  {
    h: "Information We Collect",
    p: "When you connect your Instagram Business account via Instagram's OAuth, we collect:",
    ul: [
      "Instagram username and user ID",
      "Profile picture URL",
      "Follower count",
      "Access tokens for API communication",
      "Messages sent and received via our automation",
    ],
  },
  {
    h: "How We Use Your Information",
    p: "We use your information solely to:",
    ul: [
      "Provide automated DM services on your behalf",
      "Send greeting and follow-up messages based on your settings",
      "Display analytics about your automation performance",
      "Maintain and improve our Service",
    ],
  },
  {
    h: "Data Security",
    p: "We implement industry-standard security measures to protect your data. All access tokens are encrypted at rest. We never share, sell, or distribute your data to third parties except as required by law.",
  },
  {
    h: "Data Retention",
    p: "We retain your data for as long as your account is active. When you disconnect your Instagram account or delete your Botlify workspace, we permanently delete all associated data within 30 days.",
  },
  {
    h: "Your Rights",
    p: "You have the right to access, correct, or delete your personal data at any time through your account settings. You can also disconnect your Instagram account to revoke our access immediately.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      updated="April 21, 2026"
      sections={SECTIONS}
    />
  );
}

/* ── Shared polished legal-page shell ─────────────────────────── */
export function LegalShell({ icon: Icon, eyebrow, title, updated, sections }) {
  return (
    <div className="relative py-14 sm:py-20 px-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />
      <div className="relative max-w-3xl mx-auto">
        {/* header */}
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-500 mb-5">
            <Icon className="w-7 h-7" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-ink-900">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-400">Last updated {updated}</p>
        </div>

        {/* card */}
        <div className="mt-10 bg-white rounded-2xl border border-ink-100 shadow-card-lg p-6 sm:p-10">
          <div className="space-y-8">
            {sections.map((s, i) => (
              <section
                key={i}
                className={
                  i > 0 ? "pt-8 border-t border-ink-100" : ""
                }
              >
                <h2 className="flex items-center gap-2.5 text-lg font-black text-ink-900">
                  <span className="w-1.5 h-5 rounded-full bg-brand-500" />
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
                        className="flex items-start gap-2.5 text-[15px] text-ink-600"
                      >
                        <Check className="w-4 h-4 mt-1 text-brand-500 flex-shrink-0" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* contact */}
            <section className="pt-8 border-t border-ink-100">
              <h2 className="flex items-center gap-2.5 text-lg font-black text-ink-900">
                <span className="w-1.5 h-5 rounded-full bg-brand-500" />
                Contact
              </h2>
              <a
                href="mailto:support@botlify.site"
                className="mt-4 inline-flex items-center gap-3 rounded-xl border border-ink-100 bg-brand-50/40 px-4 py-3 hover:border-brand-300 hover:shadow-glow transition group"
              >
                <span className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink-900">
                    support@botlify.site
                  </span>
                  <span className="block text-xs text-ink-500">
                    Questions about this policy? We reply within a few hours.
                  </span>
                </span>
              </a>
            </section>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
