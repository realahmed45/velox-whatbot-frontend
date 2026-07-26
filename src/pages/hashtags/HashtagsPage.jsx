import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Hash,
  Sparkles,
  Copy,
  Check,
  Search,
  TrendingUp,
  Scale,
  Target,
  Lightbulb,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";
import Badge from "@/components/ui/Badge";

const EXAMPLE_TOPICS = [
  "Skincare",
  "Coffee shop",
  "Fitness",
  "Fashion",
  "Real estate",
  "Handmade jewelry",
];

const GROUP_META = {
  big: {
    title: "Big / Popular",
    strategy: "High reach, high competition — huge audiences, but posts get buried fast.",
    range: "1M+ posts",
    icon: TrendingUp,
    accent: "brand",
  },
  medium: {
    title: "Medium",
    strategy: "Balanced reach and competition — the sweet spot for steady growth.",
    range: "100K–1M posts",
    icon: Scale,
    accent: "amber",
  },
  niche: {
    title: "Niche",
    strategy: "Easier to rank — smaller, engaged communities that actually convert.",
    range: "under 100K posts",
    icon: Target,
    accent: "emerald",
  },
};

// Static class maps so Tailwind can see every class at build time.
const ACCENT = {
  brand: {
    bar: "bg-brand-500",
    iconWrap: "bg-brand-50 text-brand-500",
    count: "bg-brand-50 text-brand-700",
    chipHover: "hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700",
    copyHover: "hover:border-brand-300 hover:text-brand-700",
  },
  amber: {
    bar: "bg-amber-500",
    iconWrap: "bg-amber-50 text-amber-600",
    count: "bg-amber-50 text-amber-700",
    chipHover: "hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700",
    copyHover: "hover:border-amber-300 hover:text-amber-700",
  },
  emerald: {
    bar: "bg-emerald-500",
    iconWrap: "bg-emerald-50 text-emerald-600",
    count: "bg-emerald-50 text-emerald-700",
    chipHover: "hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700",
    copyHover: "hover:border-emerald-300 hover:text-emerald-700",
  },
};

