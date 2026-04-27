import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Gift, Trophy, Users } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

const EMPTY = {
  name: "",
  postId: "",
  keyword: "",
  endsAt: "",
  winnersCount: 1,
  dmMessage: "🎉 You won! Congrats!",
};

export default function GiveawaysPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/giveaways");
      setList(data.giveaways || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.postId || !form.keyword || !form.endsAt)
      return toast.error("Fill all required fields");
    setSaving(true);
    try {
      await api.post("/giveaways", form);
      toast.success("Giveaway created");
      setShowModal(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const pickWinners = async (id) => {
    if (!window.confirm("Pick winners now? This ends the giveaway.")) return;
    try {
      const { data } = await api.post(`/giveaways/${id}/pick-winners`);
      toast.success(`Picked ${data.winners?.length || 0} winner(s)!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this giveaway?")) return;
    try {
      await api.delete(`/giveaways/${id}`);
      setList((c) => c.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <PageHeader
        icon={Gift}
        title="Giveaways & contests"
        subtitle="Auto-collect entries from post comments and pick random winners"
      >
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> New giveaway
        </button>
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No giveaways yet"
          description="Run viral contests. Entrants comment on a post, Botlify DMs them a confirmation, and picks winners at random."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary gap-2"
            >
              <Plus className="w-4 h-4" /> Launch a giveaway
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {list.map((g) => {
            const ended =
              g.status === "ended" || new Date(g.endsAt) < new Date();
            return (
              <div key={g._id} className="card">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{g.name}</h3>
                      <span
                        className={`chip ${
                          g.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : g.status === "ended"
                              ? "bg-ink-100 text-ink-500"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      Keyword: <b>{g.keyword}</b> · Post {g.postId.slice(-8)} ·
                      Ends {dayjs(g.endsAt).format("MMM D, h:mm A")}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-ink-600">
                        <Users className="w-3.5 h-3.5" />{" "}
                        {g.entries?.length || 0} entries
                      </span>
                      <span className="flex items-center gap-1 text-ink-600">
                        <Trophy className="w-3.5 h-3.5" />{" "}
                        {g.winners?.length || 0} winner(s)
                      </span>
                    </div>
                  </div>
                  {ended && g.status !== "ended" && (
                    <button
                      onClick={() => pickWinners(g._id)}
                      className="btn btn-primary"
                    >
                      <Trophy className="w-4 h-4" /> Pick Winners
                    </button>
                  )}
                  <button
                    onClick={() => remove(g._id)}
                    className="p-2 rounded hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-ink-100">
              <h2 className="text-lg font-semibold">New Giveaway</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-ink-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Summer Giveaway"
                />
              </div>
              <div>
                <label className="label">Instagram Post/Reel ID</label>
                <input
                  className="input"
                  value={form.postId}
                  onChange={(e) => setForm({ ...form, postId: e.target.value })}
                  placeholder="17912345678901234"
                />
              </div>
              <div>
                <label className="label">Entry Keyword</label>
                <input
                  className="input"
                  value={form.keyword}
                  onChange={(e) =>
                    setForm({ ...form, keyword: e.target.value })
                  }
                  placeholder="e.g. ME"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Ends At</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.endsAt}
                    onChange={(e) =>
                      setForm({ ...form, endsAt: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Winners</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={form.winnersCount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        winnersCount: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label">Winner DM</label>
                <textarea
                  className="input"
                  rows="3"
                  value={form.dmMessage}
                  onChange={(e) =>
                    setForm({ ...form, dmMessage: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="p-5 border-t border-ink-100 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
