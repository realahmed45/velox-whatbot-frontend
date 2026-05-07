/**
 * WhatsApp Analytics — operational metrics.
 *
 * Surfaces what matters on WA: delivered, read receipts, response time, ROI.
 * Teal/emerald palette, dashboard-style KPI strip with bold numbers.
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
  MessageSquare,
  Inbox,
  Send,
  Bot,
  CheckCheck,
  TrendingUp,
  Briefcase,
  DollarSign,
} from "lucide-react";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#5eead4";
const COLORS = ["#0d9488", "#10b981", "#06b6d4", "#0ea5e9"];

export default function WaAnalyticsPage() {
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
          api.get("/analytics/overview?channel=whatsapp"),
          api.get(
            `/analytics/messages-over-time?channel=whatsapp&period=${period}`,
          ),
          api.get("/analytics/peak-hours?channel=whatsapp"),
          api.get("/analytics/flow-performance?channel=whatsapp"),
          api.get("/analytics/roi?days=30&channel=whatsapp"),
        ]);
        setOverview(ov.data?.overview || ov.data);
        setMsgData(msg.data.data || []);
        setPeakData(peak.data.data || []);
        setFlowData(flows.data.flows || []);
        setRoi(roiRes.data.metrics || null);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [period]);

  const pie = overview
    ? [
        { name: "Bot handled", value: overview.botHandled || 0 },
        { name: "Agent handled", value: overview.humanHandled || 0 },
      ]
    : [];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-5">
      {/* WA hero */}
      <div className="relative overflow-hidden border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-6">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-teal-600 flex items-center justify-center shadow">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                WhatsApp Performance
              </h1>
              <p className="text-sm text-ink-600 mt-1">
                Delivery, response time, automation efficiency and revenue
                impact across your WhatsApp channel.
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-white border border-teal-200 p-0.5">
            {["week", "month", "3months"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[11px] font-bold transition ${
                  period === p
                    ? "bg-teal-600 text-white"
                    : "text-ink-500 hover:text-teal-700"
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

      {/* KPI strip — table-row style */}
      <div className="bg-white border border-teal-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-teal-100">
        <KPI
          icon={MessageSquare}
          label="Total messages"
          value={overview?.totalMessages ?? "—"}
        />
        <KPI
          icon={Inbox}
          label="Inbound"
          value={overview?.inboundMessages ?? "—"}
        />
        <KPI
          icon={Send}
          label="Outbound"
          value={overview?.outboundMessages ?? "—"}
        />
        <KPI
          icon={CheckCheck}
          label="Bot resolved"
          value={overview?.botHandledPct ? `${overview.botHandledPct}%` : "—"}
        />
      </div>

      {/* ROI panel — WA-only signature feature */}
      {roi && (
        <div className="bg-white border-l-4 border-teal-600 border-y border-r border-teal-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="font-bold text-ink-900">
                Estimated ROI — last 30 days
              </h2>
              <p className="text-[11px] text-ink-500">
                Based on automated WhatsApp messages × 3% conversion × $
                {roi.averageOrderValue} AOV.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RoiTile label="Automated messages" value={roi.automatedMessages} />
            <RoiTile label="New customers" value={roi.newContacts} />
            <RoiTile label="Est. orders" value={roi.estimatedSales} />
            <RoiTile
              label="Est. revenue"
              value={`$${roi.estimatedRevenue.toLocaleString()}`}
              highlight
            />
          </div>
        </div>
      )}

      {/* Message volume */}
      <div className="bg-white border border-teal-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h2 className="font-bold text-ink-900">Message volume</h2>
        </div>
        {msgData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={msgData}>
              <defs>
                <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
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
                stroke={TEAL}
                fill="url(#waGrad)"
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
        <div className="bg-white border border-teal-100 p-5">
          <h2 className="font-bold text-ink-900 mb-4">Busy hours</h2>
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
                <Bar dataKey="count" fill={TEAL_LIGHT} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>

        <div className="bg-white border border-teal-100 p-5">
          <h2 className="font-bold text-ink-900 mb-4">Bot vs Agent</h2>
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

      {/* Flow performance */}
      <div className="bg-white border border-teal-100 overflow-hidden">
        <div className="p-5 border-b border-teal-100 flex items-center gap-2">
          <Bot className="w-4 h-4 text-teal-600" />
          <h2 className="font-bold text-ink-900">Flow conversion</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal-50/60 border-b border-teal-100 text-left">
              <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800">
                Flow
              </th>
              <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800">
                Triggered
              </th>
              <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800">
                Completed
              </th>
              <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800">
                Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
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
                  <tr key={f._id} className="hover:bg-teal-50/30">
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
                        <div className="flex-1 max-w-[80px] h-1.5 bg-teal-100 overflow-hidden">
                          <div
                            className="h-full bg-teal-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-teal-700 font-bold">
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
  );
}

function KPI({ icon: Icon, label, value }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-teal-700">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-ink-900 font-mono">{value}</p>
    </div>
  );
}

function RoiTile({ label, value, highlight }) {
  return (
    <div
      className={`p-3 ${
        highlight
          ? "bg-teal-600 text-white"
          : "bg-teal-50/60 border border-teal-200"
      }`}
    >
      <p
        className={`text-xl font-black ${highlight ? "text-white" : "text-ink-900"}`}
      >
        {value}
      </p>
      <p
        className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${highlight ? "text-white/80" : "text-teal-700"}`}
      >
        {label}
      </p>
    </div>
  );
}

const Empty = () => (
  <div className="h-[200px] flex items-center justify-center text-ink-400 text-sm">
    No data for this period yet.
  </div>
);
