/**
 * Botlify Features Page
 * Showcase all platform features
 */
import { Bot, Zap, Users, Send, BarChart2, ShoppingCart, Sparkles, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      color: "violet",
      title: "AI-Powered Bot",
      description: "Let AI handle customer conversations 24/7 with contextual, intelligent replies powered by Groq.",
    },
    {
      icon: Zap,
      color: "orange",
      title: "Flow Automation",
      description: "Build sophisticated automation workflows with triggers, conditions, and actions - no code required.",
    },
    {
      icon: Users,
      color: "blue",
      title: "CRM & Contacts",
      description: "Manage contacts, tags, custom fields, and segments. Complete customer relationship management.",
    },
    {
      icon: Send,
      color: "green",
      title: "Broadcasting",
      description: "Send targeted messages to segments. Schedule campaigns and track engagement in real-time.",
    },
    {
      icon: BarChart2,
      color: "purple",
      title: "Analytics",
      description: "Track performance with detailed analytics. Monitor engagement, conversion rates, and ROI.",
    },
    {
      icon: ShoppingCart,
      color: "pink",
      title: "Shopify Integration",
      description: "Native Shopify integration. Sync products, automate order notifications, recover abandoned carts.",
    },
    {
      icon: Sparkles,
      color: "yellow",
      title: "AI Tools",
      description: "Generate captions, research hashtags, analyze sentiment, and get reply suggestions with AI.",
    },
    {
      icon: Instagram,
      color: "red",
      title: "Instagram Native",
      description: "Built specifically for Instagram. Send DMs, manage inbox, schedule posts, track competitors.",
    },
  ];

  const colorMap = {
    violet: "from-violet-500/10 to-violet-500/5 text-violet-500 border-violet-500/20",
    orange: "from-accent/10 to-accent/5 text-accent border-accent/20",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-500 border-blue-500/20",
    green: "from-green-500/10 to-green-500/5 text-green-500 border-green-500/20",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-500 border-purple-500/20",
    pink: "from-pink-500/10 to-pink-500/5 text-pink-500 border-pink-500/20",
    yellow: "from-yellow-500/10 to-yellow-500/5 text-yellow-500 border-yellow-500/20",
    red: "from-red-500/10 to-red-500/5 text-red-500 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-ink-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
            Everything You Need to Automate Instagram
          </h1>
          <p className="text-xl text-ink-600 max-w-3xl mx-auto">
            From AI-powered conversations to advanced automation workflows, Botlify has all the tools you need to grow your Instagram business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-8 bg-white rounded-2xl border border-ink-200 hover:shadow-lg transition-all"
              >
                <div className={`p-4 bg-gradient-to-br ${colorMap[feature.color]} rounded-xl w-fit mb-4 border`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-ink-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-ink-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-accent/5 to-violet-500/5 rounded-2xl border border-accent/20 p-12">
          <h2 className="text-3xl font-bold text-ink-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-ink-600 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and brands using Botlify to automate their Instagram and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition"
            >
              Start Free Trial
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3 bg-white text-ink-900 rounded-lg font-medium hover:bg-ink-50 transition border border-ink-200"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