export default function HashtagsPage() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState({ big: [], medium: [], niche: [] });
  const [copied, setCopied] = useState(false);

  const research = async (overrideTopic) => {
    const q = (typeof overrideTopic === "string" ? overrideTopic : topic).trim();
    if (!q) return toast.error("Enter a topic or niche");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/hashtags", {
        topic: q,
        language,
        count: 30,
      });
      setGroups(data.hashtags || { big: [], medium: [], niche: [] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const useExample = (t) => {
    setTopic(t);
    research(t);
  };

  const copyAll = () => {
    const all = [
      ...(groups.big || []),
      ...(groups.medium || []),
      ...(groups.niche || []),
    ].join(" ");
    if (!all) return;
    navigator.clipboard.writeText(all);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`Copied all ${all.split(" ").filter(Boolean).length} hashtags`);
  };

  const total =
    (groups.big?.length || 0) +
    (groups.medium?.length || 0) +
    (groups.niche?.length || 0);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <StatHero
          icon={Hash}
          eyebrow="Growth · AI"
          title={
            <span className="inline-flex items-center gap-2">
              Hashtag research
              <Badge variant="accent" size="xs">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </Badge>
            </span>
          }
          subtitle="AI-picked hashtags grouped by reach. Mix big, medium, and niche in every post."
          help={{
            title: "Hashtag research",
            tips: [
              "Enter a topic or niche and get 30 AI-picked hashtags built to grow your reach.",
              "Results are grouped by size: big for reach, medium for visibility, niche for engaged audiences.",
              "Mix all three groups in every post for the best balance of reach and ranking.",
              "Tap any tag to copy it, or copy a whole group at once.",
              "Switch language if you post in Urdu (Roman) instead of English.",
            ],
          }}
          stats={
            total > 0
              ? [
                  { label: "Total", value: total, accent: true },
                  { label: "Big", value: groups.big?.length || 0 },
                  { label: "Medium", value: groups.medium?.length || 0 },
                  { label: "Niche", value: groups.niche?.length || 0 },
                ]
              : undefined
          }
        />
      </div>

      {/* ── Search tool ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-7 mb-5">
        <div className="text-center max-w-lg mx-auto mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-ink-900 tracking-tight">
            What are you posting about?
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            Enter a topic or niche and get 30 hashtags built to grow your reach.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              className="w-full text-[15px] rounded-xl border border-ink-200 bg-white pl-11 pr-3 py-3 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
              placeholder="e.g. handmade jewelry, fitness coaching"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && research()}
            />
          </div>
          <select
            className="text-sm rounded-xl border border-ink-200 bg-white px-3 py-3 text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition sm:w-36"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ur">Urdu (Roman)</option>
          </select>
          <button
            onClick={() => research()}
            disabled={loading}
            className="text-sm font-bold px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Researching…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Research hashtags
              </>
            )}
          </button>
        </div>

        {/* Example topic chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="text-xs font-medium text-ink-400 mr-0.5">Try:</span>
          {EXAMPLE_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => useExample(t)}
              disabled={loading}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Strategy helper ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-white text-brand-500 flex items-center justify-center shrink-0 shadow-sm">
          <Lightbulb className="w-4 h-4" />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-600 pt-1">
          <span className="font-semibold text-ink-900">Strategy tip:</span> mix{" "}
          <span className="font-semibold text-brand-700">big</span> +{" "}
          <span className="font-semibold text-amber-700">medium</span> +{" "}
          <span className="font-semibold text-emerald-700">niche</span> tags in
          every post. Big tags spike reach, medium keep you visible, and niche
          tags land you with people who actually engage.
        </p>
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      {total > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-ink-600">
              <span className="font-semibold text-ink-900">{total}</span>{" "}
              hashtags ready ·{" "}
              <span className="text-ink-400">tap any tag to copy it</span>
            </p>
            <button
              onClick={copyAll}
              className="text-sm font-bold px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 transition shadow-sm"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : `Copy all ${total}`}
            </button>
          </div>

          <div className="grid gap-4">
            <HashtagGroup groupKey="big" hashtags={groups.big} />
            <HashtagGroup groupKey="medium" hashtags={groups.medium} />
            <HashtagGroup groupKey="niche" hashtags={groups.niche} />
          </div>
        </>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!loading && total === 0 && (
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm text-center py-14 px-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
            <Hash className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-ink-900">
            Discover your best hashtags
          </p>
          <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
            Enter a topic above or pick an example to get 30 AI-picked hashtags
            grouped by reach — big, medium, and niche.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => useExample(t)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading skeletons ───────────────────────────────────── */}
      {loading && total === 0 && (
        <div className="grid gap-4">
          {["brand", "amber", "emerald"].map((accent, i) => (
            <div
              key={i}
              className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-1.5 h-9 rounded-full ${ACCENT[accent].bar} opacity-30`} />
                <div className="space-y-2">
                  <div className="h-3.5 w-28 rounded bg-ink-100 animate-pulse" />
                  <div className="h-2.5 w-44 rounded bg-ink-50 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-7 rounded-lg bg-ink-50 animate-pulse"
                    style={{ width: `${52 + ((j * 17) % 60)}px` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HashtagGroup({ groupKey, hashtags = [] }) {
  const [groupCopied, setGroupCopied] = useState(false);
  if (!hashtags.length) return null;

  const meta = GROUP_META[groupKey];
  const a = ACCENT[meta.accent];
  const Icon = meta.icon;

  const copyGroup = () => {
    const text = hashtags.join(" ");
    navigator.clipboard.writeText(text);
    setGroupCopied(true);
    setTimeout(() => setGroupCopied(false), 2000);
    toast.success(`Copied ${hashtags.length} ${meta.title} hashtags`);
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-1.5">
        <div className={`w-1.5 h-9 rounded-full ${a.bar}`} />
        <div className={`w-9 h-9 rounded-xl ${a.iconWrap} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink-900">{meta.title}</h3>
            <span className={`chip ${a.count} text-[11px] font-semibold px-2 py-0.5 rounded-full`}>
              {hashtags.length}
            </span>
          </div>
          <p className="text-xs text-ink-400">{meta.range}</p>
        </div>
        <button
          onClick={copyGroup}
          className={`ml-auto shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-ink-200 bg-white text-ink-600 ${a.copyHover} flex items-center gap-1.5 transition`}
        >
          {groupCopied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {groupCopied ? "Copied" : "Copy all"}
        </button>
      </div>

      <p className="text-[13px] text-ink-500 mb-4 pl-[18px]">{meta.strategy}</p>

      <div className="flex flex-wrap gap-1.5">
        {hashtags.map((tag, i) => (
          <button
            key={i}
            onClick={() => {
              navigator.clipboard.writeText(tag);
              toast.success(`Copied ${tag}`);
            }}
            className={`px-2.5 py-1 rounded-lg bg-ink-50 border border-transparent ${a.chipHover} text-xs font-mono text-ink-700 transition`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
