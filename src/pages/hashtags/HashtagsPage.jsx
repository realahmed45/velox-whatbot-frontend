import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Hash, Sparkles, Copy, Check, Search } from "lucide-react";
import StatHero from "@/components/ui/StatHero";
import Badge from "@/components/ui/Badge";

export default function HashtagsPage() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState({ big: [], medium: [], niche: [] });
  const [copied, setCopied] = useState(false);

  const research = async () => {
    if (!topic.trim()) return toast.error("Enter a topic or niche");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/hashtags", {
        topic,
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

  const copyAll = () => {
    const all = [
      ...(groups.big || []),
      ...(groups.medium || []),
      ...(groups.niche || []),
    ].join(" ");
    navigator.clipboard.writeText(all);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`Copied ${all.split(" ").length} hashtags`);
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
          subtitle="AI-generated hashtags grouped by popularity. Mix big, medium, and niche tags for best reach."
          stats={
            total > 0
              ? [
                  { label: "Total hashtags", value: total, accent: true },
                  { label: "Big reach", value: groups.big?.length || 0 },
                  { label: "Medium", value: groups.medium?.length || 0 },
                  { label: "Niche", value: groups.niche?.length || 0 },
                ]
              : undefined
          }
        />
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition p-5 sm:p-6 mb-6">
        <label className="block text-xs font-semibold text-ink-600 mb-2">
          Topic / Niche
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              className="w-full text-sm rounded-xl border border-ink-200 bg-white pl-10 pr-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
              placeholder="e.g. handmade jewelry, fitness for women, Pakistani wedding photography"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && research()}
            />
          </div>
          <select
            className="text-sm rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition sm:w-36"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ur">Urdu (Roman)</option>
          </select>
          <button
            onClick={research}
            disabled={loading}
            className="text-sm font-bold px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Researching…" : "Research"}
          </button>
        </div>
      </div>

      {total > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink-600">
              <span className="font-semibold text-ink-900">{total}</span>{" "}
              hashtags ready ·{" "}
              <span className="text-ink-400">tap to copy individual</span>
            </p>
            <button
              onClick={copyAll}
              className="text-sm font-bold px-3.5 py-2 rounded-xl border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700 flex items-center gap-1.5 transition"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy all
            </button>
          </div>
          <div className="grid gap-4">
            <HashtagGroup
              title="Big Reach"
              description="1M+ posts · high competition"
              color="from-brand-500 to-brand-600"
              hashtags={groups.big}
            />
            <HashtagGroup
              title="Medium"
              description="100K–1M posts · balanced"
              color="from-amber-400 to-brand-500"
              hashtags={groups.medium}
            />
            <HashtagGroup
              title="Niche"
              description="<100K posts · highest engagement"
              color="from-brand-400 to-amber-500"
              hashtags={groups.niche}
            />
          </div>
        </>
      )}

      {!loading && total === 0 && (
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm text-center py-14 px-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
            <Hash className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-ink-900">
            Discover your best hashtags
          </p>
          <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
            Enter a topic and click Research to get 30 AI-picked hashtag
            suggestions grouped by reach.
          </p>
        </div>
      )}

      {loading && total === 0 && (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-ink-100 bg-ink-50 animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HashtagGroup({ title, description, color, hashtags = [] }) {
  if (!hashtags.length) return null;
  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-1.5 h-9 rounded-full bg-gradient-to-b ${color}`} />
        <div>
          <h3 className="font-bold text-ink-900">{title}</h3>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
        <span className="ml-auto chip bg-brand-50 text-brand-700 text-xs font-semibold">
          {hashtags.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {hashtags.map((tag, i) => (
          <button
            key={i}
            onClick={() => {
              navigator.clipboard.writeText(tag);
              toast.success(`Copied ${tag}`);
            }}
            className="px-2.5 py-1 rounded-lg bg-ink-50 border border-transparent hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 text-xs font-mono text-ink-700 transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
