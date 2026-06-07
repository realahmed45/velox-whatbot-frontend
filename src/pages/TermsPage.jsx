import { FileText } from "lucide-react";
import { LegalShell } from "./PrivacyPage";

const SECTIONS = [
  {
    h: "Agreement to Terms",
    p: "By accessing or using Botlify, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our Service.",
  },
  {
    h: "Description of Service",
    p: "Botlify provides Instagram DM automation services that allow you to send automated greeting and follow-up messages to your Instagram followers. The Service integrates with Instagram's official Business API.",
  },
  {
    h: "Your Responsibilities",
    p: "You agree to:",
    ul: [
      "Provide accurate information when creating your account",
      "Maintain the security of your account credentials",
      "Comply with Instagram's Terms of Service and Community Guidelines",
      "Not use the Service for spam, harassment, or illegal activities",
      "Not attempt to circumvent any limitations or restrictions",
    ],
  },
  {
    h: "Account Requirements",
    p: "You must have an Instagram Business or Creator account to use Botlify. Professional accounts (Business/Creator) are required to access Instagram's messaging API.",
  },
  {
    h: "Prohibited Activities",
    p: "You may not:",
    ul: [
      "Send unsolicited spam or bulk messages",
      "Violate Instagram's API rate limits or policies",
      "Use the Service to harass, threaten, or abuse others",
      "Impersonate others or misrepresent your identity",
      "Attempt to reverse engineer or copy the Service",
    ],
  },
  {
    h: "Service Availability",
    p: "We strive to provide reliable service but do not guarantee 100% uptime. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.",
  },
  {
    h: "Limitation of Liability",
    p: 'Botlify is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service, including but not limited to Instagram account restrictions, data loss, or business interruption.',
  },
  {
    h: "Termination",
    p: "We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent or harmful activities. You may terminate your account at any time by disconnecting your Instagram account and deleting your workspace.",
  },
  {
    h: "Changes to Terms",
    p: "We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.",
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      icon={FileText}
      eyebrow="Legal · Terms"
      title="Terms of Service"
      updated="April 21, 2026"
      sections={SECTIONS}
    />
  );
}
