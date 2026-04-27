export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-ink-900 mb-2">Terms of Service</h1>
        <p className="text-ink-500 mb-8">Last updated: April 21, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Agreement to Terms</h2>
            <p className="text-ink-600 leading-relaxed">
              By accessing or using Botlify, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, you may not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Description of Service</h2>
            <p className="text-ink-600 leading-relaxed">
              Botlify provides Instagram DM automation services that allow you to send automated
              greeting and follow-up messages to your Instagram followers. The Service integrates
              with Instagram's official Business API.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Your Responsibilities</h2>
            <p className="text-ink-600 leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside text-ink-600 space-y-2 ml-4">
              <li>Provide accurate information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with Instagram's Terms of Service and Community Guidelines</li>
              <li>Not use the Service for spam, harassment, or illegal activities</li>
              <li>Not attempt to circumvent any limitations or restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Account Requirements</h2>
            <p className="text-ink-600 leading-relaxed">
              You must have an Instagram Business or Creator account to use Botlify.
              Professional accounts (Business/Creator) are required to access Instagram's
              messaging API.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Prohibited Activities</h2>
            <p className="text-ink-600 leading-relaxed mb-3">You may not:</p>
            <ul className="list-disc list-inside text-ink-600 space-y-2 ml-4">
              <li>Send unsolicited spam or bulk messages</li>
              <li>Violate Instagram's API rate limits or policies</li>
              <li>Use the Service to harass, threaten, or abuse others</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Attempt to reverse engineer or copy the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Service Availability</h2>
            <p className="text-ink-600 leading-relaxed">
              We strive to provide reliable service but do not guarantee 100% uptime. The Service
              may be temporarily unavailable due to maintenance, updates, or circumstances beyond
              our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Limitation of Liability</h2>
            <p className="text-ink-600 leading-relaxed">
              Botlify is provided "as is" without warranties of any kind. We are not liable for
              any damages arising from your use of the Service, including but not limited to
              Instagram account restrictions, data loss, or business interruption.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Termination</h2>
            <p className="text-ink-600 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these
              Terms or engage in fraudulent or harmful activities. You may terminate your
              account at any time by disconnecting your Instagram account and deleting your
              workspace.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Changes to Terms</h2>
            <p className="text-ink-600 leading-relaxed">
              We may update these Terms from time to time. Continued use of the Service after
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900 mb-3">Contact</h2>
            <p className="text-ink-600 leading-relaxed">
              For questions about these Terms of Service, contact:{" "}
              <a href="mailto:support@botlify.com" className="text-purple-600 hover:text-purple-700">
                support@botlify.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
