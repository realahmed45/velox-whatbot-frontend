/**
 * Instagram Analytics — Botlify orange/white/black theme.
 * Surfaces DM reach, story replies, comment volume, follower-to-DM conversion.
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
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";
import {
  Heart,
  MessageCircle,
  Send,
  Bot,
  BarChart2,
  TrendingUp,
  Sparkles,
  Users,
  Clock,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";

const BRAND = "#ff5722";
const BRAND_LIGHT = "#ff7d3e";
const BRAND_SOFT = "#ffe6d5";
const AMBER = "#f59e0b";
const DONUT = ["#ff5722", "#f59e0b", "#ff7d3e", "#ffb38a"];

const PERIODS = [
  { key: "week", label: "7 days" },
  { key: "month", label: "30 days" },
  { key: "3months", label: "3 months" },
];

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

  const heroStats = overview
    ? [
        { label: "Total DMs", value: overview.totalMessages ?? "—" },
        { label: "Replies received", value: overview.inboundMessages ?? "—" },
        { label: "DMs sent", value: overview.outboundMessages ?? "—" },
        {
          label: "AI handled",
          value: overview.botHandledPct ? `${overview.botHandledPct}%` : "—",
          accent: true,
        },
      ]
    : [];

  return (
    <div className="min-h-full bg-ink-50/40">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <StatHero
          icon={BarChart2}
          title="Analytics"
          subtitle="DM volume, story replies, automation reach — see what's resonating with your audience."
          stats={heroStats}
        >
          <div className="flex gap-1.5 flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${
                  period === p.key
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-white/10 border border-white/15 text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </StatHero>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h2 className="font-bold text-ink-900 leading-tight">
                DM activity
              </h2>
              <p className="text-xs text-ink-500">Messages over time</p>
            </div>
          </div>
          {msgData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={msgData}
                margin={{ top: 6, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.32} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f0ee"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#8a857e" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(d) => dayjs(d).format("D MMM")}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8a857e" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f1f0ee",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={BRAND}
                  fill="url(#igGrad)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: BRAND }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak DM hours */}
          <div className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <h2 className="font-bold text-ink-900 leading-tight">
                  When followers DM you
                </h2>
                <p className="text-xs text-ink-500">Activity by hour</p>
              </div>
            </div>
            {peakData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={peakData}
                  margin={{ top: 6, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f0ee"
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: "#8a857e" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(h) => `${h}h`}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#8a857e" }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ fill: BRAND_SOFT, opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #f1f0ee",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={BRAND_LIGHT}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </div>

          {/* AI vs you donut */}
          <div className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <h2 className="font-bold text-ink-900 leading-tight">
                  Who's replying?
                </h2>
                <p className="text-xs text-ink-500">AI vs manual</p>
              </div>
            </div>
            {pie.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    innerRadius={48}
                    paddingAngle={2}
                    label
                  >
                    {pie.map((_, i) => (
                      <Cell
                        key={i}
                        fill={DONUT[i % DONUT.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #f1f0ee",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </div>
        </div>

        {/* Flow performance */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-ink-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h2 className="font-bold text-ink-900 leading-tight">
                Automation flows
              </h2>
              <p className="text-xs text-ink-500">Trigger-to-completion rate</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/60 border-b border-ink-100 text-left">
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-ink-500">
                    Flow
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-ink-500">
                    Triggered
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-ink-500">
                    Completed
                  </th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-ink-500">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {flowData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2 text-ink-400">
                        <div className="w-11 h-11 rounded-2xl bg-ink-50 flex items-center justify-center">
                          <Users className="w-5 h-5 text-ink-300" />
                        </div>
                        <p className="text-sm">No flow runs yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  flowData.map((f) => {
                    const pct = f.stats?.triggered
                      ? Math.round(
                          (f.stats.completed / f.stats.triggered) * 100,
                        )
                      : 0;
                    return (
                      <tr
                        key={f._id}
                        className="hover:bg-brand-50/40 transition"
                      >
                        <td className="px-5 py-3.5 font-bold text-ink-900">
                          {f.name}
                        </td>
                        <td className="px-5 py-3.5 text-ink-600">
                          {f.stats?.triggered ?? 0}
                        </td>
                        <td className="px-5 py-3.5 text-ink-600">
                          {f.stats?.completed ?? 0}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 max-w-[96px] h-2 bg-ink-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-brand-700 font-bold tabular-nums">
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
    </div>
  );
}

function IgStat({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm transition ${
        highlight
          ? "bg-gradient-to-br from-brand-500 to-brand-600 border border-transparent text-white"
          : "bg-white border border-ink-100 hover:border-brand-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            highlight ? "bg-white/20" : "bg-brand-50"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${highlight ? "text-white" : "text-brand-500"}`}
          />
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold ${
            highlight ? "text-white/80" : "text-ink-500"
          }`}
        >
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-black tabular-nums ${
          highlight ? "text-white" : "text-ink-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const Empty = () => (
  <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-ink-400">
    <div className="w-11 h-11 rounded-2xl bg-ink-50 flex items-center justify-center">
      <TrendingUp className="w-5 h-5 text-ink-300" />
    </div>
    <p className="text-sm">Not enough data yet — keep engaging!</p>
  </div>
);
