/** RulesSection — "How your AI behaves": instructions for tricky moments. */
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Lightbulb, Plus, Trash2 } from "lucide-react";
import SaveBar from "./SaveBar";
import { hasText, newKey } from "./shared";
import { btnSecondary, field, fieldError, iconBtnDanger, labelCls, panel } from "./ui";

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
      <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-[#FF5A1F]/[0.06] px-3.5 py-3 text-[13px] text-neutral-600">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A1F]" />
        <p>
          These are <span className="font-semibold text-[#0A0A0A]">instructions to your AI</span>, not messages to
          guests — what to do in an emergency, with an angry guest or a refund request.
        </p>
      </div>

      {rules.length === 0 ? (
        <div className={`${panel} px-6 py-8 text-center`}>
          <p className="font-semibold text-[#0A0A0A]">No rules yet</p>
          <p className="mt-1 text-[14px] text-neutral-500">Add one for each situation you want handled your way.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((r, i) => {
            const flagged = showErrors && incomplete(r);
            return (
              <div
                key={r._k}
                className={`${panel} p-4 sm:p-5 transition-[border-color,box-shadow] focus-within:border-[#FF5A1F]/50 ${
                  flagged ? "!border-rose-300" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-[12px] font-semibold tabular-nums text-neutral-600">
                    {i + 1}
                  </span>
                  <div className="grid min-w-0 flex-1 gap-3">
                    <div>
                      <label htmlFor={`rule-${r._k}`} className={labelCls}>
                        When…
                      </label>
                      <input
                        id={`rule-${r._k}`}
                        value={r.situation}
                        onChange={(e) => update(r._k, { situation: e.target.value })}
                        maxLength={200}
                        placeholder="e.g. A guest asks for a late check-out on a Sunday"
                        className={`${field} mt-1.5 font-medium ${flagged && !hasText(r.situation) ? fieldError : ""}`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Your AI should…</label>
                      <textarea
                        value={r.response}
                        onChange={(e) => update(r._k, { response: e.target.value })}
                        maxLength={1000}
                        rows={2}
                        placeholder="e.g. Say yes until 2pm at no charge, later than that costs half a night."
                        className={`${field} mt-1.5 min-h-[72px] ${flagged && !hasText(r.response) ? fieldError : ""}`}
                      />
                    </div>
                    {flagged && <p className="-mt-1 text-[12px] text-rose-600">Fill in both parts, or remove this rule.</p>}
                  </div>
                  <button
                    onClick={() => setRules((list) => list.filter((x) => x._k !== r._k))}
                    aria-label="Remove rule"
                    title="Remove"
                    className={`${iconBtnDanger} -mr-2 -mt-1`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={add} className={`${btnSecondary} mt-4`} disabled={rules.length >= 60}>
        <Plus className="h-4 w-4 text-[#FF5A1F]" />
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
