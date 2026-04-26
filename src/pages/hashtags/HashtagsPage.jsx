import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Hash, Sparkles, Copy, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
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
      <PageHeader
        icon={Hash}
        title={
          <span className="inline-flex items-center gap-2">
            Hashtag research
            <Badge variant="accent" size="xs">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </Badge>
          </span>
        }
        subtitle="AI-generated hashtags grouped by popularity. Mix big, medium, and niche tags for best reach."
      />

      <div className="card mb-5">
        <label className="label">Topic / Niche</label>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="e.g. handmade jewelry, fitness for women, Pakistani wedding photography"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && research()}
          />
          <select
            className="input w-32"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ur">Urdu (Roman)</option>
          </select>
          <button
            onClick={research}
            disabled={loading}
            className="btn btn-primary"
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
              {total} hashtags ready ·{" "}
              <span className="text-ink-400">tap to copy individual</span>
            </p>
            <button onClick={copyAll} className="btn btn-outline">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy All
            </button>
          </div>
          <div className="grid gap-4">
            <HashtagGroup
              title="Big Reach"
              description="1M+ posts · high competition"
              color="from-rose-500 to-pink-500"
              hashtags={groups.big}
            />
            <HashtagGroup
              title="Medium"
              description="100K–1M posts · balanced"
              color="from-amber-500 to-orange-500"
              hashtags={groups.medium}
            />
            <HashtagGroup
              title="Niche"
              description="<100K posts · highest engagement"
              color="from-emerald-500 to-green-600"
              hashtags={groups.niche}
            />
          </div>
        </>
      )}

      {!loading && total === 0 && (
        <div className="card text-center py-12">
          <Hash className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">
            Enter a topic and click Research to get 30 hashtag suggestions.
          </p>
        </div>
      )}
    </div>
  );
}

function HashtagGroup({ title, description, color, hashtags = [] }) {
  if (!hashtags.length) return null;
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${color}`} />
        <div>
          <h3 className="font-semibold text-ink-900">{title}</h3>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
        <span className="ml-auto chip bg-ink-100 text-ink-600 text-xs">
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
            className="px-2 py-1 rounded bg-ink-50 hover:bg-brand-50 hover:text-brand-700 text-xs font-mono text-ink-700 transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
