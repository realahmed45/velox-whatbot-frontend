/**
 * Automations hub — ManyChat-style gallery for quick, one-tap automations.
 * (Custom Flows + the template gallery now live on the Custom Flows page.)
 */
import { ChevronRight, Lock } from "lucide-react";

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

function GalleryCard({ tab, plan, onOpen }) {
  const Icon = tab.icon;
  const locked = tab.plan !== "starter" && plan === "starter";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative text-left rounded-2xl border border-ink-100 bg-white p-5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-2 mb-3.5">
        <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {locked && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <Lock className="w-2.5 h-2.5" /> Pro
          </span>
        )}
      </div>
      <p className="font-bold text-sm text-ink-900">{tab.label}</p>
      <p className="text-xs text-ink-500 mt-1 flex-1 leading-relaxed">
        {tab.desc}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:gap-1.5 transition-all">
        {locked ? "Upgrade to use" : "Set up"}
        <ChevronRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

export default function AutomationsHubGallery({ tabs, onOpenTab, plan }) {
  return (
    <div className="space-y-9">
      {CATEGORIES.map((cat) => {
        const items = tabs.filter((t) => t.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full bg-brand-500" />
              <div>
                <h2 className="text-base font-black text-ink-900 leading-none">
                  {cat.label}
                </h2>
                <p className="text-xs text-ink-500 mt-1">{cat.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((t) => (
                <GalleryCard
                  key={t.id}
                  tab={t}
                  plan={plan}
                  onOpen={() => onOpenTab(t.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
