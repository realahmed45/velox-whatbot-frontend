/**
 * Botlify Help & Resources Page
 * Comprehensive help center with guides, tutorials, and documentation
 */
import { Book, Video, FileText, Zap, Instagram, Bot } from "lucide-react";
import { Link } from "react-router-dom";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-ink-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
            Help & Resources
          </h1>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto">
            Everything you need to get started with Botlify and automate your
            Instagram like a pro.
          </p>
        </div>

        {/* Quick Start Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">
            Quick Start Guides
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/guide"
              className="group p-6 bg-white rounded-xl border border-ink-200 hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <Instagram className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-2 group-hover:text-accent transition">
                Connect Instagram
              </h3>
              <p className="text-ink-600 text-sm">
                Step-by-step guide to connect your Instagram account and start
                automating.
              </p>
            </Link>

            <div className="group p-6 bg-white rounded-xl border border-ink-200 hover:border-violet-500 hover:shadow-lg transition-all">
              <div className="p-3 bg-violet-500/10 rounded-lg w-fit mb-4">
                <Bot className="w-6 h-6 text-violet-500" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-2 group-hover:text-violet-500 transition">
                Set Up AI Bot
              </h3>
              <p className="text-ink-600 text-sm">
                Configure your AI bot to auto-reply to customer messages 24/7.
              </p>
            </div>

            <div className="group p-6 bg-white rounded-xl border border-ink-200 hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-2 group-hover:text-blue-500 transition">
                Create Your First Flow
              </h3>
              <p className="text-ink-600 text-sm">
                Build automated workflows to save time and grow your business.
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-white rounded-xl border border-ink-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Book className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink-900 mb-2">
                    Documentation
                  </h3>
                  <p className="text-ink-600 text-sm mb-4">
                    Detailed documentation covering every feature and API
                    endpoint.
                  </p>
                  <a
                    href="#"
                    className="text-green-500 text-sm font-medium hover:underline"
                  >
                    Read Docs →
                  </a>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-xl border border-ink-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Video className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink-900 mb-2">
                    Video Tutorials
                  </h3>
                  <p className="text-ink-600 text-sm mb-4">
                    Watch step-by-step video guides to master Botlify features.
                  </p>
                  <a
                    href="#"
                    className="text-red-500 text-sm font-medium hover:underline"
                  >
                    Watch Videos →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Topics */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">
            Common Topics
          </h2>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="font-semibold text-ink-900 mb-3">
                Getting Started
              </h3>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <a href="#" className="hover:text-accent">
                    • How to sign up
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Connecting Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Understanding plans & pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • First automation setup
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-3">AI Bot</h3>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <a href="#" className="hover:text-accent">
                    • Configuring AI personality
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Adding FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Training with website content
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • When to hand off to human
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-3">Automation</h3>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <a href="#" className="hover:text-accent">
                    • Building flows
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Keyword triggers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Broadcasting messages
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Drip campaigns
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-3">Integrations</h3>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <a href="#" className="hover:text-accent">
                    • Shopify integration
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Make.com webhooks
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Zapier integration
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    • Custom webhooks
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 text-center">
          <p className="text-ink-600 mb-4">
            Can't find what you're looking for?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
