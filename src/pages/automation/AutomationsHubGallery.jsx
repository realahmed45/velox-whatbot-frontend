/**
 * Automations hub — ManyChat-style gallery for quick, one-tap automations.
 * (Custom Flows + the template gallery now live on the Custom Flows page.)
 */
import { ChevronRight, Lock } from "lucide-react";
import { Reveal, Spotlight } from "@/components/fx";

const CATEGORIES = [
  {
    id: "popular",
    label: "Popular",
    subtitle: "Start here — high impact, easy to set up",
  },
  {
    id: "engagement",
    label: "Engagement",
    subtitle: "Stories, mentions, and social triggers",
  },
  {
    id: "settings",
    label: "Routing & hours",
    subtitle: "Fallback replies and availability",
  },
];

const RANK = {
  free: 0,
  ig_starter: 1,
  ig_pro: 2,
  starter: 1,
  growth: 1,
  scale: 2,
  business: 2,
  agency: 2,
};

function GalleryCard({ tab, plan, lifetime, onOpen }) {
  const Icon = tab.icon;
  // Locked only if the account's tier is below what the feature needs (and not
  // a lifetime/comped account, which gets everything).
  const locked =
    !lifetime && (RANK[plan] ?? 0) < (RANK[tab.plan] ?? 0);

  return (
    <Spotlight
      as="button"
      type="button"
      onClick={onOpen}
      className="card-hover group relative w-full text-left p-5 flex flex-col h-full active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-3.5">
        <div className="w-11 h-11 rounded-xl bg-sunset-soft text-sunset-flame grid place-items-center transition-all duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] group-hover:bg-sunset group-hover:text-white">
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </div>
        {locked && (
          <span className="badge-premium inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
            <Lock className="w-2.5 h-2.5" /> Pro
          </span>
        )}
      </div>
      <p className="font-display font-semibold tracking-[-0.01em] text-[15px] text-ink-900">{tab.label}</p>
      <p className="text-[13px] text-ink-500 mt-1 flex-1 leading-relaxed">
        {tab.desc}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sunset-flame">
        {locked ? "Upgrade to use" : "Set up"}
        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
      </span>
    </Spotlight>
  );
}

export default function AutomationsHubGallery({
  tabs,
  onOpenTab,
  plan,
  lifetime,
}) {
  return (
    <div className="space-y-10">
      {CATEGORIES.map((cat, ci) => {
        const items = tabs.filter((t) => t.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id}>
            <Reveal delay={ci * 0.05} className="mb-4 flex items-center gap-2.5">
              <span className="w-1 h-6 rounded-full bg-sunset" />
              <div>
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900 leading-none">
                  {cat.label}
                </h2>
                <p className="text-[13px] text-ink-500 mt-1">{cat.subtitle}</p>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.06} className="h-full">
                  <GalleryCard
                    tab={t}
                    plan={plan}
                    lifetime={lifetime}
                    onOpen={() => onOpenTab(t.id)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
