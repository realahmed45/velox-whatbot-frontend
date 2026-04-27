import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Target,
  Plus as PlusIcon,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function CompetitorsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [adding, setAdding] = useState(false);
  const [snapshotModal, setSnapshotModal] = useState(null);
  const [snap, setSnap] = useState({
    followers: "",
    following: "",
    mediaCount: "",
    engagementRate: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/competitors");
      setList(data.competitors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const add = async () => {
    if (!username.trim()) return;
    setAdding(true);
    try {
      await api.post("/competitors", {
        username: username.trim().replace(/^@/, ""),
      });
      toast.success("Competitor added");
      setUsername("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setAdding(false);
    }
  };

  const saveSnapshot = async () => {
    try {
      await api.post(`/competitors/${snapshotModal._id}/snapshots`, {
        followers: Number(snap.followers) || 0,
        following: Number(snap.following) || 0,
        mediaCount: Number(snap.mediaCount) || 0,
        engagementRate: Number(snap.engagementRate) || 0,
      });
      toast.success("Snapshot saved");
      setSnapshotModal(null);
      setSnap({
        followers: "",
        following: "",
        mediaCount: "",
        engagementRate: "",
      });
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this competitor?")) return;
    try {
      await api.delete(`/competitors/${id}`);
      setList((c) => c.filter((x) => x._id !== id));
    } catch {
      toast.error("Failed");
    }
  };

  const latest = (c) => c.snapshots?.[c.snapshots.length - 1] || {};

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <PageHeader
        icon={Target}
        title="Competitor tracking"
        subtitle="Monitor up to 10 competitor accounts and benchmark your performance"
      />

      <div className="card mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              @
            </span>
            <input
              className="input pl-8"
              placeholder="competitor_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          </div>
          <button
            onClick={add}
            disabled={adding || list.length >= 10}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" /> Track
          </button>
        </div>
        {list.length >= 10 && (
          <p className="text-xs text-amber-600 mt-2">
            Max 10 competitors. Remove one to add another.
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
      ) : list.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">
            Add your first competitor to start tracking.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((c) => {
            const s = latest(c);
            return (
              <div key={c._id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                    {c.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-ink-900">
                        @{c.username}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSnapshotModal(c)}
                          className="p-1.5 rounded hover:bg-ink-100 text-ink-500"
                          title="Add snapshot"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(c._id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <Stat label="Followers" value={s.followers} />
                      <Stat label="Posts" value={s.mediaCount} />
                      <Stat
                        label="Engagement"
                        value={
                          s.engagementRate
                            ? `${Number(s.engagementRate).toFixed(1)}%`
                            : "—"
                        }
                        up={s.engagementRate > 3}
                      />
                    </div>
                    <p className="text-xs text-ink-400 mt-2">
                      {c.snapshots?.length || 0} snapshot(s)
                      {c.lastSyncedAt &&
                        ` · updated ${new Date(c.lastSyncedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {snapshotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md max-w-md w-full p-5">
            <h2 className="text-lg font-semibold mb-4">
              Add Snapshot — @{snapshotModal.username}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {["followers", "following", "mediaCount", "engagementRate"].map(
                (k) => (
                  <div key={k}>
                    <label className="label capitalize">
                      {k.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={snap[k]}
                      onChange={(e) =>
                        setSnap({ ...snap, [k]: e.target.value })
                      }
                    />
                  </div>
                ),
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setSnapshotModal(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={saveSnapshot} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, up }) {
  return (
    <div>
      <p className="text-lg font-bold text-ink-900 flex items-center justify-center gap-1">
        {typeof value === "number" ? value.toLocaleString() : (value ?? "—")}
        {up && <TrendingUp className="w-3 h-3 text-emerald-500" />}
      </p>
      <p className="text-[10px] uppercase text-ink-400 tracking-wider">
        {label}
      </p>
    </div>
  );
}
