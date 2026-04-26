import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Gift, Copy, Check, Share2, Users, DollarSign } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function ReferralPage() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await api.get("/referral");
      setData(data.referral);
    } catch (err) {
      console.error(err);
    }
  };

  const copy = () => {
    if (!data?.link) return;
    navigator.clipboard.writeText(data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied");
  };

  const share = async () => {
    if (navigator.share && data?.link) {
      try {
        await navigator.share({
          title: "Botlify — Instagram Automation",
          text: "Automate your Instagram DMs, comments, and content in one place. Try Botlify:",
          url: data.link,
        });
      } catch {}
    } else {
      copy();
    }
  };

  if (!data) {
    return <div className="p-6 text-ink-400">Loading…</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <PageHeader
        icon={Gift}
        title="Referrals"
        subtitle={<>Invite friends. Earn <b>$5 credit</b> for every paid signup. No limit.</>}
      />

      <div className="card bg-gradient-to-br from-brand-500 via-pink-500 to-orange-500 text-white mb-6">
        <p className="text-xs uppercase tracking-wider opacity-80">
          Your referral link
        </p>
        <div className="flex items-center gap-2 mt-2">
          <code className="font-mono bg-white/20 backdrop-blur px-3 py-2 rounded flex-1 truncate text-sm">
            {data.link}
          </code>
          <button
            onClick={copy}
            className="btn bg-white text-brand-700 hover:bg-white/90"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={share}
            className="btn bg-white/20 backdrop-blur text-white hover:bg-white/30"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
        <p className="text-xs opacity-70 mt-3">
          Code: <b className="font-mono">{data.code}</b>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Signups"
          value={data.signups}
          color="text-sky-600"
        />
        <StatCard
          icon={<Check className="w-5 h-5" />}
          label="Paid conversions"
          value={data.paidConversions}
          color="text-emerald-600"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Credits earned"
          value={`$${data.creditsEarned}`}
          color="text-brand-600"
        />
        <StatCard
          icon={<Gift className="w-5 h-5" />}
          label="Available credit"
          value={`$${data.creditsAvailable}`}
          color="text-rose-600"
        />
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold text-ink-900 mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-ink-700">
          <li>
            <span className="font-semibold text-brand-600">1.</span> Share your
            unique link with friends, clients, or your audience.
          </li>
          <li>
            <span className="font-semibold text-brand-600">2.</span> When they
            sign up using your link, you get a signup credit.
          </li>
          <li>
            <span className="font-semibold text-brand-600">3.</span> When they
            upgrade to any paid plan, you earn <b>$5</b> credit — applied to
            your next invoice.
          </li>
        </ol>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
