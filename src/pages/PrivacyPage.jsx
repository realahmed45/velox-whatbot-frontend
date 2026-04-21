export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: April 21, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Botlify ("we", "our", "us") operates the Botlify platform. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you
              use our Service for Instagram DM automation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              When you connect your Instagram Business account via Instagram's OAuth, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Instagram username and user ID</li>
              <li>Profile picture URL</li>
              <li>Follower count</li>
              <li>Access tokens for API communication</li>
              <li>Messages sent and received via our automation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use your information solely to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide automated DM services on your behalf</li>
              <li>Send greeting and follow-up messages based on your settings</li>
              <li>Display analytics about your automation performance</li>
              <li>Maintain and improve our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your data. All access
              tokens are encrypted at rest. We never share, sell, or distribute your data to
              third parties except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your data for as long as your account is active. When you disconnect
              your Instagram account or delete your Botlify workspace, we permanently delete
              all associated data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time
              through your account settings. You can also disconnect your Instagram account
              to revoke our access immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:{" "}
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
