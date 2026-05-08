import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  X,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Truck,
  PartyPopper,
  XCircle,
  Loader2,
  Send,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { initSocket } from "@/services/socket";
import toast from "react-hot-toast";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABEL = {
  new: "New",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const formatTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function OrdersPage() {
  const { activeWorkspace } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeId, setActiveId] = useState(null);
  const active = useMemo(
    () => orders.find((o) => o._id === activeId) || null,
    [orders, activeId],
  );

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const { data } = await api.get(`/orders?${params.toString()}`);
      setOrders(data.orders || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeWorkspace) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace, statusFilter]);

  // Live updates via socket
  useEffect(() => {
    const sock = initSocket();
    if (!sock) return;
    const handleNew = ({ order }) => {
      setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
      setStatusCounts((prev) => ({
        ...prev,
        [order.status]: (prev[order.status] || 0) + 1,
      }));
      toast.success(`🛒 New order from ${order.customerName || "a customer"}`);
    };
    const handleUpdated = ({ order }) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    };
    sock.on("order:new", handleNew);
    sock.on("order:updated", handleUpdated);
    return () => {
      sock.off("order:new", handleNew);
      sock.off("order:updated", handleUpdated);
    };
  }, []);

  const updateStatus = async (id, nextStatus, notifyCustomer = true) => {
    try {
      const { data } = await api.patch(`/orders/${id}`, {
        status: nextStatus,
        notifyCustomer,
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      toast.success(
        `Marked as ${STATUS_LABEL[nextStatus]}${notifyCustomer ? " — customer notified" : ""}`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update order");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900">
              Smart Orders
            </h1>
            <p className="text-xs text-ink-500">
              Orders captured by your AI from chat conversations.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-700 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {STATUS_TABS.map((t) => {
          const count =
            t.id === "all"
              ? Object.values(statusCounts).reduce((a, b) => a + (b || 0), 0)
              : statusCounts[t.id] || 0;
          const isActive = statusFilter === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isActive
                  ? "bg-ink-900 text-white border-ink-900"
                  : "bg-white text-ink-700 border-ink-200 hover:bg-ink-50"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-ink-100 text-ink-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, address, or item…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-ink-200 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
          />
        </div>
      </form>

      {/* Layout: list + drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="p-12 text-center text-ink-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <EmptyState statusFilter={statusFilter} />
          ) : (
            <div className="divide-y divide-ink-100">
              {orders.map((o) => (
                <OrderRow
                  key={o._id}
                  order={o}
                  active={o._id === activeId}
                  onClick={() => setActiveId(o._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drawer (desktop) */}
        <div className="hidden lg:block">
          {active ? (
            <OrderDrawer
              order={active}
              onClose={() => setActiveId(null)}
              onStatusChange={updateStatus}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-ink-100 p-8 text-center text-ink-400 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 text-ink-300" />
              Select an order to view details
            </div>
          )}
        </div>
      </div>

      {/* Drawer (mobile overlay) */}
      {active && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl p-4">
            <OrderDrawer
              order={active}
              onClose={() => setActiveId(null)}
              onStatusChange={updateStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-ink-50 transition flex items-start gap-3 ${
        active ? "bg-teal-50/50" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 text-xs font-bold shrink-0">
        {(order.customerName || "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-semibold text-sm text-ink-900 truncate">
            {order.customerName || "Unnamed customer"}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
              STATUS_STYLES[order.status] || ""
            }`}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <div className="text-xs text-ink-600 truncate">
          {order.itemsText ||
            (order.items || []).map((i) => `${i.qty}× ${i.name}`).join(", ") ||
            "—"}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-400">
          <span>{formatTime(order.createdAt)}</span>
          {order.subtotal ? (
            <>
              <span>•</span>
              <span className="font-semibold text-ink-700">
                {order.subtotal} {order.currency}
              </span>
            </>
          ) : null}
          <span>•</span>
          <span className="capitalize">{order.channel}</span>
        </div>
      </div>
    </button>
  );
}

function OrderDrawer({ order, onClose, onStatusChange }) {
  const [sending, setSending] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");

  const sendQuickMessage = async () => {
    if (!messageDraft.trim()) return;
    setSending(true);
    try {
      await api.post(`/orders/${order._id}/message`, { text: messageDraft });
      toast.success("Message sent to customer");
      setMessageDraft("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
      <div className="p-4 border-b border-ink-100 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink-900">
            {order.customerName || "Unnamed customer"}
          </h3>
          <p className="text-[11px] text-ink-400 mt-0.5">
            Order #{String(order._id).slice(-8)} · {formatTime(order.createdAt)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
              STATUS_STYLES[order.status] || ""
            }`}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>

        {/* Items */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
            Items
          </div>
          <ul className="space-y-1.5 text-sm text-ink-800">
            {(order.items || []).map((it, i) => (
              <li key={i} className="flex items-start justify-between gap-2">
                <span>
                  <b>{it.qty}×</b> {it.name}
                  {it.variant ? (
                    <span className="text-ink-500"> ({it.variant})</span>
                  ) : null}
                </span>
                {it.price ? (
                  <span className="text-ink-600 text-xs">
                    {it.price * it.qty}
                  </span>
                ) : null}
              </li>
            ))}
            {(!order.items || order.items.length === 0) && order.itemsText && (
              <li className="text-ink-700">{order.itemsText}</li>
            )}
          </ul>
          {order.subtotal ? (
            <div className="mt-2 pt-2 border-t border-ink-100 flex justify-between text-sm font-bold text-ink-900">
              <span>Total</span>
              <span>
                {order.subtotal} {order.currency}
              </span>
            </div>
          ) : null}
        </div>

        {/* Customer */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
            Customer
          </div>
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-sm text-ink-800 mb-1">
              <Phone className="w-3.5 h-3.5 text-ink-400" />
              {order.customerPhone}
            </div>
          )}
          {order.customerAddress && (
            <div className="flex items-start gap-2 text-sm text-ink-800">
              <MapPin className="w-3.5 h-3.5 text-ink-400 mt-0.5 shrink-0" />
              <span>{order.customerAddress}</span>
            </div>
          )}
          {order.paymentMethod && (
            <div className="text-xs text-ink-600 mt-1.5">
              <b>Payment:</b> {order.paymentMethod}
            </div>
          )}
          {order.customerNotes && (
            <div className="text-xs text-ink-600 mt-1.5">
              <b>Notes:</b> {order.customerNotes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
            Update status (notifies customer)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {order.status === "new" && (
              <ActionBtn
                icon={CheckCircle2}
                label="Confirm"
                color="amber"
                onClick={() => onStatusChange(order._id, "confirmed")}
              />
            )}
            {(order.status === "new" || order.status === "confirmed") && (
              <ActionBtn
                icon={Truck}
                label="Mark Shipped"
                color="violet"
                onClick={() => onStatusChange(order._id, "shipped")}
              />
            )}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <ActionBtn
                icon={PartyPopper}
                label="Mark Delivered"
                color="emerald"
                onClick={() => onStatusChange(order._id, "delivered")}
              />
            )}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <ActionBtn
                icon={XCircle}
                label="Cancel"
                color="rose"
                onClick={() => {
                  if (
                    confirm("Cancel this order? Customer will be notified.")
                  ) {
                    onStatusChange(order._id, "cancelled");
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Quick message */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
            Send a quick message
          </div>
          <textarea
            rows={2}
            value={messageDraft}
            onChange={(e) => setMessageDraft(e.target.value)}
            placeholder="Type a custom message to the customer…"
            className="w-full text-sm p-2.5 border border-ink-200 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
          />
          <button
            onClick={sendQuickMessage}
            disabled={sending || !messageDraft.trim()}
            className="mt-1.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ink-900 hover:bg-ink-800 rounded-lg disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Send to customer
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick }) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    violet:
      "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
    emerald:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg border transition ${colors[color]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function EmptyState({ statusFilter }) {
  return (
    <div className="p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center mx-auto mb-3">
        <ShoppingCart className="w-6 h-6 text-ink-400" />
      </div>
      <h3 className="text-sm font-semibold text-ink-900 mb-1">No orders yet</h3>
      <p className="text-xs text-ink-500 max-w-sm mx-auto">
        {statusFilter === "all"
          ? "Once your AI captures an order from a chat, it'll appear here automatically. Make sure Smart Orders is enabled in Settings → Smart Orders."
          : `No orders with status "${STATUS_LABEL[statusFilter] || statusFilter}".`}
      </p>
    </div>
  );
}
