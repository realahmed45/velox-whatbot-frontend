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
import { motion } from "framer-motion";
import {
  Aurora,
  NumberTicker,
  Reveal,
  SlidingTabs,
  Spotlight,
} from "@/components/fx";
import axios from "axios";
import DriversPanel from "@/components/DriversPanel";
import AdminPickups from "./AdminPickups";
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
  HandCoins,
  ChevronDown,
  ChevronRight,
  Banknote,
  Ban,
  Building2,
  BedDouble,
  CalendarCheck,
  Globe,
  X,
  Star,
  Wallet,
  Bot,
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

/* ── Shared formatters ──────────────────────────────────────────────────
 * Money is ALWAYS rendered with its currency and never summed across
 * currencies — the API hands back [{ currency, amount }] lists so an IDR
 * total and a USD total stay visibly separate.
 */
const money = (a, c) =>
  `${c || "USD"} ${Number(a || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

/** Render a [{ currency, amount }] list. Never adds them together. */
function moneyList(list, empty = "—") {
  if (!Array.isArray(list) || !list.length) return empty;
  return list.map((x) => money(x.amount, x.currency)).join(" · ");
}

const dOnly = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const dTime = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const PLAN_CLS = {
  hotel_pro: "bg-emerald-100 text-emerald-700",
  hotel_free: "bg-ink-100 text-ink-600",
  free: "bg-ink-100 text-ink-600",
};
const SUB_STATUS_CLS = {
  active: "bg-emerald-100 text-emerald-700",
  trialing: "bg-amber-100 text-amber-700",
  past_due: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
};
const CHANNEL_STATUS_CLS = {
  connected: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  disconnected: "bg-ink-100 text-ink-500",
};
const BOOKING_STATUS_CLS = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-ink-100 text-ink-500",
};

function Pill({ children, cls = "bg-ink-100 text-ink-600" }) {
  return (
    <span
      className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 ring-inset ring-ink-900/[0.06] ${cls}`}
    >
      {children}
    </span>
  );
}

const prettify = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

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
    <div className="relative isolate min-h-screen flex items-center justify-center bg-night-950 p-4 overflow-hidden grain">
      <Aurora variant="dark" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="card-dark w-full max-w-sm p-7"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-sunset flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-10px_rgba(255,61,119,0.8)]">
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="font-display font-semibold tracking-[-0.02em] text-lg text-white leading-none">
              Botlify Admin
            </h1>
            <p className="text-xs text-white/45 mt-1">Founder access only</p>
          </div>
        </div>
        {error && (
          <div className="mb-4 text-sm text-rose-200 bg-rose-500/10 ring-1 ring-rose-400/25 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <label className="block text-[13px] font-medium text-white/70 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${DARK_FIELD} mb-3`}
          required
        />
        <label className="block text-[13px] font-medium text-white/70 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${DARK_FIELD} mb-5`}
          required
        />
        <button disabled={loading} className="btn-primary w-full h-11">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </button>
      </motion.form>
    </div>
  );
}

