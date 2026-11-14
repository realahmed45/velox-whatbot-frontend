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
import { Aurora, Magnetic, NumberTicker, Reveal, Spotlight, Tilt } from "@/components/fx";

export default function ConsultantsLandingPage() {
  const token = useAuthStore((s) => s.token);
  const cta = token
    ? "/dashboard/consultant"
    : "/register?redirect=/dashboard/consultant";

  return (
    <div className="relative isolate overflow-hidden bg-night-950 text-white grain">
      <Aurora variant="dark" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[90vh] bg-dot-grid-dark mask-fade-b opacity-60" />

      {/* Hero */}
      <section className="relative">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl text-xs font-semibold text-white/80">
              <HandCoins className="w-3.5 h-3.5 text-sunset-gold" strokeWidth={1.8} /> Botlify Consultant Program
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 font-display text-[2.6rem] sm:text-6xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.98]">
              Earn <span className="text-sunset">20% of Botlify's revenue</span>{" "}
              from every hotel you{" "}
              <span className="font-serif italic font-normal tracking-[-0.02em]">sign.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              For 12 full months, on everything — subscriptions and booking
              commissions. Walk into hotels, show them every booking channel in one place,
              and get paid monthly for every one that signs up with your code.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Magnetic strength={0.3}>
                <Link to={cta} className="group btn-primary px-7 py-4 text-[15px]">
                  Become a consultant{" "}
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Link to="/pricing" className="btn-glass-dark px-7 py-4 text-[15px]">
                See what hotels pay
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
              {["No cost to join", "Paid monthly to your bank", "Unlimited hotels"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sunset-gold" strokeWidth={2.2} /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Reveal>
              <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                How it works
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 font-display text-3xl sm:text-5xl font-semibold tracking-[-0.04em] leading-[1.02]">
                Four steps to your first{" "}
                <span className="font-serif italic font-normal">payout.</span>
              </h2>
            </Reveal>
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
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.07} className="h-full">
                  <Spotlight className="card-dark group h-full p-6 transition-transform duration-500 ease-spring hover:-translate-y-1">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.07] ring-1 ring-white/10 text-sunset-gold flex items-center justify-center mb-5 transition-all duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-8deg] group-hover:bg-sunset group-hover:text-white">
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <p className="font-display font-semibold tracking-[-0.02em] text-white">{s.title}</p>
                    <p className="text-sm text-white/55 mt-1.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Earnings example */}
      <section className="relative py-16 sm:py-24 border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Reveal>
                <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  Your earnings
                </span>
              </Reveal>
              <Reveal delay={0.06}>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em]">
                  It adds up —{" "}
                  <span className="font-serif italic font-normal">fast.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-3 text-white/60 leading-relaxed">
                  Hotels pay a monthly subscription plus a 10% commission on
                  bookings the AI closes. You get 20% of all of it. Sign a few
                  hotels a month and your share keeps stacking for a year per
                  hotel.
                </p>
              </Reveal>
              <ul className="mt-6 space-y-2.5">
                {[
                  "20% of subscription revenue",
                  "20% of Botlify's booking commissions",
                  "12 months per hotel, from the day they sign",
                  "Track everything live in your dashboard",
                ].map((p, i) => (
                  <Reveal as="li" key={p} delay={0.12 + i * 0.05} y={12}>
                    <span className="flex items-center gap-2.5 text-sm font-medium text-white/85">
                      <span className="w-5 h-5 rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/25 text-emerald-300 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" strokeWidth={2.6} />
                      </span>
                      {p}
                    </span>
                  </Reveal>
                ))}
              </ul>
            </div>
            <Reveal delay={0.1}>
              <Tilt max={6} className="rounded-2xl">
                <div className="card-dark p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-white/45 text-[11px] font-semibold uppercase tracking-[0.12em] mb-5">
                    <TrendingUp className="w-4 h-4 text-sunset-gold shrink-0" strokeWidth={1.8} /> Example · 10 hotels on the
                    $49 plan
                  </div>
                  <div className="mb-5">
                    <p className="font-display text-5xl font-semibold tracking-[-0.04em] text-sunset inline-block">
                      <NumberTicker value={98} prefix="$" />
                    </p>
                    <p className="text-xs text-white/45 mt-1">your share, every month</p>
                  </div>
                  {[
                    ["Subscriptions", "10 × $49 = $490/mo"],
                    ["Your 20% share", "$98 every month"],
                    ["+ booking commissions", "20% of those too"],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.07] last:border-0 text-sm"
                    >
                      <span className="text-white/55">{l}</span>
                      <span className="font-semibold text-white tabular-nums text-right">{v}</span>
                    </div>
                  ))}
                  <p className="mt-4 text-[11px] text-white/40">
                    Illustrative example — your earnings depend on the hotels you
                    sign and their booking volume.
                  </p>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-6xl font-semibold tracking-[-0.05em] leading-[0.98]">
              Know hotels?{" "}
              <span className="font-serif italic font-normal text-sunset pr-1">Start earning.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-4 text-white/60">
              Create your account, apply in two minutes, and get your referral
              code.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-8 flex justify-center">
              <Magnetic strength={0.3}>
                <Link to={cta} className="group btn-primary px-8 py-4 text-[15px]">
                  Become a consultant{" "}
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
