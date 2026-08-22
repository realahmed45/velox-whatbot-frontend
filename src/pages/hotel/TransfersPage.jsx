/**
 * Transfers — airport pickups & drop-offs the AI (or you) arranged.
 * Upcoming/past lists with status chips, add-transfer modal and quick
 * status actions.
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Car,
  CheckCircle2,
  Loader2,
  Phone,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  User,
  XCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-ink-100 text-ink-600 border-ink-200",
  cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const fmtDT = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export default function TransfersPage() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [status, setStatus] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState("upcoming");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/transfers", {
        params: { status: status || undefined },
      });
      setTransfers(data.transfers || []);
    } catch {
      toast.error("Couldn't load transfers");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const up = [];
    const pa = [];
    for (const t of transfers) {
      (new Date(t.pickupAt) >= now ? up : pa).push(t);
    }
    up.sort((a, b) => new Date(a.pickupAt) - new Date(b.pickupAt));
    pa.sort((a, b) => new Date(b.pickupAt) - new Date(a.pickupAt));
    return { upcoming: up, past: pa };
  }, [transfers]);

  const setTransferStatus = async (t, next) => {
    if (next === "cancelled") {
      const ok = await confirm({
        title: "Cancel this transfer?",
        confirmLabel: "Cancel transfer",
        danger: true,
      });
      if (!ok) return;
    }
    try {
      await api.patch(`/transfers/${t._id}/status`, { status: next });
      setTransfers((list) =>
        list.map((x) => (x._id === t._id ? { ...x, status: next } : x)),
      );
      toast.success(`Marked ${next}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };

  const rows = tab === "upcoming" ? upcoming : past;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink-900">Transfers</h1>
            <p className="text-sm text-ink-500">
              Airport pickups and drop-offs for your guests.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
        >
          <Plus className="w-4 h-4" /> Add transfer
        </button>
      </div>

      {/* Tabs + status filter */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1 bg-ink-100 rounded-xl p-1">
          {[
            ["upcoming", `Upcoming (${upcoming.length})`],
            ["past", `Past (${past.length})`],
          ].map(([key, l]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === key
                  ? "bg-white text-ink-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="ml-auto rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Plane}
          title={tab === "upcoming" ? "No upcoming transfers" : "No past transfers"}
          description="When a guest books an airport pickup with your AI concierge — or you add one — it shows up here."
          action={
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
            >
              <Plus className="w-4 h-4" /> Add a transfer
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {rows.map((t) => {
            const DirIcon = t.direction === "dropoff" ? PlaneTakeoff : PlaneLanding;
            return (
              <div
                key={t._id}
                className="rounded-xl border border-ink-100 bg-white p-4 flex flex-wrap items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    t.direction === "dropoff"
                      ? "bg-sky-50 text-sky-600"
                      : "bg-brand-50 text-brand-500"
                  }`}
                >
                  <DirIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink-900">
                      {t.direction === "dropoff"
                        ? "Hotel → Airport"
                        : "Airport → Hotel"}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status] || STATUS_STYLE.completed}`}
                    >
                      {t.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        t.provider === "mozio"
                          ? "bg-violet-50 text-violet-600"
                          : "bg-ink-50 text-ink-500"
                      }`}
                    >
                      {t.provider === "mozio" ? "Partner" : "Own car"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 mt-1.5">
                    <span className="font-semibold text-ink-700">
                      {fmtDT(t.pickupAt)}
                    </span>
                    {t.guestName && (
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {t.guestName}
                      </span>
                    )}
                    {t.guestPhone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {t.guestPhone}
                      </span>
                    )}
                    {t.passengers > 0 && <span>{t.passengers} pax</span>}
                    {t.flightNumber && (
                      <span className="font-mono">{t.flightNumber}</span>
                    )}
                    {t.price > 0 && (
                      <span className="font-semibold text-ink-700">
                        {t.currency || ""} {t.price}
                      </span>
                    )}
                  </div>
                  {t.notes && (
                    <p className="text-xs text-ink-400 mt-1">{t.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {t.status === "pending" && (
                    <button
                      onClick={() => setTransferStatus(t, "confirmed")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                    </button>
                  )}
                  {t.status === "confirmed" && (
                    <button
                      onClick={() => setTransferStatus(t, "completed")}
                      className="text-xs font-semibold text-ink-600 bg-ink-50 hover:bg-ink-100 border border-ink-200 rounded-lg px-2.5 py-1.5 transition"
                    >
                      Done
                    </button>
                  )}
                  {["pending", "confirmed"].includes(t.status) && (
                    <button
                      onClick={() => setTransferStatus(t, "cancelled")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewTransferModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={() => {
          setShowNew(false);
          load();
        }}
      />
    </div>
  );
}

function NewTransferModal({ open, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    direction: "pickup",
    pickupAt: "",
    guestName: "",
    guestPhone: "",
    passengers: 1,
    flightNumber: "",
  });
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const input =
    "w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none";
  const label = "block text-xs font-semibold text-ink-600 mb-1";

  const submit = async () => {
    if (!form.pickupAt) return toast.error("Pick a pickup time");
    if (!form.guestName.trim()) return toast.error("Guest name is required");
    setSaving(true);
    try {
      await api.post("/transfers", {
        direction: form.direction,
        pickupAt: new Date(form.pickupAt).toISOString(),
        guestName: form.guestName.trim(),
        guestPhone: form.guestPhone.trim(),
        passengers: Number(form.passengers) || 1,
        flightNumber: form.flightNumber.trim() || undefined,
      });
      toast.success("Transfer added");
      setForm({
        direction: "pickup",
        pickupAt: "",
        guestName: "",
        guestPhone: "",
        passengers: 1,
        flightNumber: "",
      });
      onCreated();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't add transfer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add transfer"
      description="Arrange a pickup or drop-off for a guest."
      footer={
        <>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-ink-600 hover:text-ink-900 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add transfer
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            ["pickup", "Airport → Hotel", PlaneLanding],
            ["dropoff", "Hotel → Airport", PlaneTakeoff],
          ].map(([val, l, Icon]) => (
            <button
              key={val}
              type="button"
              onClick={() => patch("direction", val)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                form.direction === val
                  ? "border-brand-500 bg-brand-50/70 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-ink-300"
              }`}
            >
              <Icon className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>
        <div>
          <span className={label}>Pickup time</span>
          <input
            type="datetime-local"
            value={form.pickupAt}
            onChange={(e) => patch("pickupAt", e.target.value)}
            className={input}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Guest name</span>
            <input
              value={form.guestName}
              onChange={(e) => patch("guestName", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Guest phone</span>
            <input
              value={form.guestPhone}
              onChange={(e) => patch("guestPhone", e.target.value)}
              className={input}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Passengers</span>
            <input
              type="number"
              min="1"
              value={form.passengers}
              onChange={(e) => patch("passengers", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Flight number (optional)</span>
            <input
              value={form.flightNumber}
              onChange={(e) => patch("flightNumber", e.target.value.toUpperCase())}
              placeholder="EK 602"
              className={input}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