const DARK_FIELD =
  "block w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 bg-white/[0.06] ring-1 ring-white/10 outline-none transition-[box-shadow,background-color] duration-300 hover:ring-white/20 focus:bg-white/[0.09] focus:ring-2 focus:ring-sunset-flame/60";

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
  lifetime: { label: "Lifetime", cls: "bg-sunset-soft text-sunset-flame" },
};
function StageBadge({ stage }) {
  const m = STAGE_META[stage] || STAGE_META.signed_up;
  return (
    <span
      className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 ring-inset ring-ink-900/[0.06] ${m.cls}`}
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
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("overview");
  const [platformDrivers, setPlatformDrivers] = useState([]);
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
      const [ov, ac, sb, tl, st] = await Promise.all([
        adminApi.get("/admin/overview"),
        adminApi.get("/admin/activity", { params: { limit: 200 } }),
        adminApi.get("/admin/subscriptions"),
        adminApi.get("/admin/timeline", { params: { limit: 150 } }),
        adminApi.get("/admin/stats").catch(() => ({ data: null })),
      ]);
      setOverview(ov.data);
      setRows(ac.data.rows || []);
      setSubs(sb.data.subscriptions || []);
      setEvents(tl.data.events || []);
      setStats(st.data);
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
    <div className="relative isolate min-h-screen bg-[var(--canvas)]">
      <Aurora variant="light" fixed />
      <div aria-hidden className="fixed inset-0 -z-10 bg-dot-grid opacity-50 pointer-events-none" />
      {/* top bar */}
      <div className="sticky top-0 z-40 bg-night-950/85 backdrop-blur-xl text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-sunset flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <ShieldCheck className="w-4 h-4 text-white" strokeWidth={1.8} />
            </span>
            <span className="font-display font-semibold tracking-[-0.02em]">
              Botlify <span className="font-serif italic font-normal">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={load}
              className="group text-xs font-medium text-white/60 hover:text-white flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-white/10 active:scale-95 transition duration-300 ease-spring"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:rotate-180 ${loading ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </button>
            <button
              onClick={logout}
              className="group text-xs font-medium text-white/60 hover:text-white flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-white/10 active:scale-95 transition duration-300 ease-spring"
            >
              <LogOut className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />{" "}
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading && !overview ? (
          <div aria-busy="true">
            <div className="h-11 w-full max-w-2xl rounded-2xl bg-ink-900/[0.06] animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[104px] rounded-2xl bg-ink-900/[0.06] animate-pulse" />
              ))}
            </div>
            <div className="h-36 rounded-2xl bg-ink-900/[0.06] animate-pulse" />
            <span className="sr-only">
              <Loader2 className="w-6 h-6 animate-spin inline" />
              Loading
            </span>
          </div>
        ) : (
          <>
            {/* tabs */}
            <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
              <SlidingTabs
                size="sm"
                value={tab}
                onChange={setTab}
                className="whitespace-nowrap"
                items={[
                { value: "overview", label: "Overview" },
                {
                  value: "hotels",
                  label: `Hotels${stats?.hotels?.total != null ? ` (${stats.hotels.total})` : ""}`,
                },
                { value: "activity", label: `Users (${rows.length})` },
                { value: "timeline", label: `Timeline (${events.length})` },
                { value: "subs", label: `Subs (${subs.length})` },
                {
                  value: "consultants",
                  label: `Consultants${stats?.consultants?.total != null ? ` (${stats.consultants.total})` : ""}`,
                },
                { value: "drivers", label: "Drivers" },
              ]}
              />
            </div>

            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
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
            <Reveal className="card p-4 mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 mb-3">
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
                      className={`rounded-xl px-3.5 py-2.5 ring-1 ring-inset ring-ink-900/[0.05] ${cls} min-w-[92px] transition-transform duration-500 ease-spring hover:-translate-y-0.5`}
                    >
                      <div className="font-display text-2xl font-semibold leading-none tabular-nums">
                        <NumberTicker value={val ?? 0} />
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide mt-1">
                        {label}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="text-ink-300 font-semibold">›</span>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>

                <HotelPlatformStats stats={stats} />
              </>
            )}

            {/* ── HOTELS ── */}
            {tab === "hotels" && <HotelsAdmin />}

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
                      className="input pl-9 py-2"
                    />
                  </div>
                  <select
                    value={stage}
                    onChange={(e) => {
                      setStage(e.target.value);
                      searchActivity(q, e.target.value);
                    }}
                    className="input !w-auto py-2"
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
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/70 backdrop-blur sticky top-0 z-[1]">
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
                          className="border-b border-ink-900/[0.05] hover:bg-white/80 transition-colors"
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
              <div className="card divide-y divide-ink-900/[0.05]">
                {events.map((e) => {
                  const Icon = EVENT_ICON[e.type] || Activity;
                  return (
                    <div
                      key={e._id}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span className="w-8 h-8 rounded-lg bg-sunset-soft text-sunset-flame flex items-center justify-center shrink-0">
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

            {/* ── CONSULTANTS ── */}
            {tab === "consultants" && <ConsultantsAdmin />}

            {/* ── DRIVERS ──
                Botlify's own pool, dispatched for hotels with no taxi service
                of their own. Same panel the hotel uses for its drivers. */}
            {tab === "drivers" && (
              <div className="space-y-6">
                <div className="card p-5 sm:p-6">
                  <AdminPickups client={adminApi} drivers={platformDrivers} />
                </div>
                <div className="card p-5 sm:p-6">
                  <DriversPanel
                    scope="platform"
                    client={adminApi}
                    onChange={setPlatformDrivers}
                  />
                </div>
              </div>
            )}

            {/* ── SUBS ── */}
            {tab === "subs" && (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/70 backdrop-blur sticky top-0 z-[1]">
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
                        className="border-b border-ink-900/[0.05] hover:bg-white/80 transition-colors"
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
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Overview: platform-wide hotel stats ────────────────────────────── */
function HotelPlatformStats({ stats }) {
  if (!stats) return null;
  const h = stats.hotels || {};
  const gmv = stats.bookingsThisMonth?.gmv || [];
  const platform = stats.commissionsThisMonth?.platform || [];
  const share = stats.commissionsThisMonth?.consultantShare || [];
  const byStatus = (list, status) =>
    list.find((x) => x.status === status)?.amounts || [];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard
          icon={Building2}
          label="Hotels"
          value={h.total ?? 0}
          sub={`${h.active ?? 0} active · ${h.trialing ?? 0} trial · ${h.free ?? 0} free`}
        />
        <StatCard
          icon={BedDouble}
          label="Rooms"
          value={stats.rooms?.units ?? 0}
          sub={`${stats.rooms?.types ?? 0} room types · ${stats.properties?.total ?? 0} properties`}
        />
        <StatCard
          icon={CalendarCheck}
          label="Bookings (mo)"
          value={stats.bookingsThisMonth?.total ?? 0}
          sub={`GMV ${moneyList(gmv, "—")}`}
        />
        <StatCard
          icon={HandCoins}
          label="Commission (mo)"
          value={moneyList(byStatus(platform, "accrued"), "—")}
          sub={`paid ${moneyList(byStatus(platform, "paid"), "0")}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Top hotels by revenue */}
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">
            Top hotels by revenue ({stats.period})
          </p>
          {(stats.topHotels || []).length === 0 ? (
            <p className="text-sm text-ink-400 py-4">
              No bookings this month yet.
            </p>
          ) : (
            <div className="divide-y divide-ink-900/[0.05]">
              {stats.topHotels.map((t, i) => (
                <div
                  key={t.workspaceId}
                  className="flex items-center gap-3 py-2"
                >
                  <span className="w-6 h-6 rounded-lg bg-ink-100 text-ink-500 text-xs font-semibold tabular-nums flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-sm truncate">
                      {t.name}
                    </div>
                    <div className="text-xs text-ink-400 truncate">
                      {[t.location, `${t.bookings} bookings`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-ink-900">
                      {moneyList(t.revenue)}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-wide text-ink-400">
                      {t.plan}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings by source + commission ledger summary */}
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">
            Bookings by source ({stats.period})
          </p>
          {(stats.bookingsThisMonth?.bySource || []).length === 0 ? (
            <p className="text-sm text-ink-400 py-4">No bookings this month.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {stats.bookingsThisMonth.bySource.map((s) => (
                <div
                  key={s.source}
                  className={`rounded-xl px-3 py-2 ${
                    s.isOta
                      ? "bg-ink-100 text-ink-700"
                      : "bg-sunset-soft text-sunset-flame"
                  }`}
                >
                  <div className="font-display text-lg font-semibold leading-none tabular-nums">
                    {s.bookings}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide mt-1">
                    {prettify(s.source)}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-80">
                    {moneyList(s.gmv)}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-2">
            Commission ledger ({stats.period})
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <KV label="Platform accrued" value={moneyList(byStatus(platform, "accrued"), "0")} />
            <KV label="Platform invoiced" value={moneyList(byStatus(platform, "invoiced"), "0")} />
            <KV label="Platform paid" value={moneyList(byStatus(platform, "paid"), "0")} />
            <KV
              label="Consultant share accrued"
              value={moneyList(byStatus(share, "accrued"), "0")}
            />
            <KV
              label="Consultant share paid"
              value={moneyList(byStatus(share, "paid"), "0")}
            />
            <KV
              label="Consultants"
              value={`${stats.consultants?.approved ?? 0} approved · ${stats.consultants?.pending ?? 0} pending`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={UserPlus}
          label="New signups (30d)"
          value={stats.newSignupsLast30d ?? 0}
          sub={`${stats.hotels?.newLast30d ?? 0} new hotels`}
        />
        <StatCard
          icon={Crown}
          label="Lifetime hotels"
          value={stats.hotels?.lifetime ?? 0}
          sub={`${stats.hotels?.cancelled ?? 0} cancelled`}
        />
        <StatCard
          icon={HandCoins}
          label="Consultants"
          value={stats.consultants?.total ?? 0}
          sub={`${stats.consultants?.suspended ?? 0} suspended`}
        />
        <StatCard
          icon={Wallet}
          label="Consultant share (mo)"
          value={moneyList(byStatus(share, "accrued"), "—")}
          sub={`paid ${moneyList(byStatus(share, "paid"), "0")}`}
        />
      </div>
    </>
  );
}

function KV({ label, value }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
        {label}
      </div>
      <div className="text-sm font-semibold text-ink-900 break-words">
        {value || "—"}
      </div>
    </div>
  );
}

/* ── Hotels tab ─────────────────────────────────────────────────────── */
function HotelsAdmin() {
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/admin/hotels", {
        params: {
          limit: 50,
          page,
          search: search || undefined,
          plan: plan || undefined,
          status: status || undefined,
        },
      });
      setHotels(data.hotels || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, plan, status]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [search, plan, status]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotel, owner, city…"
            className="input pl-9 py-2"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="input !w-auto py-2"
        >
          <option value="">All plans</option>
          <option value="hotel_pro">Hotel Pro</option>
          <option value="hotel_free">Hotel Free</option>
          <option value="free">Free</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input !w-auto py-2"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past due</option>
          <option value="cancelled">Cancelled</option>
          <option value="suspended">Suspended</option>
        </select>
        <span className="text-xs text-ink-400 font-semibold">
          {total} hotel{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/70 backdrop-blur sticky top-0 z-[1]">
              <th className="px-3 py-2.5">Hotel</th>
              <th className="px-3 py-2.5">Owner</th>
              <th className="px-3 py-2.5">Plan</th>
              <th className="px-3 py-2.5">Property</th>
              <th className="px-3 py-2.5">Rooms</th>
              <th className="px-3 py-2.5">Channels</th>
              <th className="px-3 py-2.5">Bookings (mo)</th>
              <th className="px-3 py-2.5">Revenue (mo)</th>
              <th className="px-3 py-2.5">Consultant</th>
              <th className="px-3 py-2.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-ink-400">
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                </td>
              </tr>
            )}
            {!loading &&
              hotels.map((h) => (
                <tr
                  key={h.workspaceId}
                  onClick={() => setSelected(h.workspaceId)}
                  className="border-b border-ink-900/[0.05] hover:bg-white/80 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-ink-900 flex items-center gap-1.5">
                      {h.property?.name || h.workspaceName || "—"}
                      {h.lifetime && (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="text-xs text-ink-400">
                      {h.workspaceName}
                      {!h.aiEnabled && (
                        <span className="text-red-500"> · AI off</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-ink-800">{h.owner?.name || "—"}</div>
                    <div className="text-xs text-ink-400">
                      {h.owner?.email || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Pill cls={PLAN_CLS[h.plan] || "bg-blue-100 text-blue-700"}>
                      {h.plan}
                    </Pill>
                    <div className="mt-1">
                      <Pill
                        cls={
                          SUB_STATUS_CLS[h.subscriptionStatus] ||
                          "bg-ink-100 text-ink-500"
                        }
                      >
                        {h.subscriptionStatus || "—"}
                      </Pill>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-ink-800">
                      {h.property?.name || "—"}
                    </div>
                    <div className="text-xs text-ink-400">
                      {[h.property?.city, h.property?.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink-700">
                    <div>{h.rooms?.units ?? 0} units</div>
                    <div className="text-xs text-ink-400">
                      {h.rooms?.types ?? 0} types
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {h.channel?.provider !== "none" && (
                        <Pill
                          cls={
                            CHANNEL_STATUS_CLS[h.channel.status] ||
                            CHANNEL_STATUS_CLS.disconnected
                          }
                        >
                          {h.channel.provider}
                        </Pill>
                      )}
                      {(h.channel?.connectedOtas || []).map((o) => (
                        <Pill key={o} cls="bg-blue-100 text-blue-700">
                          {o}
                        </Pill>
                      ))}
                      {(h.messagingChannels || []).map((c, i) => (
                        <Pill
                          key={`${c.platform}-${i}`}
                          cls={
                            CHANNEL_STATUS_CLS[c.status] ||
                            CHANNEL_STATUS_CLS.disconnected
                          }
                        >
                          {c.platform}
                        </Pill>
                      ))}
                      {h.channel?.provider === "none" &&
                        !(h.messagingChannels || []).length && (
                          <span className="text-ink-300 text-xs">None</span>
                        )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink-700">
                    <div className="font-semibold">
                      {h.bookings?.thisMonth ?? 0}
                    </div>
                    <div className="text-xs text-ink-400">
                      {h.bookings?.total ?? 0} all time
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink-900 text-xs font-semibold">
                    <div>{moneyList(h.revenueThisMonth)}</div>
                    <div className="text-[11px] text-ink-400 font-normal">
                      comm {moneyList(h.commissionThisMonth, "0")}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {h.consultant ? (
                      <>
                        <div className="text-ink-800 text-xs">
                          {h.consultant.name || "—"}
                        </div>
                        <div className="font-mono text-[11px] text-ink-400">
                          {h.consultant.code}
                        </div>
                      </>
                    ) : (
                      <span className="text-ink-300 text-xs">Direct</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-ink-500 text-xs">
                    <div>{dOnly(h.signedUpAt)}</div>
                    <div className="text-[11px] text-ink-300">
                      last {dOnly(h.lastActivityAt)}
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !hotels.length && (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-ink-400">
                  No hotels match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-ink-400">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {selected && (
        <HotelDetailDrawer
          workspaceId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ── Hotel detail drawer ────────────────────────────────────────────── */
function Drawer({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-1 bg-night-950/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 48, opacity: 0, filter: "blur(4px)" }}
        animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
        className="w-full max-w-3xl bg-[var(--canvas)] h-full overflow-y-auto shadow-[-24px_0_80px_-24px_rgba(6,5,10,0.45)]"
      >
        <div className="sticky top-0 z-10 glass-strong px-5 py-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-lg leading-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-ink-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="group shrink-0 text-ink-400 hover:text-ink-900 rounded-lg p-2 hover:bg-ink-900/[0.05] active:scale-90 transition duration-300 ease-spring"
          >
            <X className="w-5 h-5 transition-transform duration-500 ease-spring group-hover:rotate-90" />
          </button>
        </div>
        <div className="p-4 sm:p-5 space-y-4">{children}</div>
      </motion.div>
    </div>
  );
}

function Section({ icon: Icon, title, right, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-900/[0.06] flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />}
        <span className="font-display font-semibold tracking-[-0.01em] text-ink-900 text-sm">{title}</span>
        {right && <span className="ml-auto text-xs text-ink-400">{right}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const yesNo = (v) => (v ? "Yes" : "No");

function HotelDetailDrawer({ workspaceId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await adminApi.get(`/admin/hotels/${workspaceId}`);
        if (alive) setD(data);
      } catch (err) {
        if (alive)
          setError(err?.response?.data?.message || "Could not load this hotel");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [workspaceId]);

  const prop =
    (d?.properties || []).find((p) => String(p.id) === String(d?.primaryPropertyId)) ||
    (d?.properties || [])[0] ||
    null;

  return (
    <Drawer
      title={prop?.name || d?.workspace?.name || "Hotel"}
      subtitle={
        d
          ? [
              d.workspace?.name,
              [prop?.city, prop?.country].filter(Boolean).join(", "),
              d.owner?.email,
            ]
              .filter(Boolean)
              .join(" · ")
          : ""
      }
      onClose={onClose}
    >
      {loading && (
        <div className="py-20 text-center text-ink-400">
          <Loader2 className="w-6 h-6 animate-spin inline text-sunset-flame" />
        </div>
      )}
      {error && !loading && (
        <div className="text-sm text-rose-700 bg-rose-50/80 ring-1 ring-inset ring-rose-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
      {d && !loading && (
        <>
          {/* Headline numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={CalendarCheck}
              label="Bookings"
              value={d.bookings?.total ?? 0}
              sub={`${d.bookings?.thisMonth ?? 0} this month`}
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue (mo)"
              value={moneyList(d.bookings?.revenueThisMonth, "—")}
              sub={`${d.rooms?.units ?? 0} rooms`}
            />
            <StatCard
              icon={Users}
              label="Guests"
              value={d.guests?.total ?? 0}
              sub={`${d.conversations?.total ?? 0} conversations`}
            />
            <StatCard
              icon={Star}
              label="Reviews"
              value={d.reviews?.total ?? 0}
              sub={
                d.reviews?.avgStars
                  ? `${d.reviews.avgStars} avg stars`
                  : "no ratings yet"
              }
            />
          </div>

          {/* Account & subscription */}
          <Section icon={ShieldCheck} title="Account">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <KV label="Owner" value={d.owner?.name} />
              <KV label="Email" value={d.owner?.email} />
              <KV
                label="Signup"
                value={`${dOnly(d.owner?.signedUpAt)} · ${d.owner?.signupMethod || "—"}`}
              />
              <KV label="Last login" value={dOnly(d.owner?.lastLogin)} />
              <KV
                label="Plan"
                value={`${d.subscription?.plan}${d.subscription?.lifetime ? " (lifetime)" : ""}`}
              />
              <KV label="Status" value={d.subscription?.status} />
              <KV label="Provider" value={d.subscription?.provider} />
              <KV label="Billing" value={d.subscription?.billingCycle} />
              <KV
                label="Renews / trial ends"
                value={dOnly(
                  d.subscription?.currentPeriodEnd || d.subscription?.trialEndsAt,
                )}
              />
              <KV
                label="Onboarded"
                value={yesNo(d.workspace?.onboardingCompleted)}
              />
              <KV
                label="Consultant"
                value={
                  d.consultant
                    ? `${d.consultant.name || "—"} (${d.consultant.code})`
                    : "Direct"
                }
              />
              <KV label="Last activity" value={dTime(d.workspace?.lastActivityAt)} />
            </div>
          </Section>

          {/* Property */}
          {(d.properties || []).map((p) => (
            <Section
              key={p.id}
              icon={Building2}
              title={`Property · ${p.name}`}
              right={p.active ? "Active" : "Inactive"}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                <KV label="Type" value={prettify(p.propertyType)} />
                <KV
                  label="Address"
                  value={
                    [p.address, p.city, p.state, p.zipCode, p.country]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <KV label="Currency" value={p.currency} />
                <KV label="Timezone" value={p.timezone} />
                <KV
                  label="Check in / out"
                  value={`${p.checkInTime || "—"} → ${p.checkOutTime || "—"}`}
                />
                <KV label="Stars" value={p.starRating || "—"} />
                <KV label="Phone" value={p.phone} />
                <KV label="Email" value={p.email} />
                <KV
                  label="Direct booking"
                  value={
                    p.directBooking?.enabled
                      ? `/book/${p.directBooking.slug || "—"}`
                      : "Disabled"
                  }
                />
                <KV label="Photos" value={p.photoCount} />
                <KV label="Amenities" value={(p.amenities || []).length} />
                <KV
                  label="Revenue manager"
                  value={
                    p.revenue?.enabled
                      ? `${p.revenue.mode || "suggest"} · ${p.revenue.minRate || 0}–${p.revenue.maxRate || 0}`
                      : "Off"
                  }
                />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
                House rules
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <KV
                  label="Children"
                  value={
                    p.rules?.childrenWelcome
                      ? `Welcome (adult from ${p.rules.childAgeLimit ?? "—"})`
                      : "Not welcome"
                  }
                />
                <KV
                  label="Cots"
                  value={
                    p.rules?.cotsAvailable
                      ? money(p.rules.cotPrice, p.currency)
                      : "No"
                  }
                />
                <KV
                  label="Pets"
                  value={
                    p.rules?.petsAllowed
                      ? money(p.rules.petFee, p.currency)
                      : "No"
                  }
                />
                <KV label="Smoking" value={yesNo(p.rules?.smokingAllowed)} />
                <KV label="Parties" value={yesNo(p.rules?.partiesAllowed)} />
                <KV label="Quiet hours" value={p.rules?.quietHours} />
                <KV label="Min age" value={p.rules?.minAge || "None"} />
                <KV
                  label="Transfers"
                  value={
                    p.transfers?.hasOwnService
                      ? `Own · ${money(p.transfers.ownServicePrice, p.currency)}`
                      : p.transfers?.offerPartnerService
                        ? `Partner (${p.transfers.airportCode || "—"})`
                        : "None"
                  }
                />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
                Payment methods
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.entries(p.paymentMethods || {})
                  .filter(([k, v]) => v === true && k !== "depositPercent")
                  .map(([k]) => (
                    <Pill key={k} cls="bg-emerald-100 text-emerald-700">
                      {prettify(k)}
                    </Pill>
                  ))}
                {p.paymentMethods?.depositRequired && (
                  <Pill cls="bg-amber-100 text-amber-700">
                    Deposit {p.paymentMethods.depositPercent || 0}%
                  </Pill>
                )}
                {!Object.values(p.paymentMethods || {}).some(
                  (v) => v === true,
                ) && <span className="text-xs text-ink-300">None set</span>}
              </div>

              {p.policies && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
                    Policies
                  </p>
                  <p className="text-xs text-ink-600 whitespace-pre-wrap bg-ink-900/[0.03] ring-1 ring-inset ring-ink-900/[0.05] rounded-xl p-3">
                    {p.policies}
                  </p>
                </>
              )}
            </Section>
          ))}

          {/* Rooms */}
          <Section
            icon={BedDouble}
            title="Room types"
            right={`${d.rooms?.types ?? 0} types · ${d.rooms?.units ?? 0} units`}
          >
            {!(d.roomTypes || []).length ? (
              <p className="text-sm text-ink-400">No room types yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[620px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/60">
                      <th className="px-2 py-1.5">Room</th>
                      <th className="px-2 py-1.5">Units</th>
                      <th className="px-2 py-1.5">Occupancy</th>
                      <th className="px-2 py-1.5">Base rate</th>
                      <th className="px-2 py-1.5">Breakfast</th>
                      <th className="px-2 py-1.5">Cancellation</th>
                      <th className="px-2 py-1.5">Housekeeping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.roomTypes.map((r) => (
                      <tr key={r.id} className="border-b border-ink-900/[0.05]">
                        <td className="px-2 py-1.5">
                          <div className="font-semibold text-ink-900">
                            {r.name}
                          </div>
                          <div className="text-ink-400">
                            {[r.bedConfig, r.sizeSqm && `${r.sizeSqm} m²`]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                            {!r.active && (
                              <span className="text-red-500"> · inactive</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {r.unitsCount}
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {r.maxOccupancy} max
                          <div className="text-ink-400">
                            base {r.baseOccupancy} · +
                            {money(r.extraGuestFee, r.currency)}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-ink-900">
                          {money(r.baseRate, r.currency)}
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {r.breakfast?.included
                            ? "Included"
                            : r.breakfast?.price
                              ? money(r.breakfast.price, r.currency)
                              : "No"}
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {prettify(r.cancellation?.policy)}
                          {r.cancellation?.policy === "free_until" &&
                            ` (${r.cancellation.freeUntilDays}d)`}
                        </td>
                        <td className="px-2 py-1.5 text-ink-500">
                          {Object.entries(r.housekeeping || {})
                            .map(([k, v]) => `${v} ${k}`)
                            .join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Channels */}
          <Section icon={Globe} title="Channels">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
              Channel manager
            </p>
            {(d.properties || []).map((p) => (
              <div key={p.id} className="mb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  <KV label="Provider" value={p.channel?.provider} />
                  <KV label="Status" value={p.channel?.status} />
                  <KV label="Last sync" value={dTime(p.channel?.lastSyncAt)} />
                  <KV label="iCal feeds" value={p.channel?.icalCount ?? 0} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(p.channel?.connectedOtas || []).map((o) => (
                    <Pill key={`c-${o}`} cls="bg-emerald-100 text-emerald-700">
                      {o} connected
                    </Pill>
                  ))}
                  {(p.channel?.requestedOtas || []).map((o) => (
                    <Pill key={`r-${o}`} cls="bg-amber-100 text-amber-700">
                      {o} requested
                    </Pill>
                  ))}
                  {!(p.channel?.connectedOtas || []).length &&
                    !(p.channel?.requestedOtas || []).length && (
                      <span className="text-xs text-ink-300">No OTAs</span>
                    )}
                </div>
                {p.channel?.lastError && (
                  <p className="text-xs text-red-600 mt-2">
                    {p.channel.lastError}
                  </p>
                )}
              </div>
            ))}
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5 mt-3">
              Messaging
            </p>
            {!(d.channels || []).length ? (
              <p className="text-xs text-ink-300">No messaging channels.</p>
            ) : (
              <div className="space-y-1.5">
                {d.channels.map((c, i) => (
                  <div
                    key={`${c.platform}-${i}`}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Pill
                      cls={
                        CHANNEL_STATUS_CLS[c.status] ||
                        CHANNEL_STATUS_CLS.disconnected
                      }
                    >
                      {c.platform}
                    </Pill>
                    <span className="text-ink-700">{c.handle || "—"}</span>
                    <span className="text-ink-400">
                      {c.provider ? `via ${c.provider}` : ""}
                    </span>
                    <span className="ml-auto text-ink-400">
                      {dTime(c.lastWebhookAt || c.connectedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Bookings */}
          <Section
            icon={CalendarCheck}
            title="Recent bookings"
            right={Object.entries(d.bookings?.byStatus || {})
              .map(([k, v]) => `${v} ${k}`)
              .join(" · ")}
          >
            {!(d.bookings?.recent || []).length ? (
              <p className="text-sm text-ink-400">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[720px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/60">
                      <th className="px-2 py-1.5">Code</th>
                      <th className="px-2 py-1.5">Guest</th>
                      <th className="px-2 py-1.5">Stay</th>
                      <th className="px-2 py-1.5">Room</th>
                      <th className="px-2 py-1.5">Source</th>
                      <th className="px-2 py-1.5">Status</th>
                      <th className="px-2 py-1.5">Amount</th>
                      <th className="px-2 py-1.5">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.bookings.recent.map((b) => (
                      <tr key={b.id} className="border-b border-ink-900/[0.05]">
                        <td className="px-2 py-1.5 font-mono text-ink-700">
                          {b.code}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="text-ink-900 font-medium">
                            {b.guestName || "—"}
                          </div>
                          <div className="text-ink-400">
                            {b.guestEmail || b.guestPhone || ""}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {dOnly(b.checkIn)} → {dOnly(b.checkOut)}
                          <div className="text-ink-400">
                            {b.nights}n × {b.units}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-600">
                          {b.roomType}
                        </td>
                        <td className="px-2 py-1.5">
                          <Pill
                            cls={
                              b.isOta
                                ? "bg-ink-100 text-ink-600"
                                : "bg-sunset-soft text-sunset-flame"
                            }
                          >
                            {prettify(b.source)}
                          </Pill>
                        </td>
                        <td className="px-2 py-1.5">
                          <Pill
                            cls={
                              BOOKING_STATUS_CLS[b.status] ||
                              "bg-ink-100 text-ink-500"
                            }
                          >
                            {b.status}
                          </Pill>
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-ink-900">
                          {money(b.amount, b.currency)}
                          <div className="text-ink-400 font-normal">
                            {b.paymentStatus}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {b.commission?.amount
                            ? `${money(b.commission.amount, b.commission.currency)} (${Math.round((b.commission.rate || 0) * 100)}%)`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Revenue by source */}
          <Section icon={TrendingUp} title="Revenue by source (90 days)">
            {!(d.revenueBySource90d || []).length ? (
              <p className="text-sm text-ink-400">
                No bookings in the last 90 days.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {d.revenueBySource90d.map((s) => (
                  <div
                    key={s.source}
                    className={`rounded-xl px-3 py-2 min-w-[120px] ${
                      s.isOta
                        ? "bg-ink-100 text-ink-700"
                        : "bg-sunset-soft text-sunset-flame"
                    }`}
                  >
                    <div className="font-display text-lg font-semibold leading-none tabular-nums">
                      {s.bookings}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mt-1">
                      {prettify(s.source)}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-80">
                      {moneyList(s.revenue)}
                    </div>
                    <div className="text-[10px] opacity-60">
                      {s.nights} nights
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Commissions */}
          <Section
            icon={HandCoins}
            title="Commissions"
            right={`period ${d.commissions?.period || "—"}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-3">
              <KV
                label="Platform revenue"
                value={
                  (d.commissions?.platform || [])
                    .map((x) => `${x.status}: ${moneyList(x.amounts)}`)
                    .join(" · ") || "—"
                }
              />
              <KV
                label="Consultant share"
                value={
                  (d.commissions?.consultantShare || [])
                    .map((x) => `${x.status}: ${moneyList(x.amounts)}`)
                    .join(" · ") || "—"
                }
              />
            </div>
            {!(d.commissions?.ledger || []).length ? (
              <p className="text-sm text-ink-400">No ledger entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[560px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/60">
                      <th className="px-2 py-1.5">Period</th>
                      <th className="px-2 py-1.5">Kind</th>
                      <th className="px-2 py-1.5">Type</th>
                      <th className="px-2 py-1.5">Amount</th>
                      <th className="px-2 py-1.5">Consultant</th>
                      <th className="px-2 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.commissions.ledger.map((e) => (
                      <tr key={e.id} className="border-b border-ink-900/[0.05]">
                        <td className="px-2 py-1.5 font-mono">
                          {e.period || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-ink-600">
                          {prettify(e.kind)}
                        </td>
                        <td className="px-2 py-1.5 text-ink-600">
                          {prettify(e.revenueType)}
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-ink-900">
                          {money(e.amount, e.currency)}
                          {e.sourceAmount != null &&
                            e.sourceCurrency &&
                            e.sourceCurrency !== e.currency && (
                              <div className="text-ink-400 font-normal">
                                from {money(e.sourceAmount, e.sourceCurrency)}
                              </div>
                            )}
                        </td>
                        <td className="px-2 py-1.5 text-ink-600">
                          {e.consultant
                            ? `${e.consultant.name || ""} ${e.consultant.code}`
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          <Pill
                            cls={
                              COMMISSION_STATUS[e.status] ||
                              COMMISSION_STATUS.accrued
                            }
                          >
                            {e.status}
                          </Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Guests, transfers, upsells */}
          <Section icon={Users} title="Guests & extras">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <KV label="Guest profiles" value={d.guests?.total ?? 0} />
              <KV label="Conversations" value={d.conversations?.total ?? 0} />
              <KV label="Transfers booked" value={d.transfers?.total ?? 0} />
              <KV
                label="Reviews"
                value={
                  d.reviews?.total
                    ? `${d.reviews.total} · ${d.reviews.avgStars ?? "—"}★`
                    : "0"
                }
              />
              <KV label="Upsells offered" value={d.upsells?.offered ?? 0} />
              <KV label="Upsells accepted" value={d.upsells?.accepted ?? 0} />
              <KV label="Upsells declined" value={d.upsells?.declined ?? 0} />
              <KV
                label="Upsell value"
                value={moneyList(d.upsells?.acceptedValue, "0")}
              />
            </div>
          </Section>

          {/* AI */}
          <Section
            icon={Bot}
            title="AI assistant"
            right={d.ai?.enabled ? "Enabled" : "Disabled"}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <KV label="Model" value={d.ai?.model} />
              <KV label="FAQs" value={d.ai?.faqCount ?? 0} />
              <KV
                label="Knowledge sources"
                value={`${d.ai?.knowledgeSources ?? 0}${d.ai?.knowledgeEnabled ? "" : " (off)"}`}
              />
              <KV label="Goals" value={(d.ai?.goals || []).join(", ")} />
              <KV
                label="Messages this month"
                value={d.ai?.messagesThisMonth ?? 0}
              />
              <KV
                label="AI replies this month"
                value={d.ai?.repliesThisMonth ?? 0}
              />
              <KV label="Leads captured" value={d.ai?.leadsCaptured ?? 0} />
              <KV
                label="Match language"
                value={yesNo(d.ai?.matchLanguage)}
              />
            </div>
            {d.ai?.brandVoice && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
                  Brand voice / tone
                </p>
                <p className="text-xs text-ink-600 whitespace-pre-wrap bg-ink-900/[0.03] ring-1 ring-inset ring-ink-900/[0.05] rounded-xl p-3 mb-2">
                  {d.ai.brandVoice}
                </p>
              </>
            )}
            {d.ai?.aiRole && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
                  AI role
                </p>
                <p className="text-xs text-ink-600 whitespace-pre-wrap bg-ink-900/[0.03] ring-1 ring-inset ring-ink-900/[0.05] rounded-xl p-3 mb-2">
                  {d.ai.aiRole}
                </p>
              </>
            )}
            {d.ai?.guardrails && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
                  Guardrails
                </p>
                <p className="text-xs text-ink-600 whitespace-pre-wrap bg-ink-900/[0.03] ring-1 ring-inset ring-ink-900/[0.05] rounded-xl p-3">
                  {d.ai.guardrails}
                </p>
              </>
            )}
          </Section>
        </>
      )}
    </Drawer>
  );
}

/* ── Consultants admin ──────────────────────────────────────────────── */
const CONSULTANT_STATUS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
};
const COMMISSION_STATUS = {
  accrued: "bg-amber-100 text-amber-700",
  verified: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  reversed: "bg-red-100 text-red-700",
};

const cMoney = (a, c) =>
  `${c || "USD"} ${Number(a || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Render a consultant's totals per currency. The list endpoint returns
// `earnings: [{ currency, accrued, verified, paid }]` — currencies are shown
// side by side and NEVER added together. Falls back to the older shapes.
function totalsLabel(c, key) {
  if (Array.isArray(c.earnings) && c.earnings.length)
    return c.earnings.map((e) => cMoney(e[key], e.currency)).join(" · ");
  const t = c.totals || c.stats || {};
  const v = t[key];
  if (Array.isArray(v))
    return v.map((x) => cMoney(x.amount ?? x[key], x.currency)).join(" · ");
  if (Array.isArray(t.byCurrency))
    return t.byCurrency.map((x) => cMoney(x[key], x.currency)).join(" · ") || "0";
  if (typeof v === "number") return v.toLocaleString();
  return "0";
}

function ConsultantsAdmin() {
  const [loading, setLoading] = useState(true);
  const [consultants, setConsultants] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/admin/consultants");
      setConsultants(data.consultants || data.rows || []);
    } catch {
      /* keep old list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (c) => {
    setBusy(c._id);
    try {
      await adminApi.post(`/admin/consultants/${c._id}/approve`);
      load();
    } catch {
      alert("Approve failed");
    } finally {
      setBusy(null);
    }
  };

  const suspend = async (c) => {
    const reason = window.prompt(`Suspend ${c.fullName || c.name}? Reason:`);
    if (reason === null) return;
    setBusy(c._id);
    try {
      await adminApi.post(`/admin/consultants/${c._id}/suspend`, { reason });
      load();
    } catch {
      alert("Suspend failed");
    } finally {
      setBusy(null);
    }
  };

  if (loading)
    return (
      <div className="py-16 text-center text-ink-400">
        <Loader2 className="w-6 h-6 animate-spin inline text-sunset-flame" />
      </div>
    );

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-900/[0.06] flex items-center gap-2">
        <HandCoins className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
        <span className="font-bold text-ink-900 text-sm">
          Consultants ({consultants.length})
        </span>
      </div>
      {consultants.length === 0 ? (
        <p className="px-4 py-10 text-center text-ink-400 text-sm">
          No consultant applications yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/70 backdrop-blur sticky top-0 z-[1]">
                <th className="px-3 py-2.5 w-8" />
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5">Code</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Hotels signed</th>
                <th className="px-3 py-2.5">Accrued</th>
                <th className="px-3 py-2.5">Paid</th>
                <th className="px-3 py-2.5">Last payout</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {consultants.map((c) => (
                <ConsultantRow
                  key={c._id}
                  c={c}
                  busy={busy === c._id}
                  expanded={expanded === c._id}
                  onToggle={() =>
                    setExpanded(expanded === c._id ? null : c._id)
                  }
                  onOpenDetail={() => setDetail(c._id)}
                  onApprove={() => approve(c)}
                  onSuspend={() => suspend(c)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <ConsultantDetailDrawer
          consultantId={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function ConsultantRow({
  c,
  busy,
  expanded,
  onToggle,
  onOpenDetail,
  onApprove,
  onSuspend,
}) {
  const hotels = c.hotels || [];
  const signed =
    c.hotelsSigned ??
    hotels.length ??
    c.stats?.hotelsSigned ??
    c.totals?.hotelsSigned ??
    0;
  return (
    <>
      <tr className="border-b border-ink-900/[0.05] hover:bg-white/80 transition-colors">
        <td className="px-3 py-2.5">
          <button onClick={onToggle} className="text-ink-400 hover:text-ink-700">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </td>
        <td className="px-3 py-2.5">
          <button
            onClick={onOpenDetail}
            className="text-left font-semibold text-ink-900 hover:text-sunset-flame transition-colors"
          >
            {c.fullName || c.name || "—"}
          </button>
          <div className="text-xs text-ink-400">
            {[c.phone, c.city, c.country].filter(Boolean).join(" · ")}
          </div>
        </td>
        <td className="px-3 py-2.5 font-mono text-xs font-bold text-ink-800">
          {c.code || "—"}
        </td>
        <td className="px-3 py-2.5">
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CONSULTANT_STATUS[c.status] || CONSULTANT_STATUS.pending}`}
          >
            {c.status}
          </span>
        </td>
        <td className="px-3 py-2.5 text-ink-700">
          <div className="font-semibold">{signed}</div>
          <div className="text-xs text-ink-400 max-w-[220px] truncate">
            {hotels.map((h) => h.name).join(", ") || "—"}
          </div>
        </td>
        <td className="px-3 py-2.5 text-ink-700 text-xs">
          {totalsLabel(c, "accrued")}
        </td>
        <td className="px-3 py-2.5 text-ink-700 text-xs">
          {totalsLabel(c, "paid")}
        </td>
        <td className="px-3 py-2.5 text-ink-500 text-xs">
          {dOnly(c.lastPayoutAt)}
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center justify-end gap-1.5">
            {c.status !== "approved" && (
              <button
                onClick={onApprove}
                disabled={busy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition duration-300 ease-spring hover:-translate-y-px active:scale-95 disabled:opacity-60"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
            )}
            {c.status !== "suspended" && (
              <button
                onClick={onSuspend}
                disabled={busy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-2.5 py-1.5 transition duration-300 ease-spring hover:-translate-y-px active:scale-95 disabled:opacity-60"
              >
                <Ban className="w-3.5 h-3.5" /> Suspend
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-ink-900/[0.05]">
          <td colSpan={9} className="px-3 py-3 bg-ink-50/50">
            {hotels.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {hotels.map((h) => (
                  <Pill key={h.workspaceId} cls="bg-blue-100 text-blue-700">
                    {h.name}
                    {h.location ? ` · ${h.location}` : ""}
                  </Pill>
                ))}
              </div>
            )}
            <ConsultantLedger consultantId={c._id} />
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Consultant detail drawer ───────────────────────────────────────── */
function ConsultantDetailDrawer({ consultantId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await adminApi.get(
          `/admin/consultants/${consultantId}`,
        );
        if (alive) setD(data);
      } catch (err) {
        if (alive)
          setError(
            err?.response?.data?.message || "Could not load this consultant",
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [consultantId]);

  const c = d?.consultant;
  const statusAmounts = (list, status) =>
    list?.find((x) => x.status === status)?.amounts || [];

  return (
    <Drawer
      title={c?.fullName || c?.user?.name || "Consultant"}
      subtitle={
        c ? [c.code, c.status, c.user?.email].filter(Boolean).join(" · ") : ""
      }
      onClose={onClose}
    >
      {loading && (
        <div className="py-20 text-center text-ink-400">
          <Loader2 className="w-6 h-6 animate-spin inline text-sunset-flame" />
        </div>
      )}
      {error && !loading && (
        <div className="text-sm text-rose-700 bg-rose-50/80 ring-1 ring-inset ring-rose-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
      {d && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Building2}
              label="Hotels signed"
              value={d.hotelsSigned ?? 0}
              sub={`${Math.round((d.shareRate || 0.2) * 100)}% revenue share`}
            />
            <StatCard
              icon={HandCoins}
              label="Accrued"
              value={moneyList(statusAmounts(d.totals, "accrued"), "—")}
              sub={`verified ${moneyList(statusAmounts(d.totals, "verified"), "0")}`}
            />
            <StatCard
              icon={Banknote}
              label="Paid out"
              value={moneyList(statusAmounts(d.totals, "paid"), "—")}
              sub={`last ${dOnly(d.lastPayoutAt)}`}
            />
            <StatCard
              icon={CheckCircle2}
              label="Status"
              value={c?.status || "—"}
              sub={c?.approvedAt ? `approved ${dOnly(c.approvedAt)}` : ""}
            />
          </div>

          <Section icon={ShieldCheck} title="Profile">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <KV label="Name" value={c?.fullName || c?.user?.name} />
              <KV label="Code" value={c?.code} />
              <KV label="Phone" value={c?.phone} />
              <KV label="Email" value={c?.user?.email} />
              <KV
                label="Location"
                value={[c?.city, c?.country].filter(Boolean).join(", ")}
              />
              <KV label="Applied" value={dOnly(c?.createdAt)} />
              <KV label="Approved by" value={c?.approvedBy} />
              <KV label="Last login" value={dOnly(c?.user?.lastLogin)} />
              <KV
                label="Lifetime (denormalized)"
                value={`accrued ${cMoney(c?.totals?.accrued, "USD")} · paid ${cMoney(c?.totals?.paid, "USD")}`}
              />
            </div>
            {c?.suspendedReason && (
              <p className="text-xs text-red-600 mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                Suspended: {c.suspendedReason}
              </p>
            )}
          </Section>

          <Section icon={Wallet} title="Payout details">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <KV label="Bank" value={c?.payout?.bankName} />
              <KV label="Account name" value={c?.payout?.accountName} />
              <KV label="Account number" value={c?.payout?.accountNumber} />
              <KV label="Notes" value={c?.payout?.notes} />
            </div>
          </Section>

          <Section
            icon={Building2}
            title="Attributed hotels"
            right={`${d.hotels?.length ?? 0} signed`}
          >
            {!(d.hotels || []).length ? (
              <p className="text-sm text-ink-400">No hotels attributed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[680px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/60">
                      <th className="px-2 py-1.5">Hotel</th>
                      <th className="px-2 py-1.5">Owner</th>
                      <th className="px-2 py-1.5">Plan</th>
                      <th className="px-2 py-1.5">Revenue (90d)</th>
                      <th className="px-2 py-1.5">
                        {Math.round((d.shareRate || 0.2) * 100)}% of that
                      </th>
                      <th className="px-2 py-1.5">Ledger share</th>
                      <th className="px-2 py-1.5">Signed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.hotels.map((h) => (
                      <tr key={h.workspaceId} className="border-b border-ink-900/[0.05]">
                        <td className="px-2 py-1.5">
                          <div className="font-semibold text-ink-900">
                            {h.propertyName || h.workspaceName}
                          </div>
                          <div className="text-ink-400">
                            {h.location || h.workspaceName}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-600">
                          <div>{h.owner?.name || "—"}</div>
                          <div className="text-ink-400">
                            {h.owner?.email || ""}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <Pill
                            cls={PLAN_CLS[h.plan] || "bg-blue-100 text-blue-700"}
                          >
                            {h.plan}
                          </Pill>
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-ink-900">
                          {moneyList(h.revenue90d, "0")}
                          <div className="text-ink-400 font-normal">
                            {h.bookings90d} bookings
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {moneyList(h.indicativeShare90d, "0")}
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {(h.share || [])
                            .map(
                              (s) => `${s.status}: ${moneyList(s.amounts)}`,
                            )
                            .join(" · ") || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-ink-500">
                          {dOnly(h.attributedAt || h.signedUpAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section
            icon={HandCoins}
            title="Full ledger"
            right={`${d.ledger?.length ?? 0} entries`}
          >
            {!(d.ledger || []).length ? (
              <p className="text-sm text-ink-400">No ledger entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[680px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/60">
                      <th className="px-2 py-1.5">Period</th>
                      <th className="px-2 py-1.5">Hotel</th>
                      <th className="px-2 py-1.5">Type</th>
                      <th className="px-2 py-1.5">Amount</th>
                      <th className="px-2 py-1.5">Status</th>
                      <th className="px-2 py-1.5">Paid</th>
                      <th className="px-2 py-1.5">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.ledger.map((e) => (
                      <tr key={e.id} className="border-b border-ink-900/[0.05]">
                        <td className="px-2 py-1.5 font-mono">
                          {e.period || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-ink-700">
                          {e.workspaceName}
                        </td>
                        <td className="px-2 py-1.5 text-ink-500">
                          {prettify(e.revenueType)}
                          {e.rate != null && ` · ${Math.round(e.rate * 100)}%`}
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-ink-900">
                          {money(e.amount, e.currency)}
                          {e.sourceAmount != null &&
                            e.sourceCurrency &&
                            e.sourceCurrency !== e.currency && (
                              <div className="text-ink-400 font-normal">
                                from {money(e.sourceAmount, e.sourceCurrency)}
                              </div>
                            )}
                        </td>
                        <td className="px-2 py-1.5">
                          <Pill
                            cls={
                              COMMISSION_STATUS[e.status] ||
                              COMMISSION_STATUS.accrued
                            }
                          >
                            {e.status}
                          </Pill>
                        </td>
                        <td className="px-2 py-1.5 text-ink-500">
                          {dOnly(e.paidAt)}
                        </td>
                        <td className="px-2 py-1.5 text-ink-400 font-mono">
                          {e.payoutReference || e.reference || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}
    </Drawer>
  );
}

function ConsultantLedger({ consultantId }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/admin/commissions", {
        params: {
          consultantId,
          status: status || undefined,
          period: period || undefined,
        },
      });
      setEntries(data.commissions || data.entries || data.rows || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [consultantId, status, period]);

  useEffect(() => {
    load();
  }, [load]);

  const verify = async (e) => {
    setBusy(e._id);
    try {
      await adminApi.post(`/admin/commissions/${e._id}/verify`);
      load();
    } catch {
      alert("Verify failed");
    } finally {
      setBusy(null);
    }
  };

  const markPaid = async (e) => {
    const ref = window.prompt("Payout reference (bank transfer id):");
    if (ref === null) return;
    setBusy(e._id);
    try {
      await adminApi.post(`/admin/commissions/${e._id}/mark-paid`, {
        payoutReference: ref,
      });
      load();
    } catch {
      alert("Mark-paid failed");
    } finally {
      setBusy(null);
    }
  };

  const markPeriodPaid = async () => {
    if (!period) {
      alert("Set a period filter first (e.g. 2026-08)");
      return;
    }
    const ref = window.prompt(
      `Mark ALL of ${period} paid for this consultant. Payout reference:`,
    );
    if (ref === null) return;
    try {
      await adminApi.post("/admin/commissions/mark-paid-bulk", {
        consultantId,
        period,
        payoutReference: ref,
      });
      load();
    } catch {
      alert("Bulk mark-paid failed");
    }
  };

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-400">
          Commission ledger
        </span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input !w-auto !rounded-lg !px-2 !py-1.5 !text-xs"
        >
          <option value="">All statuses</option>
          <option value="accrued">Accrued</option>
          <option value="verified">Verified</option>
          <option value="paid">Paid</option>
          <option value="reversed">Reversed</option>
        </select>
        <input
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="Period (YYYY-MM)"
          className="input !w-auto !rounded-lg !px-2 !py-1.5 !text-xs w-32 font-mono"
        />
        <button
          onClick={markPeriodPaid}
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-2.5 py-1.5 transition duration-300 ease-spring hover:-translate-y-px active:scale-95"
        >
          <Banknote className="w-3.5 h-3.5" /> Mark period paid
        </button>
      </div>
      {loading ? (
        <div className="py-6 text-center text-ink-400">
          <Loader2 className="w-4 h-4 animate-spin inline" />
        </div>
      ) : entries.length === 0 ? (
        <p className="py-4 text-center text-xs text-ink-400">
          No commission entries match.
        </p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06] bg-white/60">
              <th className="px-2 py-1.5">Period</th>
              <th className="px-2 py-1.5">Hotel</th>
              <th className="px-2 py-1.5">Type</th>
              <th className="px-2 py-1.5">Amount</th>
              <th className="px-2 py-1.5">Status</th>
              <th className="px-2 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e._id} className="border-b border-ink-900/[0.05]">
                <td className="px-2 py-1.5 font-mono">{e.period || "—"}</td>
                <td className="px-2 py-1.5 text-ink-700">
                  {e.workspaceName || e.workspace?.name || e.workspaceId?.name || "—"}
                </td>
                <td className="px-2 py-1.5 text-ink-500 capitalize">
                  {(e.revenueType || e.kind || "").replace("_", " ")}
                </td>
                <td className="px-2 py-1.5 font-semibold text-ink-900">
                  {cMoney(e.amount, e.currency)}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${COMMISSION_STATUS[e.status] || COMMISSION_STATUS.accrued}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center justify-end gap-1">
                    {e.status === "accrued" && (
                      <button
                        onClick={() => verify(e)}
                        disabled={busy === e._id}
                        className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded px-2 py-1 transition duration-300 ease-spring hover:-translate-y-px active:scale-95 disabled:opacity-60"
                      >
                        Verify
                      </button>
                    )}
                    {["accrued", "verified"].includes(e.status) && (
                      <button
                        onClick={() => markPaid(e)}
                        disabled={busy === e._id}
                        className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded px-2 py-1 transition duration-300 ease-spring hover:-translate-y-px active:scale-95 disabled:opacity-60"
                      >
                        Mark paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Spotlight className="card group p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] text-ink-500">{label}</span>
        <span className="h-8 w-8 shrink-0 rounded-xl grid place-items-center bg-sunset-soft text-sunset-flame transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
          <Icon className="w-4 h-4" strokeWidth={1.8} />
        </span>
      </div>
      <div className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-ink-900 tabular-nums break-words">
        <StatValue value={value} />
      </div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </Spotlight>
  );
}

/** Numbers count up; "$123"-style values count up with their prefix; anything
 *  else (multi-currency lists) renders as-is. */
function StatValue({ value }) {
  if (typeof value === "number") return <NumberTicker value={value} />;
  const m = typeof value === "string" && value.match(/^(\$)(\d+(?:\.\d+)?)$/);
  if (m) return <NumberTicker prefix={m[1]} value={Number(m[2])} />;
  return value;
}
