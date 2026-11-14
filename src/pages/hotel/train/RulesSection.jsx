/** RulesSection — "How your AI behaves": instructions for tricky moments. */
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Lightbulb, Plus, ShieldCheck, Trash2 } from "lucide-react";
import SaveBar from "./SaveBar";
import { hasText, newKey, ringError, spring } from "./shared";

const toRules = (playbook) =>
  playbook.map((p) => ({ _k: newKey(), situation: p.situation || "", response: p.response || "" }));
const ruleSig = (rules) =>
  JSON.stringify(rules.map((r) => ({ situation: r.situation.trim(), response: r.response.trim() })));

export default function RulesSection({ playbook, onSave }) {
  const [rules, setRules] = useState(() => toRules(playbook));
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const baseline = useMemo(() => ruleSig(toRules(playbook)), [playbook]);
  const dirty = ruleSig(rules) !== baseline;
  const lastAdded = useRef(null);

  useEffect(() => {
    setRules(toRules(playbook));
    setShowErrors(false);
  }, [playbook]);

  useEffect(() => {
    if (!lastAdded.current) return;
    document.getElementById(`rule-${lastAdded.current}`)?.focus();
    lastAdded.current = null;
  }, [rules.length]);

  const incomplete = (r) => !hasText(r.situation) || !hasText(r.response);

  const update = (k, patch) => setRules((list) => list.map((r) => (r._k === k ? { ...r, ...patch } : r)));

  const add = () => {
    const k = newKey();
    lastAdded.current = k;
    setRules((list) => [...list, { _k: k, situation: "", response: "" }]);
  };

  const save = async () => {
    // A rule with only one half filled would be silently dropped by the server.
    const bad = rules.filter((r) => incomplete(r) && (hasText(r.situation) || hasText(r.response)));
    if (bad.length) {
      setShowErrors(true);
      toast.error("Fill in both parts of each rule, or remove it.");
      document.getElementById(`rule-${bad[0]._k}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    await onSave(
      rules
        .filter((r) => !incomplete(r))
        .map((r) => ({ situation: r.situation.trim(), response: r.response.trim() })),
    );
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-start gap-2.5 rounded-xl bg-sunset-soft ring-1 ring-sunset-flame/15 px-3.5 py-2.5">
        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-sunset-flame" strokeWidth={1.8} />
        <p className="text-sm text-ink-600">
          These are <span className="font-semibold text-ink-900">instructions to your AI</span>, not
          messages to guests. They tell it what to do in tricky moments — an emergency, an angry
          guest, a refund request — so it handles them the way you would.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {rules.length === 0 && (
          <div className="card p-8 text-center">
            <div className="relative mx-auto mb-3 grid h-12 w-12 place-items-center">
              <span aria-hidden className="absolute inset-0 rounded-full bg-sunset opacity-20 blur-2xl" />
              <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
              </span>
            </div>
            <p className="font-display font-semibold text-ink-900">No rules yet</p>
            <p className="text-sm text-ink-500 mt-1">Add one for each situation you want handled your way.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {rules.map((r, i) => {
            const flagged = showErrors && incomplete(r);
            const done = !incomplete(r);
            return (
              <motion.div
                key={r._k}
                layout="position"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={spring}
                className={`card group p-4 transition-shadow duration-500 ${flagged ? ringError : "focus-within:shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,106,43,0.45),0_16px_36px_-18px_rgba(255,61,119,0.35)]"}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums mt-6 transition-colors duration-300 ${
                      done ? "bg-sunset text-white shadow-[0_6px_14px_-6px_rgba(255,61,119,0.55)]" : "bg-ink-900/[0.05] text-ink-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 grid gap-3">
                    <div>
                      <label htmlFor={`rule-${r._k}`} className="text-xs font-semibold text-ink-500">
                        When…
                      </label>
                      <input
                        id={`rule-${r._k}`}
                        value={r.situation}
                        onChange={(e) => update(r._k, { situation: e.target.value })}
                        maxLength={200}
                        placeholder="e.g. A guest asks for a late check-out on a Sunday"
                        className={`input mt-1 font-medium ${flagged && !hasText(r.situation) ? "!border-rose-400" : ""}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink-500">Your AI should…</label>
                      <textarea
                        value={r.response}
                        onChange={(e) => update(r._k, { response: e.target.value })}
                        maxLength={1000}
                        rows={2}
                        placeholder="e.g. Say yes until 2pm at no charge, later than that costs half a night."
                        className={`input mt-1 min-h-[72px] ${flagged && !hasText(r.response) ? "!border-rose-400" : ""}`}
                      />
                    </div>
                    {flagged && (
                      <p className="text-xs text-rose-600 -mt-1">Fill in both parts, or remove this rule.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setRules((list) => list.filter((x) => x._k !== r._k))}
                    aria-label="Remove rule"
                    title="Remove"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:rotate-[-10deg] hover:text-rose-600 hover:bg-rose-50 active:scale-90 mt-5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button onClick={add} className="btn-secondary group mt-4 min-h-[42px]" disabled={rules.length >= 60}>
        <Plus className="w-4 h-4 text-sunset-flame transition-transform duration-500 ease-spring group-hover:rotate-90" />
        Add a rule
      </button>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => {
          setRules(toRules(playbook));
          setShowErrors(false);
        }}
        label="Save rules"
      />
    </div>
  );
}
