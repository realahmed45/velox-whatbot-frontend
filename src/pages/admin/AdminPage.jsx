/**
 * Botlify Admin Panel — /admin
 *
 * Fully self-contained: its own login (email + password checked server-side
 * against ADMIN_EMAIL / ADMIN_PASSWORD env), its own token in localStorage
 * ("botlify_admin_token"), and its own axios instance so it never touches the
 * normal user-auth flow. Read-only overview of users, subscriptions & stats.
 */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Loader2,
  LogOut,
  Users,
  CreditCard,
  Instagram,
  TrendingUp,
  Star,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://velox-whatbot-backend.onrender.com/api";
const TOKEN_KEY = "botlify_admin_token";

const adminApi = axios.create({ baseURL: API_BASE });
adminApi.interceptors.request.use((cfg) => {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function AdminPage() {
  const [authed, setAuthed] = useState(!!localStorage.getItem(TOKEN_KEY));

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

/* ── Login ──────────────────────────────────────────────────────────── */
function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.post("/admin/login", { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="font-black text-ink-900 leading-tight">
              Botlify Admin
            </h1>
            <p className="text-xs text-ink-500">Restricted access</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-xs font-bold text-ink-600 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          placeholder="admin@email.com"
          required
        />
        <label className="block text-xs font-bold text-ink-600 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          placeholder="••••••••"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 text-white font-bold py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────── */
function AdminDashboard({ onLogout }) {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    onLogout();
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, us, sb] = await Promise.all([
        adminApi.get("/admin/overview"),
        adminApi.get("/admin/users", { params: { limit: 100 } }),
        adminApi.get("/admin/subscriptions"),
      ]);
      setOverview(ov.data);
      setUsers(us.data.users || []);
      setSubs(sb.data.subscriptions || []);
    } catch (err) {
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const searchUsers = async (term) => {
    setQ(term);
    try {
      const { data } = await adminApi.get("/admin/users", {
        params: { limit: 100, q: term },
      });
      setUsers(data.users || []);
    } catch {
      /* ignore */
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-ink-50">
      {/* top bar */}
      <div className="bg-ink-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </span>
            <span className="font-black">Botlify Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="text-xs font-semibold text-ink-300 hover:text-white flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={logout}
              className="text-xs font-semibold text-ink-300 hover:text-white flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading && !overview ? (
          <div className="py-24 text-center text-ink-400">
            <Loader2 className="w-6 h-6 animate-spin inline" />
          </div>
        ) : (
          <>
            {/* stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <StatCard
                icon={Users}
                label="Total users"
                value={overview?.users?.total ?? 0}
                sub={`+${overview?.users?.today ?? 0} today · +${overview?.users?.thisWeek ?? 0} this week`}
              />
              <StatCard
                icon={CreditCard}
                label="Active subscriptions"
                value={overview?.subscriptions?.active ?? 0}
                sub={`${overview?.subscriptions?.trialing ?? 0} trialing`}
              />
              <StatCard
                icon={Instagram}
                label="IG connected"
                value={overview?.workspaces?.igConnected ?? 0}
                sub={`${overview?.workspaces?.total ?? 0} workspaces`}
              />
              <StatCard
                icon={Star}
                label="Early-bird used"
                value={`${overview?.users?.earlyBird ?? 0}/${overview?.users?.earlyBirdLimit ?? 100}`}
                sub={`${overview?.users?.earlyBirdRemaining ?? 0} spots left`}
              />
            </div>

            {/* tabs */}
            <div className="flex gap-1 bg-ink-100 rounded-xl p-1 mb-4 max-w-xs">
              {[
                { id: "users", label: `Users (${users.length})` },
                { id: "subs", label: `Subs (${subs.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    tab === t.id
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "users" && (
              <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
                <div className="p-3 border-b border-ink-100">
                  <input
                    value={q}
                    onChange={(e) => searchUsers(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full sm:w-72 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                        <th className="px-4 py-2.5 font-semibold">#</th>
                        <th className="px-4 py-2.5 font-semibold">Name</th>
                        <th className="px-4 py-2.5 font-semibold">Email</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                        <th className="px-4 py-2.5 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u._id}
                          className="border-b border-ink-50 hover:bg-ink-50/50"
                        >
                          <td className="px-4 py-2.5 text-ink-400">
                            {u.signupNumber ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-ink-900">
                            {u.name}
                          </td>
                          <td className="px-4 py-2.5 text-ink-600">{u.email}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {u.isEmailVerified ? (
                                <Badge tone="green">verified</Badge>
                              ) : (
                                <Badge tone="gray">unverified</Badge>
                              )}
                              {u.earlyBird && (
                                <Badge tone="brand">early-bird</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-ink-500">
                            {fmtDate(u.createdAt)}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center text-ink-400"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "subs" && (
              <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                      <th className="px-4 py-2.5 font-semibold">Workspace</th>
                      <th className="px-4 py-2.5 font-semibold">IG</th>
                      <th className="px-4 py-2.5 font-semibold">Plan</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                      <th className="px-4 py-2.5 font-semibold">Provider</th>
                      <th className="px-4 py-2.5 font-semibold">Renews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-ink-50 hover:bg-ink-50/50"
                      >
                        <td className="px-4 py-2.5 font-semibold text-ink-900">
                          {s.name}
                        </td>
                        <td className="px-4 py-2.5 text-ink-600">
                          {s.igUsername ? `@${s.igUsername}` : "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge tone="brand">{s.plan}</Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            tone={
                              s.status === "active"
                                ? "green"
                                : s.status === "trialing"
                                  ? "amber"
                                  : "gray"
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-ink-500">
                          {s.provider || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-ink-500">
                          {fmtDate(s.currentPeriodEnd)}
                        </td>
                      </tr>
                    ))}
                    {subs.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-ink-400"
                        >
                          No paid subscriptions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-4">
      <div className="flex items-center gap-2 text-ink-500 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-black text-ink-900">{value}</p>
      {sub && <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Badge({ tone = "gray", children }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    gray: "bg-ink-100 text-ink-600 border-ink-200",
  };
  return (
    <span
      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
