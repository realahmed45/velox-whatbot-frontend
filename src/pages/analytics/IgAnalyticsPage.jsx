/**
 * Instagram Analytics — engagement-first metrics.
 *
 * Surfaces what matters on IG: DM reach, story replies, comment volume,
 * follower-to-DM conversion. Rose/fuchsia palette. Same backend endpoints
 * but the framing and labels are creator-focused, not business-support.
 */
import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import {
  Heart,
  MessageCircle,
  Send,
  Bot,
  Instagram,
  TrendingUp,
  Sparkles,
  Users,
} from "lucide-react";

const ROSE = "#f43f5e";
const ROSE_LIGHT = "#fb7185";
const COLORS = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7"];

export default function IgAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [msgData, setMsgData] = useState([]);
  const [peakData, setPeakData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, msg, peak, flows] = await Promise.all([
          api.get("/analytics/overview?channel=instagram"),
          api.get(
            `/analytics/messages-over-time?channel=instagram&period=${period}`,
          ),
          api.get("/analytics/peak-hours?channel=instagram"),
          api.get("/analytics/flow-performance?channel=instagram"),
        ]);
        setOverview(ov.data?.overview || ov.data);
        setMsgData(msg.data.data || []);
        setPeakData(peak.data.data || []);
        setFlowData(flows.data.flows || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [period]);

  const pie = overview
    ? [
        { name: "AI replies", value: overview.botHandled || 0 },
        { name: "Manual replies", value: overview.humanHandled || 0 },
      ]
    : [];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-5">
      {/* IG hero */}
      <div className="relative overflow-hidden border border-rose-200 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-violet-50 p-6">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center shadow-glow">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                Instagram Insights
              </h1>
              <p className="text-sm text-ink-600 mt-1">
                DM volume, story replies, automation reach — see what's
                resonating with your audience.
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-white border border-rose-200 p-0.5">
            {["week", "month", "3months"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[11px] font-bold transition ${
                  period === p
                    ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white"
                    : "text-ink-500 hover:text-rose-600"
                }`}
              >
                {p === "week"
                  ? "7 days"
                  : p === "month"
                    ? "30 days"
                    : "3 months"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* IG-flavoured KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <IgStat
          icon={MessageCircle}
          label="Total DMs"
          value={overview?.totalMessages ?? "—"}
        />
        <IgStat
          icon={Heart}
          label="Replies received"
          value={overview?.inboundMessages ?? "—"}
        />
        <IgStat
          icon={Send}
          label="DMs sent"
          value={overview?.outboundMessages ?? "—"}
        />
        <IgStat
          icon={Sparkles}
          label="AI handled"
          value={overview?.botHandledPct ? `${overview.botHandledPct}%` : "—"}
          highlight
        />
      </div>

      {/* DM activity chart */}
      <div className="bg-white border border-rose-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h2 className="font-bold text-ink-900">DM activity</h2>
        </div>
        {msgData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={msgData}>
              <defs>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ROSE} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={ROSE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => dayjs(d).format("D MMM")}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke={ROSE}
                fill="url(#igGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Peak DM hours */}
        <div className="bg-white border border-rose-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-ink-900">When followers DM you</h2>
          </div>
          {peakData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakData}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(h) => `${h}h`}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill={ROSE_LIGHT} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>

        {/* AI vs you donut */}
        <div className="bg-white border border-rose-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-ink-900">Who's replying?</h2>
          </div>
          {pie.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  label
                >
                  {pie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>
      </div>

      {/* Flow performance — IG-styled */}
      <div className="bg-white border border-rose-100">
        <div className="p-5 border-b border-rose-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-rose-500" />
          <h2 className="font-bold text-ink-900">Automation flows</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-50/50 border-b border-rose-100 text-left">
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-rose-700">
                  Flow
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-rose-700">
                  Triggered
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-rose-700">
                  Completed
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-rose-700">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {flowData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-ink-400 text-sm"
                  >
                    No flow runs yet.
                  </td>
                </tr>
              ) : (
                flowData.map((f) => {
                  const pct = f.stats?.triggered
                    ? Math.round((f.stats.completed / f.stats.triggered) * 100)
                    : 0;
                  return (
                    <tr key={f._id} className="hover:bg-rose-50/30">
                      <td className="px-4 py-3 font-bold text-ink-900">
                        {f.name}
                      </td>
                      <td className="px-4 py-3 text-ink-600">
                        {f.stats?.triggered ?? 0}
                      </td>
                      <td className="px-4 py-3 text-ink-600">
                        {f.stats?.completed ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] h-1.5 bg-rose-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-rose-700 font-bold">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IgStat({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`p-4 border ${
        highlight
          ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 border-transparent text-white"
          : "bg-white border-rose-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`w-4 h-4 ${highlight ? "text-white" : "text-rose-500"}`}
        />
        <span
          className={`text-[10px] uppercase tracking-wider font-bold ${highlight ? "text-white/80" : "text-rose-600"}`}
        >
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-black ${highlight ? "text-white" : "text-ink-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

const Empty = () => (
  <div className="h-[200px] flex items-center justify-center text-ink-400 text-sm">
    Not enough data yet — keep engaging!
  </div>
);
