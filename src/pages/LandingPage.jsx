import { Link } from "react-router-dom";
import {
  MessageCircle,
  Zap,
  Sparkles,
  Hash,
  Send,
  Target,
  Heart,
  Share2,
  Link as LinkIcon,
  Clock,
  Users,
  BarChart3,
  Check,
  ArrowRight,
  Instagram,
  CircleDot,
} from "lucide-react";
import Logo from "@/components/Logo";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Welcome DM",
    desc: "Greet anyone who messages you for the very first time — automatically.",
  },
  {
    icon: Hash,
    title: "Comment keywords",
    desc: "Someone comments ‘info’ on your post? Botlify slides into their DMs with the details.",
  },
  {
    icon: MessageCircle,
    title: "DM keywords",
    desc: "Reply to common questions like ‘price’ or ‘link’ in under a second — even while you sleep.",
  },
  {
    icon: Heart,
    title: "Story replies & mentions",
    desc: "Every time someone reacts to your story or tags you, they get a personal DM. No more lost leads.",
  },
  {
    icon: Share2,
    title: "Share to story → DM",
    desc: "When a fan shares your post to their story, say thanks (and drop a link) automatically.",
  },
  {
    icon: LinkIcon,
    title: "Tracked links for ads",
    desc: "Give each campaign its own link. Know exactly which ad brought each DM.",
  },
  {
    icon: Send,
    title: "Live-stream auto-replies",
    desc: "Mid-live someone types ‘buy’? Botlify DMs them the checkout link — you keep streaming.",
  },
  {
    icon: Target,
    title: "Chat starter buttons",
    desc: "Show quick buttons like ‘See pricing’ and ‘Book a call’ at the top of every new chat.",
  },
  {
    icon: CircleDot,
    title: "Fallback auto-reply",
    desc: "A safety net: if nothing else matches, a friendly default reply goes out.",
  },
  {
    icon: Clock,
    title: "Business-hours mode",
    desc: "A polite ‘we’re away, back at 9am’ message when your team is offline.",
  },
  {
    icon: Sparkles,
    title: "AI conversation bot",
    desc: "GPT-powered chats that actually sound like you. Premium plan only.",
    premium: true,
  },
  {
    icon: Users,
    title: "Team inbox",
    desc: "Assign chats, leave notes, and reply together — all in one shared inbox.",
  },
  {
    icon: BarChart3,
    title: "Clear analytics",
    desc: "See what’s working: DMs sent, replies earned, and which triggers convert best.",
  },
  {
    icon: Zap,
    title: "One-click bot pause",
    desc: "The second an agent jumps in, the bot steps back. No awkward double-replies.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top nav */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-ink-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-ink-600">
            <a href="#features" className="hover:text-ink-900">
              Features
            </a>
            <Link to="/pricing" className="hover:text-ink-900">
              Pricing
            </Link>
            <a href="#how" className="hover:text-ink-900">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-mesh pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <span className="badge-brand">
              <Instagram className="w-3 h-3" /> Instagram DM Automation
            </span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-ink-900">
              Turn every comment into a{" "}
              <span className="gradient-text">customer</span>
            </h1>
            <p className="mt-5 text-lg text-ink-600 max-w-2xl mx-auto">
              Botlify auto-DMs everyone who engages with your Instagram posts,
              stories, and lives — so you never miss a lead. No code. Live in 6
              minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="btn-primary !px-6 !py-3 text-base"
              >
                Start free — no card <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="btn-secondary !px-6 !py-3 text-base"
              >
                See pricing
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> 500 DMs/mo free
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> Setup in 6
                minutes
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> AI bot available
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600 p-1 shadow-hero">
              <div className="rounded-xl bg-white p-6 sm:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    {
                      label: "Comment received",
                      val: "DM",
                      accent: "text-brand-600",
                    },
                    {
                      label: "Bot replies in",
                      val: "<1s",
                      accent: "text-accent-600",
                    },
                    {
                      label: "Leads captured",
                      val: "24/7",
                      accent: "text-emerald-600",
                    },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className={`text-3xl font-bold ${s.accent}`}>
                        {s.val}
                      </div>
                      <div className="text-xs text-ink-500 mt-1 uppercase tracking-wide">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white border-y border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge-brand">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-ink-900">
              Everything you need to automate Instagram
            </h2>
            <p className="mt-3 text-ink-600">
              12 triggers, 1 inbox, infinite scale. No complicated flows — just
              click and go.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {FEATURES.map(({ icon: Icon, title, desc, premium }) => (
              <div key={title} className="card-hover p-5">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${premium ? "bg-premium-gradient" : "bg-brand-gradient"}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mt-4 font-semibold text-ink-900 flex items-center gap-2">
                  {title}
                  {premium && <span className="badge-premium">Premium</span>}
                </h3>
                <p className="text-sm text-ink-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <span className="badge-brand">How it works</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-ink-900">
              Live in 3 steps
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: 1,
                t: "Connect Instagram",
                d: "Secure OAuth — we never touch your password.",
              },
              {
                n: 2,
                t: "Set up a trigger",
                d: "Pick a keyword, write a reply, hit save.",
              },
              {
                n: 3,
                t: "Go live",
                d: "Botlify replies 24/7. You watch the leads roll in.",
              },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gradient text-white text-xl font-bold shadow-glow">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-ink-900 text-lg">
                  {s.t}
                </h3>
                <p className="text-sm text-ink-500 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest limitations section */}
      <section className="py-20 bg-white border-t border-ink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="badge-brand">Honest disclosure</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 mt-3">
              What Instagram{" "}
              <span className="text-gradient-brand">doesn't let us do</span>
            </h2>
            <p className="text-ink-500 mt-3 max-w-xl mx-auto">
              Other tools promise features Meta's API simply doesn't expose. We
              tell you upfront — so you pick Botlify for what it{" "}
              <em>actually</em> does.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                title: "No follow-trigger",
                desc: "Instagram's API has no follow webhook and no endpoint to list followers. No tool can DM every new follower. Anyone claiming otherwise is guessing — or violating Meta's policies.",
              },
              {
                title: "24-hour messaging window",
                desc: "You can only DM a user within 24 hours of their last message, comment, or story reply. Cold outreach is not permitted by the API.",
              },
              {
                title: "Business / Creator accounts only",
                desc: "Personal Instagram accounts cannot use the Graph API, so automation isn't available for them.",
              },
              {
                title: "No bulk cold DMs",
                desc: "Broadcasts only work for contacts who opened the 24-hour window with a recent message. No spraying random audiences.",
              },
            ].map((it) => (
              <div key={it.title} className="card p-5">
                <p className="font-semibold text-ink-900">{it.title}</p>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-400 text-center mt-6">
            If Meta relaxes these rules, Botlify will ship the feature within a
            week.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-mesh" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Ready to never miss a DM again?
          </h2>
          <p className="mt-4 text-ink-300">
            Start free. Upgrade when you outgrow 500 DMs/month.
          </p>
          <Link
            to="/register"
            className="btn-premium !px-8 !py-3 text-base mt-8 inline-flex"
          >
            Get started — it's free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-950 border-t border-ink-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" className="text-white" />
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Botlify. Built for creators.
          </p>
          <div className="flex gap-5 text-sm text-ink-400">
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link to="/pricing" className="hover:text-white">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
