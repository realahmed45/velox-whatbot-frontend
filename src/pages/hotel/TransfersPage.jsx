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
import DriversPanel from "@/components/DriversPanel";
import AssignDriver from "@/components/AssignDriver";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, PulseDot, Reveal, SlidingTabs, Spotlight } from "@/components/fx";

const STATUS_STYLE = {
  pending: "badge-yellow",
  confirmed: "badge-green",
  completed: "badge-gray",
  cancelled: "badge-red",
};

const spring = { type: "spring", stiffness: 420, damping: 30 };

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
  const [drivers, setDrivers] = useState([]);

  // The hotel's own drivers, for the Assign picker on each pickup.
  const loadDrivers = useCallback(async () => {
    try {
      const { data } = await api.get("/drivers");
      setDrivers(data.drivers || []);
    } catch {
      /* the picker just shows "no drivers yet" */
    }
  }, []);
  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div className="group flex items-center gap-3.5 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[0_10px_24px_-10px_rgba(255,61,119,0.6)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
              <Car className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
                Transfers
              </h1>
              <p className="text-sm text-ink-500">
                Airport pickups and drop-offs for your{" "}
                <span className="font-serif italic">guests</span>.
              </p>
            </div>
          </div>
          <Magnetic strength={0.25}>
            <button
              onClick={() => setShowNew(true)}
              className="btn-primary group min-h-[44px]"
            >
              <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />{" "}
              Add transfer
            </button>
          </Magnetic>
        </div>
      </Reveal>

      {/* Tabs + status filter */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <SlidingTabs
          items={[
            { value: "upcoming", label: `Upcoming (${upcoming.length})`, icon: PlaneLanding },
            { value: "past", label: `Past (${past.length})` },
          ]}
          value={tab}
          onChange={setTab}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input ml-auto w-auto min-h-[40px] py-2 pr-8"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
              <div className="h-11 w-11 rounded-xl bg-ink-900/[0.06] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
                <div className="h-3 w-72 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Plane}
          title={tab === "upcoming" ? "No upcoming transfers" : "No past transfers"}
          description="When a guest books an airport pickup with your AI concierge — or you add one — it shows up here."
          action={
            <button
              onClick={() => setShowNew(true)}
              className="btn-primary group min-h-[44px]"
            >
              <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" /> Add a transfer
            </button>
          }
        />
      ) : (
        <motion.div layout className="space-y-2.5">
          <AnimatePresence initial={false}>
          {rows.map((t, i) => {
            const DirIcon = t.direction === "dropoff" ? PlaneTakeoff : PlaneLanding;
            return (
              <motion.div
                key={t._id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ ...spring, delay: Math.min(i, 8) * 0.04 }}
              >
              <Spotlight
                className="card group p-4 flex flex-wrap items-center gap-3 transition-[transform,box-shadow] duration-500 ease-spring hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.18),0_16px_36px_-18px_rgba(255,61,119,0.35)]"
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
                    t.direction === "dropoff"
                      ? "bg-sky-50 text-sky-600 ring-1 ring-sky-500/15"
                      : "bg-sunset-soft text-sunset-flame"
                  }`}
                >
                  <DirIcon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold tracking-[-0.01em] text-ink-900">
                      {t.direction === "dropoff"
                        ? "Hotel → Airport"
                        : "Airport → Hotel"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 capitalize ${STATUS_STYLE[t.status] || STATUS_STYLE.completed}`}
                    >
                      {t.status === "confirmed" && <PulseDot color="bg-emerald-500" />}
                      {t.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ring-1 ${
                        t.provider === "mozio"
                          ? "bg-violet-50 text-violet-600 ring-violet-500/15"
                          : "bg-ink-900/[0.04] text-ink-500 ring-ink-900/[0.06]"
                      }`}
                    >
                      {t.provider === "mozio"
                        ? "Partner"
                        : t.provider === "platform"
                          ? "Botlify driver"
                          : "Own driver"}
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
                  {t.provider === "platform" ? (
                    t.driverSnapshot?.phone ? (
                      <AssignDriver transfer={t} drivers={[]} onAssign={() => {}} />
                    ) : (
                      ["pending", "confirmed"].includes(t.status) && (
                        <p className="mt-2 text-xs text-ink-500">
                          Botlify is arranging a driver for this pickup.
                        </p>
                      )
                    )
                  ) : (
                    <AssignDriver
                      transfer={t}
                      drivers={drivers}
                      onAssign={async (driverId) => {
                        const { data } = await api.patch(`/transfers/${t._id}/driver`, { driverId });
                        await load();
                        return data;
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {t.status === "pending" && (
                    <button
                      onClick={() => setTransferStatus(t, "confirmed")}
                      className="btn group/b min-h-[36px] gap-1 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50/90 ring-1 ring-emerald-500/20 hover:bg-emerald-100 hover:-translate-y-0.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/b:scale-125" /> Confirm
                    </button>
                  )}
                  {t.status === "confirmed" && (
                    <button
                      onClick={() => setTransferStatus(t, "completed")}
                      className="btn-secondary min-h-[36px] px-3 py-1.5 text-xs"
                    >
                      Done
                    </button>
                  )}
                  {["pending", "confirmed"].includes(t.status) && (
                    <button
                      onClick={() => setTransferStatus(t, "cancelled")}
                      className="btn group/b min-h-[36px] gap-1 px-3 py-1.5 text-xs text-rose-600 bg-rose-50/90 ring-1 ring-rose-500/20 hover:bg-rose-100 hover:-translate-y-0.5"
                    >
                      <XCircle className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/b:rotate-90" /> Cancel
                    </button>
                  )}
                </div>
              </Spotlight>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Who actually drives. Sits under the trips because a hotel comes here
          to check a pickup far more often than to edit the roster. */}
      <div className="relative mt-12 pt-10">
        <div className="divider absolute inset-x-0 top-0" />
        <Reveal>
          <DriversPanel scope="hotel" onChange={setDrivers} />
        </Reveal>
      </div>

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

  const input = "input";
  const label = "label";

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
            className="btn-ghost min-h-[40px]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="btn-primary min-h-[40px] disabled:opacity-60"
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
            <motion.button
              key={val}
              type="button"
              onClick={() => patch("direction", val)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              className={`group flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,box-shadow,color] ${
                form.direction === val
                  ? "bg-white text-ink-900 shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,106,43,0.6),0_10px_24px_-12px_rgba(255,61,119,0.45)]"
                  : "bg-white/60 text-ink-600 ring-1 ring-ink-900/[0.08] hover:bg-white"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 ${
                  form.direction === val ? "text-sunset-flame" : ""
                }`}
              />{" "}
              {l}
            </motion.button>
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
