/**
 * Botlify Admin Panel — /admin
 *
 * Fully self-contained: its own login (email + password checked server-side
 * against ADMIN_EMAIL / ADMIN_PASSWORD env), its own token in localStorage
 * ("botlify_admin_token"), and its own axios instance so it never touches the
 * normal user-auth flow. Read-only observability: funnel, per-user activity,
 * subscriptions, and a live event timeline.
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
  RefreshCw,
  ShieldCheck,
  Search,
  Activity,
  CheckCircle2,
  UserPlus,
  Sparkles,
  Crown,
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
            <h1 className="font-black text-lg text-ink-900 leading-none">
              Botlify Admin
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">Founder access only</p>
          </div>
        </div>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <label className="block text-xs font-semibold text-ink-600 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm mb-3 outline-none focus:border-brand-400"
          required
        />
        <label className="block text-xs font-semibold text-ink-600 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm mb-5 outline-none focus:border-brand-400"
          required
        />
        <button
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

/* ── Stage badge ────────────────────────────────────────────────────── */
const STAGE_META = {
  signed_up: { label: "Signed up", cls: "bg-ink-100 text-ink-600" },
  onboarded: { label: "Onboarded", cls: "bg-blue-100 text-blue-700" },
  knowledge: { label: "Added knowledge", cls: "bg-violet-100 text-violet-700" },
  connected: { label: "IG connected", cls: "bg-pink-100 text-pink-700" },
  trial: { label: "On trial", cls: "bg-amber-100 text-amber-700" },
  paying: { label: "Paying", cls: "bg-emerald-100 text-emerald-700" },
  canceling: { label: "Canceling", cls: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  lifetime: { label: "Lifetime", cls: "bg-brand-100 text-brand-700" },
};
function StageBadge({ stage }) {
  const m = STAGE_META[stage] || STAGE_META.signed_up;
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

const EVENT_ICON = {
  signup: UserPlus,
  ig_connected: Instagram,
  payment: CreditCard,
  knowledge_added: Sparkles,
  trial_expired: Activity,
  onboarded: CheckCircle2,
};

/* ── Dashboard ──────────────────────────────────────────────────────── */
function AdminDashboard({ onLogout }) {
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [subs, setSubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("activity");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    onLogout();
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, ac, sb, tl] = await Promise.all([
        adminApi.get("/admin/overview"),
        adminApi.get("/admin/activity", { params: { limit: 200 } }),
        adminApi.get("/admin/subscriptions"),
        adminApi.get("/admin/timeline", { params: { limit: 150 } }),
      ]);
      setOverview(ov.data);
      setRows(ac.data.rows || []);
      setSubs(sb.data.subscriptions || []);
      setEvents(tl.data.events || []);
    } catch (err) {
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const searchActivity = async (term, stageVal) => {
    setQ(term);
    try {
      const { data } = await adminApi.get("/admin/activity", {
        params: { limit: 200, q: term, stage: stageVal || undefined },
      });
      setRows(data.rows || []);
    } catch {
      /* ignore */
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";
  const fmtDT = (d) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const f = overview?.funnel || {};

  return (
    <div className="min-h-screen bg-ink-50">
      {/* top bar */}
      <div className="bg-ink-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading && !overview ? (
          <div className="py-24 text-center text-ink-400">
            <Loader2 className="w-6 h-6 animate-spin inline" />
          </div>
        ) : (
          <>
            {/* stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
              <StatCard
                icon={Users}
                label="Total users"
                value={overview?.users?.total ?? 0}
                sub={`+${overview?.users?.today ?? 0} today · +${overview?.users?.thisWeek ?? 0} this week`}
              />
              <StatCard
                icon={Instagram}
                label="IG connected"
                value={overview?.workspaces?.igConnected ?? 0}
                sub={`${overview?.workspaces?.onboarded ?? 0} onboarded`}
              />
              <StatCard
                icon={CreditCard}
                label="Paying"
                value={overview?.subscriptions?.paying ?? 0}
                sub={`${overview?.subscriptions?.trialing ?? 0} on trial · ${overview?.subscriptions?.lifetime ?? 0} lifetime`}
              />
              <StatCard
                icon={TrendingUp}
                label="Est. MRR"
                value={`$${overview?.subscriptions?.estimatedMrr ?? 0}`}
                sub={`${overview?.users?.verified ?? 0} verified`}
              />
            </div>

            {/* funnel */}
            <div className="bg-white rounded-2xl border border-ink-100 p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">
                Conversion funnel
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Signed up", f.signedUp, "bg-ink-100 text-ink-700"],
                  ["Onboarded", f.onboarded, "bg-blue-100 text-blue-700"],
                  ["IG connected", f.connectedIg, "bg-pink-100 text-pink-700"],
                  [
                    "Added knowledge",
                    f.addedKnowledge,
                    "bg-violet-100 text-violet-700",
                  ],
                  ["On trial", f.onTrial, "bg-amber-100 text-amber-700"],
                  ["Paying", f.paying, "bg-emerald-100 text-emerald-700"],
                ].map(([label, val, cls], i, arr) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`rounded-xl px-3.5 py-2.5 ${cls} min-w-[92px]`}
                    >
                      <div className="text-2xl font-black leading-none">
                        {val ?? 0}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide mt-1">
                        {label}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="text-ink-300 font-black">›</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* tabs */}
            <div className="flex gap-1 bg-ink-100 rounded-xl p-1 mb-4 max-w-lg">
              {[
                { id: "activity", label: `Users (${rows.length})` },
                { id: "timeline", label: `Timeline (${events.length})` },
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

            {/* ── ACTIVITY (main user table) ── */}
            {tab === "activity" && (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={q}
                      onChange={(e) => searchActivity(e.target.value, stage)}
                      placeholder="Search name or email…"
                      className="w-full rounded-xl border border-ink-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-400"
                    />
                  </div>
                  <select
                    value={stage}
                    onChange={(e) => {
                      setStage(e.target.value);
                      searchActivity(q, e.target.value);
                    }}
                    className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                  >
                    <option value="">All stages</option>
                    <option value="signed_up">Signed up</option>
                    <option value="onboarded">Onboarded</option>
                    <option value="knowledge">Added knowledge</option>
                    <option value="connected">IG connected</option>
                    <option value="trial">On trial</option>
                    <option value="paying">Paying</option>
                    <option value="canceling">Canceling</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                        <th className="px-3 py-2.5">#</th>
                        <th className="px-3 py-2.5">User</th>
                        <th className="px-3 py-2.5">Stage</th>
                        <th className="px-3 py-2.5">Instagram</th>
                        <th className="px-3 py-2.5">Plan</th>
                        <th className="px-3 py-2.5">Knowledge</th>
                        <th className="px-3 py-2.5">Msgs / AI</th>
                        <th className="px-3 py-2.5">Signed up</th>
                        <th className="px-3 py-2.5">Last login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.userId}
                          className="border-b border-ink-50 hover:bg-ink-50/60"
                        >
                          <td className="px-3 py-2.5 text-ink-400 font-mono text-xs">
                            {r.signupNumber ?? "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-ink-900 flex items-center gap-1.5">
                              {r.name || "—"}
                              {r.lifetime && (
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="text-xs text-ink-400">
                              {r.email}
                              {!r.verified && (
                                <span className="ml-1 text-amber-600">
                                  · unverified
                                </span>
                              )}
                              <span className="ml-1 text-ink-300">
                                · {r.signupMethod}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <StageBadge stage={r.stage} />
                          </td>
                          <td className="px-3 py-2.5">
                            {r.ig.connected ? (
                              <div>
                                <div className="font-medium text-ink-800">
                                  @{r.ig.username || "—"}
                                </div>
                                <div className="text-xs text-ink-400">
                                  {r.ig.followers?.toLocaleString()} followers
                                </div>
                              </div>
                            ) : (
                              <span className="text-ink-300">Not connected</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="text-ink-800 capitalize">
                              {r.lifetime ? "lifetime" : r.plan}
                            </div>
                            <div className="text-xs text-ink-400">
                              {r.subStatus || "—"}
                              {r.trialEndsAt &&
                                r.subStatus === "trialing" &&
                                ` · ends ${fmtDate(r.trialEndsAt)}`}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-ink-700">
                            {r.knowledgeSources} src
                            {!r.aiEnabled && (
                              <span className="text-red-500"> · AI off</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-ink-700">
                            {r.messagesThisMonth} / {r.aiRepliesThisMonth}
                          </td>
                          <td className="px-3 py-2.5 text-ink-500 text-xs">
                            {fmtDate(r.signedUpAt)}
                          </td>
                          <td className="px-3 py-2.5 text-ink-500 text-xs">
                            {fmtDate(r.lastLogin)}
                          </td>
                        </tr>
                      ))}
                      {!rows.length && (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-3 py-10 text-center text-ink-400"
                          >
                            No users match.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── TIMELINE ── */}
            {tab === "timeline" && (
              <div className="bg-white rounded-2xl border border-ink-100 divide-y divide-ink-50">
                {events.map((e) => {
                  const Icon = EVENT_ICON[e.type] || Activity;
                  return (
                    <div
                      key={e._id}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-800">{e.message}</p>
                        {e.userEmail && (
                          <p className="text-xs text-ink-400">{e.userEmail}</p>
                        )}
                      </div>
                      <span className="text-xs text-ink-400 shrink-0">
                        {fmtDT(e.createdAt)}
                      </span>
                    </div>
                  );
                })}
                {!events.length && (
                  <div className="px-4 py-10 text-center text-ink-400">
                    No activity yet.
                  </div>
                )}
              </div>
            )}

            {/* ── SUBS ── */}
            {tab === "subs" && (
              <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                      <th className="px-3 py-2.5">Workspace</th>
                      <th className="px-3 py-2.5">IG</th>
                      <th className="px-3 py-2.5">Plan</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Provider</th>
                      <th className="px-3 py-2.5">Renews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-ink-50 hover:bg-ink-50/60"
                      >
                        <td className="px-3 py-2.5 font-medium text-ink-900">
                          {s.name}
                        </td>
                        <td className="px-3 py-2.5 text-ink-600">
                          {s.igUsername ? `@${s.igUsername}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 capitalize">{s.plan}</td>
                        <td className="px-3 py-2.5 capitalize">{s.status}</td>
                        <td className="px-3 py-2.5 text-ink-500">
                          {s.provider || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-ink-500 text-xs">
                          {fmtDate(s.currentPeriodEnd)}
                        </td>
                      </tr>
                    ))}
                    {!subs.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-10 text-center text-ink-400"
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
      <div className="flex items-center gap-2 text-ink-400 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-black text-ink-900">{value}</div>
      {sub && <div className="text-xs text-ink-400 mt-0.5">{sub}</div>}
    </div>
  );
}
