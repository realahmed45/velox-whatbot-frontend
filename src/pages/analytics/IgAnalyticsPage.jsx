/**
 * Instagram Analytics — Botlify orange/white/black theme.
 * Premium SaaS dashboard: headline hero, KPI grid, four charts, plan usage,
 * and automation-flow performance. Surfaces DM reach, audience growth,
 * automation coverage and follower-to-DM conversion.
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
  MessageCircle,
  Bot,
  BarChart2,
  TrendingUp,
  Sparkles,
  Users,
  Clock,
  Reply,
  UserPlus,
  MessagesSquare,
  Zap,
  Gauge,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";

const BRAND = "#ff5722";
const BRAND_LIGHT = "#ff7d3e";
const BRAND_SOFT = "#ffe6d5";
const DONUT = ["#ff5722", "#f59e0b", "#ff7d3e", "#ffb38a"];

const PERIODS = [
  { key: "week", label: "7 days" },
  { key: "month", label: "30 days" },
  { key: "3months", label: "3 months" },
];

// Shared tooltip look — rounded, soft shadow, no border noise.
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #f1f0ee",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

export default function IgAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [msgData, setMsgData] = useState([]);
  const [peakData, setPeakData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const [ov, msg, peak, flows, growth] = await Promise.all([
          api.get("/analytics/overview?channel=instagram"),
          api.get(
            `/analytics/messages-over-time?channel=instagram&period=${period}`,
          ),
          api.get("/analytics/peak-hours?channel=instagram"),
          api.get("/analytics/flow-performance?channel=instagram"),
          api
            .get("/analytics/contacts-growth?channel=instagram")
            .catch(() => ({ data: {} })),
        ]);
        if (!alive) return;
        setOverview(ov.data?.overview || ov.data);
        setMsgData(msg.data.data || []);
        setPeakData(peak.data.data || []);
        setFlowData(flows.data.flows || []);
        // contacts-growth returns [{ _id: "YYYY-MM-DD", count }]; normalise to
        // { date, count } so the chart uses the same clean dataKeys.
        const rawGrowth = growth?.data?.data || [];
        setGrowthData(
          Array.isArray(rawGrowth)
            ? rawGrowth
                .map((d) => ({
                  date: d.date || d._id || d.day,
                  count: d.count ?? d.total ?? d.value ?? 0,
                }))
                .filter((d) => d.date != null)
            : [],
        );
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [period]);

  const pie = overview
    ? [
        { name: "AI replies", value: overview.botHandled || 0 },
        { name: "Manual replies", value: overview.humanHandled || 0 },
      ]
    : [];

  const heroStats = overview
    ? [
        { label: "Total DMs", value: fmt(overview.totalMessages) },
        { label: "Reply rate", value: pct(overview.replyRate) },
        { label: "Active chats", value: fmt(overview.activeConversations) },
        {
          label: "AI handled",
          value: pct(overview.botHandledPct),
          accent: true,
        },
      ]
    : [];

  const usageUsed = overview?.planUsage?.used ?? 0;
  const usageLimit = overview?.planUsage?.limit;
  const usagePercent = overview?.planUsage?.percent ?? 0;
  const usageUnlimited = usageLimit === Infinity || usageLimit == null;

  return (
    <div className="min-h-full bg-ink-50/40">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <StatHero
          icon={BarChart2}
          title="Analytics"
          subtitle="DM volume, audience growth, automation reach — see what's resonating."
          help={{
            title: "Analytics",
            tips: [
              "Track DMs sent and received, reply rate, and how many replies your AI handled.",
              "Watch audience growth and see the hours your followers most often message you.",
              "Switch the time range (7 days, 30 days, 3 months) to spot trends.",
              "The flows table shows each automation's trigger-to-completion rate.",
              "Plan usage shows how many messages you've used against your monthly limit.",
            ],
          }}
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
        {loading && !overview ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <IgStat
              icon={MessageCircle}
              label="Total DMs"
              value={fmt(overview?.totalMessages)}
              sub={`${fmt(overview?.messagesToday)} today`}
            />
            <IgStat
              icon={Reply}
              label="Reply rate"
              value={pct(overview?.replyRate)}
              sub={`${fmt(overview?.outboundMessages)} sent`}
              tone={toneForRate(overview?.replyRate)}
            />
            <IgStat
              icon={Sparkles}
              label="AI handled"
              value={pct(overview?.botHandledPct)}
              sub="of all replies"
              highlight
            />
            <IgStat
              icon={MessagesSquare}
              label="Active chats"
              value={fmt(overview?.activeConversations)}
              sub={`${fmt(overview?.conversationsThisWeek)} this week`}
            />
            <IgStat
              icon={UserPlus}
              label="New leads"
              value={fmt(overview?.leadsThisMonth)}
              sub="this month"
              tone="good"
            />
            <IgStat
              icon={Users}
              label="Contacts"
              value={fmt(overview?.totalContacts)}
              sub="total audience"
            />
          </div>
        )}

        {/* DM activity + Audience growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* DM activity chart */}
          <ChartCard
            icon={TrendingUp}
            title="DM activity"
            subtitle="Messages over time"
          >
            {loading ? (
              <ChartSkeleton />
            ) : msgData.length > 0 ? (
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(d) => dayjs(d).format("ddd, D MMM")}
                    formatter={(v) => [v, "Messages"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={BRAND}
                    fill="url(#igGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: BRAND, stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty message="No messages in this window yet." />
            )}
          </ChartCard>

          {/* Audience growth (contacts-growth) */}
          <ChartCard
            icon={UserPlus}
            title="Audience growth"
            subtitle="New contacts (last 30 days)"
          >
            {loading ? (
              <ChartSkeleton />
            ) : growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={growthData}
                  margin={{ top: 6, right: 8, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="igGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={BRAND_LIGHT}
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor={BRAND_LIGHT}
                        stopOpacity={0}
                      />
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(d) => dayjs(d).format("ddd, D MMM")}
                    formatter={(v) => [v, "New contacts"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={BRAND_LIGHT}
                    fill="url(#igGrowth)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: BRAND_LIGHT,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty message="No new contacts tracked yet." />
            )}
          </ChartCard>
        </div>

        {/* Peak hours + AI vs Manual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak DM hours */}
          <ChartCard
            icon={Clock}
            title="When followers DM you"
            subtitle="Activity by hour of day"
          >
            {loading ? (
              <ChartSkeleton height={220} />
            ) : peakData.length > 0 ? (
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: BRAND_SOFT, opacity: 0.4 }}
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(h) => `${h}:00`}
                    formatter={(v) => [v, "Messages"]}
                  />
                  <Bar
                    dataKey="count"
                    fill={BRAND_LIGHT}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty message="Not enough hourly data yet." />
            )}
          </ChartCard>

          {/* AI vs you donut */}
          <ChartCard
            icon={Bot}
            title="Who's replying?"
            subtitle="AI vs manual responses"
          >
            {loading ? (
              <ChartSkeleton height={220} />
            ) : pie.some((d) => d.value > 0) ? (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={82}
                      innerRadius={54}
                      paddingAngle={2}
                      stroke="none"
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
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v, n) => [v, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty message="No replies recorded yet." />
            )}
          </ChartCard>
        </div>

        {/* Plan usage */}
        {overview && (
          <div className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <h2 className="font-bold text-ink-900 leading-tight">
                    Plan usage
                  </h2>
                  <p className="text-xs text-ink-500">Messages this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-ink-900 tabular-nums leading-none">
                  {fmt(usageUsed)}
                  <span className="text-ink-400 font-bold text-sm">
                    {" "}
                    / {usageUnlimited ? "∞" : fmt(usageLimit)}
                  </span>
                </p>
                {!usageUnlimited && (
                  <p
                    className={`text-[11px] font-bold mt-1 ${
                      usagePercent > 90
                        ? "text-red-600"
                        : usagePercent > 75
                          ? "text-amber-600"
                          : "text-ink-500"
                    }`}
                  >
                    {usagePercent}% used
                  </p>
                )}
              </div>
            </div>
            {usageUnlimited ? (
              <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-60" />
            ) : (
              <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent > 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-brand-400 to-brand-600"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
            {usagePercent > 90 && !usageUnlimited && (
              <p className="text-[11px] text-red-600 font-semibold mt-2.5 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                You're close to your monthly limit — consider upgrading.
              </p>
            )}
          </div>
        )}

        {/* Flow performance */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-ink-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-500" />
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
                          <Zap className="w-5 h-5 text-ink-300" />
                        </div>
                        <p className="text-sm">No flow runs yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  flowData.map((f) => {
                    const triggered =
                      f.stats?.triggered ?? f.stats?.totalTriggers ?? 0;
                    const completed = f.stats?.completed ?? 0;
                    const pctVal = triggered
                      ? Math.round((completed / triggered) * 100)
                      : 0;
                    return (
                      <tr
                        key={f._id}
                        className="hover:bg-brand-50/40 transition"
                      >
                        <td className="px-5 py-3.5 font-bold text-ink-900">
                          {f.name}
                        </td>
                        <td className="px-5 py-3.5 text-ink-600 tabular-nums">
                          {fmt(triggered)}
                        </td>
                        <td className="px-5 py-3.5 text-ink-600 tabular-nums">
                          {fmt(completed)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 max-w-[96px] h-2 bg-ink-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                                style={{ width: `${pctVal}%` }}
                              />
                            </div>
                            <span className="text-xs text-brand-700 font-bold tabular-nums">
                              {pctVal}%
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

/* ---------- helpers ---------- */

function fmt(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (typeof n !== "number") return n;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function pct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}%`;
}

function toneForRate(rate) {
  if (rate == null) return undefined;
  if (rate >= 80) return "good";
  if (rate < 40) return "warn";
  return undefined;
}

/* ---------- components ---------- */

function ChartCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h2 className="font-bold text-ink-900 leading-tight">{title}</h2>
          <p className="text-xs text-ink-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function IgStat({ icon: Icon, label, value, sub, highlight, tone }) {
  const toneClasses =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : "text-ink-400";
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 shadow-sm transition ${
        highlight
          ? "bg-gradient-to-br from-brand-500 to-brand-600 border border-transparent text-white"
          : "bg-white border border-ink-100 hover:border-brand-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            highlight ? "bg-white/20" : "bg-brand-50"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${highlight ? "text-white" : "text-brand-500"}`}
          />
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold truncate ${
            highlight ? "text-white/80" : "text-ink-500"
          }`}
        >
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-black tabular-nums leading-none ${
          highlight ? "text-white" : "text-ink-900"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] font-semibold mt-1.5 truncate ${
            highlight ? "text-white/75" : toneClasses
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-white border border-ink-100 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-ink-100" />
        <div className="h-2.5 w-16 rounded bg-ink-100" />
      </div>
      <div className="h-6 w-20 rounded bg-ink-100" />
      <div className="h-2.5 w-14 rounded bg-ink-100 mt-2.5" />
    </div>
  );
}

function ChartSkeleton({ height = 240 }) {
  return (
    <div
      className="w-full rounded-xl bg-ink-50 animate-pulse"
      style={{ height }}
    />
  );
}

const Empty = ({ message = "Not enough data yet — keep engaging!" }) => (
  <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-ink-400">
    <div className="w-11 h-11 rounded-2xl bg-ink-50 flex items-center justify-center">
      <TrendingUp className="w-5 h-5 text-ink-300" />
    </div>
    <p className="text-sm">{message}</p>
  </div>
);
