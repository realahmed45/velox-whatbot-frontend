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
  BarChart2,
  MessageSquare,
  Inbox,
  Send,
  Bot,
  DollarSign,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

const COLORS = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [msgData, setMsgData] = useState([]);
  const [peakData, setPeakData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const [roi, setRoi] = useState(null);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, msg, peak, flows, roiRes] = await Promise.all([
          api.get("/analytics/overview"),
          api.get(`/analytics/messages-over-time?period=${period}`),
          api.get("/analytics/peak-hours"),
          api.get("/analytics/flow-performance"),
          api.get("/analytics/roi?days=30"),
        ]);
        setOverview(ov.data);
        setMsgData(msg.data.data || []);
        setPeakData(peak.data.data || []);
        setFlowData(flows.data.flows || []);
        setRoi(roiRes.data.metrics || null);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [period]);

  const pieData = overview
    ? [
        { name: "Bot handled", value: overview.botHandled || 0 },
        { name: "Human handled", value: overview.humanHandled || 0 },
      ]
    : [];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={BarChart2}
        title="Analytics"
        subtitle="Track DMs sent, replies, and automation performance"
      >
        <div className="flex gap-1 bg-ink-100 rounded-lg p-1">
          {["week", "month", "3months"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${period === p ? "bg-white text-ink-800 shadow-sm" : "text-ink-500 hover:text-ink-700"}`}
            >
              {p === "week" ? "7 days" : p === "month" ? "30 days" : "3 months"}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={MessageSquare}
          label="Total Messages"
          value={overview?.totalMessages ?? "—"}
          accent="brand"
        />
        <StatCard
          icon={Inbox}
          label="Inbound"
          value={overview?.inboundMessages ?? "—"}
          accent="emerald"
        />
        <StatCard
          icon={Send}
          label="Outbound"
          value={overview?.outboundMessages ?? "—"}
          accent="accent"
        />
        <StatCard
          icon={Bot}
          label="Bot Handled"
          value={overview?.botHandledPct ? `${overview.botHandledPct}%` : "—"}
          accent="amber"
        />
      </div>

      {/* ROI / Revenue estimate */}
      {roi && (
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-ink-800">
                Estimated ROI (last 30 days)
              </h2>
              <p className="text-xs text-ink-500">
                Based on automated DMs × 3% conversion × $
                {roi.averageOrderValue} AOV. Adjust AOV in Settings →
                Automation.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RoiStat label="Automated Messages" value={roi.automatedMessages} />
            <RoiStat label="New Contacts" value={roi.newContacts} />
            <RoiStat label="Est. Sales" value={roi.estimatedSales} />
            <RoiStat
              label="Est. Revenue"
              value={`$${roi.estimatedRevenue.toLocaleString()}`}
              highlight
            />
          </div>
        </div>
      )}

      {/* Messages over time */}
      <div className="card p-5">
        <h2 className="font-semibold text-ink-800 mb-4">Messages over time</h2>
        {msgData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={msgData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
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
                stroke="#7c3aed"
                fill="url(#grad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Peak hours */}
        <div className="card p-5">
          <h2 className="font-semibold text-ink-800 mb-4">
            Peak message hours
          </h2>
          {peakData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakData}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(h) => `${h}:00`}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Bot vs Human pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-ink-800 mb-4">
            Bot vs Human handled
          </h2>
          {pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* Flow performance table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-ink-100">
          <h2 className="font-semibold text-ink-800">Flow performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">
                  Flow name
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">
                  Triggered
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">
                  Completed
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">
                  Completion rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {flowData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-ink-400 text-sm"
                  >
                    No flow data yet
                  </td>
                </tr>
              ) : (
                flowData.map((f) => (
                  <tr key={f._id}>
                    <td className="px-4 py-3 font-medium text-ink-800">
                      {f.name}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {f.stats?.triggered ?? 0}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {f.stats?.completed ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{
                              width: `${f.stats?.triggered ? Math.round((f.stats.completed / f.stats.triggered) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-ink-500">
                          {f.stats?.triggered
                            ? Math.round(
                                (f.stats.completed / f.stats.triggered) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const EmptyChart = () => (
  <div className="h-[200px] flex items-center justify-center text-ink-400 text-sm">
    No data for this period yet
  </div>
);

function RoiStat({ label, value, highlight }) {
  return (
    <div
      className={`rounded-lg p-3 ${highlight ? "bg-emerald-500 text-white" : "bg-white border border-emerald-100"}`}
    >
      <p
        className={`text-xl font-bold ${highlight ? "text-white" : "text-ink-900"}`}
      >
        {value}
      </p>
      <p
        className={`text-xs mt-1 ${highlight ? "text-white/80" : "text-ink-500"}`}
      >
        {label}
      </p>
    </div>
  );
}
