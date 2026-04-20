import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  MessageSquare,
  Users,
  GitBranch,
  TrendingUp,
  ArrowRight,
  Bot,
  Instagram,
  Heart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

export default function OverviewPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeWorkspace) return;
    const load = async () => {
      try {
        const [overviewRes, chartRes] = await Promise.all([
          api.get("/analytics/overview"),
          api.get("/analytics/messages-over-time?period=week"),
        ]);
        setStats(overviewRes.data);
        setChartData(chartRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeWorkspace]);

  const CARDS = [
    {
      label: "DMs Sent",
      value: stats?.totalMessages ?? "—",
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Followers Reached",
      value: stats?.totalContacts ?? "—",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Active Flows",
      value: stats?.activeFlows ?? "—",
      icon: GitBranch,
      color: "text-brand-600 bg-brand-50",
    },
    {
      label: "Automation Rate",
      value: stats?.botHandledPct ? `${stats.botHandledPct}%` : "—",
      icon: Bot,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Instagram status banner */}
      {workspace && workspace.instagram?.status !== "connected" && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-pink-500" />
            <div>
              <p className="font-medium text-pink-800 text-sm">
                Instagram not connected
              </p>
              <p className="text-pink-600 text-xs mt-0.5">
                Connect your Instagram account to start automating DMs.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-1.5 text-sm font-medium text-pink-700 border border-pink-300 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition"
          >
            Connect now <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm">
          {dayjs().format("dddd, MMMM D")}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} mb-3`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "…" : value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-4">DMs sent this week</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => dayjs(d).format("ddd")}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#16a34a"
                fill="url(#msgGradient)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
            {loading ? "Loading chart…" : "No data yet — start automating!"}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Build an automation flow",
              desc: "Automate DMs for new followers, keywords & more",
              to: "/dashboard/flows",
              icon: GitBranch,
            },
            {
              label: "View DM Inbox",
              desc: "Read and reply to conversations",
              to: "/dashboard/inbox",
              icon: MessageSquare,
            },
            {
              label: "Manage contacts",
              desc: "View followers & captured leads",
              to: "/dashboard/contacts",
              icon: Users,
            },
          ].map(({ label, desc, to, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="card p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
