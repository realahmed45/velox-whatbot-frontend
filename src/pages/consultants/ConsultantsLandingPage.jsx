/**
 * Public consultant program page — /consultants
 * Marketing pitch for door-to-door consultants who refer hotels to Botlify
 * for a 20% revenue share over 12 months.
 */
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowRight,
  Banknote,
  Building2,
  Check,
  ClipboardList,
  HandCoins,
  KeyRound,
  TrendingUp,
} from "lucide-react";

export default function ConsultantsLandingPage() {
  const token = useAuthStore((s) => s.token);
  const cta = token
    ? "/dashboard/consultant"
    : "/register?redirect=/dashboard/consultant";

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full bg-brand-500/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 w-[22rem] h-[22rem] rounded-full bg-amber-500/15 blur-[120px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-brand-200">
            <HandCoins className="w-3.5 h-3.5" /> Botlify Consultant Program
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tighter leading-[1.05]">
            Earn <span className="text-brand-500">20% of Botlify's revenue</span>{" "}
            from every hotel you sign.
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">
            For 12 full months, on everything — subscriptions and booking
            commissions. Walk into hotels, show them every booking channel in one place,
            and get paid monthly for every one that signs up with your code.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={cta}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition shadow-glow"
            >
              Become a consultant <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/20 text-white font-bold text-[15px] hover:bg-white/10 transition"
            >
              See what hotels pay
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-brand-400" /> No cost to join
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-brand-400" /> Paid monthly to your bank
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-brand-400" /> Unlimited hotels
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-bold uppercase tracking-wider text-brand-600">
              How it works
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-ink-950">
              Four steps to your first payout.
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: ClipboardList,
                title: "1 · Apply",
                desc: "Sign up and fill in a short application — approved within a day or two.",
              },
              {
                icon: KeyRound,
                title: "2 · Get your code",
                desc: "You receive a personal referral code that's yours forever.",
              },
              {
                icon: Building2,
                title: "3 · Sign hotels",
                desc: "Visit hotels, demo the one-place channel sync, and have them enter your code at sign-up.",
              },
              {
                icon: Banknote,
                title: "4 · Get paid monthly",
                desc: "20% of everything Botlify earns from your hotels, for 12 months each.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-black text-ink-900">{s.title}</p>
                  <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Earnings example */}
      <section className="py-16 sm:py-20 bg-ink-50/50 border-y border-ink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Your earnings
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-950">
                It adds up — fast.
              </h2>
              <p className="mt-3 text-ink-600 leading-relaxed">
                Hotels pay a monthly subscription plus a 10% commission on
                bookings the AI closes. You get 20% of all of it. Sign a few
                hotels a month and your share keeps stacking for a year per
                hotel.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "20% of subscription revenue",
                  "20% of Botlify's booking commissions",
                  "12 months per hotel, from the day they sign",
                  "Track everything live in your dashboard",
                ].map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 text-sm font-medium text-ink-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <div className="flex items-center gap-2 text-ink-400 text-xs font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-4 h-4" /> Example · 10 hotels on the
                $49 plan
              </div>
              {[
                ["Subscriptions", "10 × $49 = $490/mo"],
                ["Your 20% share", "$98 every month"],
                ["+ booking commissions", "20% of those too"],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex items-center justify-between py-2.5 border-b border-ink-50 last:border-0 text-sm"
                >
                  <span className="text-ink-500">{l}</span>
                  <span className="font-black text-ink-900">{v}</span>
                </div>
              ))}
              <p className="mt-3 text-[11px] text-ink-400">
                Illustrative example — your earnings depend on the hotels you
                sign and their booking volume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-ink-950">
            Know hotels? Start earning.
          </h2>
          <p className="mt-3 text-ink-600">
            Create your account, apply in two minutes, and get your referral
            code.
          </p>
          <Link
            to={cta}
            className="mt-7 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-500 text-white font-bold text-[15px] hover:bg-brand-600 transition shadow-glow"
          >
            Become a consultant <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
