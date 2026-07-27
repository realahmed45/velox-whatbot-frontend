import { FileText } from "lucide-react";
import { LegalShell } from "./PrivacyPage";

const SECTIONS = [
  {
    h: "Agreement to Terms",
    p: 'By accessing or using Botlify (botlify.site), you agree to be bound by these Terms of Service and our Privacy Policy. "Botlify" ("we", "us", "our") refers to the Service and its owner-operator. If you do not agree, you may not use the Service. If you use Botlify on behalf of a business, you confirm you are authorized to bind that business to these Terms.',
  },
  {
    h: "Description of Service",
    p: "Botlify lets you automate replies to your own Instagram direct messages and comments — auto-replies, comment-to-DM, story triggers, drip sequences, broadcasts, scheduled posts, and AI-assisted responses. Botlify connects to Instagram through a third-party messaging provider and is not affiliated with, endorsed by, or operated by Instagram or Meta.",
  },
  {
    h: "Account Requirements",
    p: "You must be at least 16 years old and provide accurate registration details. To use the messaging features you need an Instagram Business or Creator account, which you authorize us to access on your behalf. You are responsible for keeping your login credentials secure and for all activity under your account and that of any team members you invite.",
  },
  {
    h: "Your Responsibilities",
    p: "You agree to:",
    ul: [
      "Comply with Instagram's and Meta's Terms of Service, Platform Policy, and Community Guidelines at all times",
      "Only message people in line with Instagram's rules (including its 24-hour messaging window) and applicable anti-spam laws",
      "Obtain any consent required to contact your audience",
      "Keep your account credentials secure and your billing information current",
      "Not circumvent plan limits, rate limits, or other restrictions",
    ],
  },
  {
    h: "Prohibited Activities",
    p: "You may not:",
    ul: [
      "Send unsolicited spam, bulk, or deceptive messages",
      "Harass, threaten, abuse, or mislead any person",
      "Impersonate others or misrepresent your identity or affiliation",
      "Use the Service for anything illegal or that violates a third party's rights",
      "Reverse engineer, resell, or copy the Service without our written permission",
    ],
  },
  {
    h: "Plans, Billing & Free Trial",
    p: "Botlify is a paid subscription service. Both plans start with a 3-day free trial, and a valid payment method is required to begin the trial.",
    ul: [
      "Free trial: your chosen plan starts with a 3-day free trial. You must enter valid card details to start it. If you do not cancel before the trial ends, your paid subscription begins automatically and your card is charged.",
      "Subscriptions renew automatically each billing cycle (monthly or yearly) until you cancel. You can cancel anytime from Plan & Billing; access continues until the end of the paid period.",
      "Fees are billed in advance and, except where required by law, are non-refundable for partial periods.",
      "We may change pricing or plan features with reasonable notice; changes apply from your next billing cycle.",
      "Each plan includes usage limits (such as monthly message volume and team seats). Exceeding a limit may require an upgrade to continue using the affected feature.",
    ],
  },
  {
    h: "Service Availability",
    p: "We work to keep Botlify reliable but do not guarantee uninterrupted or error-free service. Features depend on third parties (including Instagram and our messaging provider) whose availability and policies are outside our control, and the Service may be unavailable during maintenance or events beyond our control.",
  },
  {
    h: "Intellectual Property",
    p: "Botlify and its software, design, and content are owned by us and protected by law. We grant you a limited, non-exclusive, non-transferable right to use the Service. You retain ownership of the content and data you put into Botlify, and grant us the limited rights needed to operate the Service for you.",
  },
  {
    h: "Limitation of Liability",
    p: 'Botlify is provided "as is" and "as available" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages, including Instagram account restrictions or bans, data loss, or lost profits. Our total liability for any claim is limited to the amount you paid us in the 3 months before the claim.',
  },
  {
    h: "Termination",
    p: "You may cancel and delete your account at any time. We may suspend or terminate your account if you breach these Terms, misuse the Service, or create risk or legal exposure for us or others. On termination, your right to use the Service ends and we delete your data as described in the Privacy Policy.",
  },
  {
    h: "Changes to Terms",
    p: "We may update these Terms as the Service evolves. When we make material changes we will update the date below and, where appropriate, notify you. Continued use after an update means you accept the revised Terms.",
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      icon={FileText}
      eyebrow="Legal · Terms"
      title="Terms of Service"
      updated="July 26, 2026"
      sections={SECTIONS}
    />
  );
}
