/**
 * Botlify Contact Page
 * Professional contact page with email and support info
 */
import { Mail, MessageSquare, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-ink-50/30 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto">
            Have questions? Need help? We're here for you. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email */}
          <a
            href="mailto:contactus@botlify.com"
            className="group p-8 bg-white rounded-2xl border border-ink-200 hover:border-accent hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink-900 mb-2">
                  Email Us
                </h3>
                <p className="text-ink-600 mb-3">
                  Send us an email and we'll respond within 24 hours.
                </p>
                <p className="text-accent font-medium group-hover:underline">
                  contactus@botlify.com
                </p>
              </div>
            </div>
          </a>

          {/* Help Center */}
          <Link
            to="/help"
            className="group p-8 bg-white rounded-2xl border border-ink-200 hover:border-accent hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-violet-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink-900 mb-2">
                  Help Center
                </h3>
                <p className="text-ink-600 mb-3">
                  Browse our guides and tutorials to get started quickly.
                </p>
                <p className="text-violet-500 font-medium group-hover:underline">
                  Visit Help Center →
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-ink-200 p-8">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-2">
                How quickly will I get a response?
              </h3>
              <p className="text-ink-600">
                We typically respond to all inquiries within 24 hours during business days (Monday-Friday).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-2">
                What information should I include in my email?
              </h3>
              <p className="text-ink-600">
                Please include your workspace email, a detailed description of your issue or question, and any relevant screenshots if applicable.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-2">
                Do you offer phone support?
              </h3>
              <p className="text-ink-600">
                Currently, we provide support via email. This allows us to give you detailed, documented responses and serve you better.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-2">
                Can I request a new feature?
              </h3>
              <p className="text-ink-600">
                Absolutely! We love hearing from our users. Email us your feature request and we'll review it for our product roadmap.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-ink-600 mb-4">
            Ready to automate your Instagram?
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
