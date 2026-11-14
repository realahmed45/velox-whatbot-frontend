/** ContactsSection — who the AI points guests to (and who stays private). */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Eye, EyeOff, Mail, Phone, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { PulseDot } from "@/components/fx";
import SaveBar from "./SaveBar";
import { EMAIL_RE, PHONE_RE, ROLE_META, hasText, hop, mustHave, newKey, ringWarn, spring } from "./shared";

function toRows(contacts, roles) {
  const rows = contacts.map((c) => ({
    _k: newKey(),
    role: c.role,
    name: c.name || "",
    whatsapp: c.whatsapp || "",
    email: c.email || "",
    availability: c.availability || "",
    shareWithGuests: !!c.shareWithGuests,
    notes: c.notes || "",
  }));
  for (const r of roles) {
    if (!rows.some((x) => x.role === r.key)) rows.push(blankRow(r));
  }
  return rows;
}

function blankRow(role) {
  return {
    _k: newKey(),
    role: role.key,
    name: "",
    whatsapp: "",
    email: "",
    availability: "",
    shareWithGuests: !!role.share,
    notes: "",
  };
}

const stripRow = ({ _k, ...rest }) => rest;
const isFilled = (r) => hasText(r.name) || hasText(r.whatsapp) || hasText(r.email);
const sig = (rows) => JSON.stringify(rows.filter(isFilled).map(stripRow));

export default function ContactsSection({ contacts, roles, onSave }) {
  const [rows, setRows] = useState(() => toRows(contacts, roles));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const baseline = useMemo(() => sig(toRows(contacts, roles)), [contacts, roles]);
  const dirty = sig(rows) !== baseline;

  // Server data changed (initial load, after save) → start from it.
  useEffect(() => {
    setRows(toRows(contacts, roles));
  }, [contacts, roles]);

  const update = (k, patch) => {
    setRows((list) => list.map((r) => (r._k === k ? { ...r, ...patch } : r)));
    setErrors((e) => {
      const n = { ...e };
      Object.keys(patch).forEach((f) => delete n[`${k}.${f}`]);
      return n;
    });
    setFormError("");
  };

  const validate = () => {
    const e = {};
    for (const r of rows) {
      if (hasText(r.whatsapp) && !PHONE_RE.test(r.whatsapp.trim()))
        e[`${r._k}.whatsapp`] = "Use the full international number, e.g. +62 812 3456 7890";
      if (hasText(r.email) && !EMAIL_RE.test(r.email.trim()))
        e[`${r._k}.email`] = "That email doesn't look right";
    }
    return e;
  };

  const save = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError("A couple of details need fixing — they're marked in red.");
      const first = Object.keys(e)[0].split(".")[0];
      document.getElementById(`row-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    const list = rows.filter(isFilled).map(stripRow);
    const res = await onSave(list);
    setSaving(false);
    if (res.ok) {
      setErrors({});
      setFormError("");
      return;
    }
    if (res.validation) {
      // The server names the contact ("The number for "Wayan" doesn't look right…").
      const quoted = /"([^"]+)"/.exec(res.message || "")?.[1];
      const hit = quoted && rows.find((r) => isFilled(r) && (r.name.trim() === quoted || r.role === quoted));
      if (hit) setErrors({ [`${hit._k}.whatsapp`]: res.message });
      setFormError(res.message);
    }
  };

  const discard = () => {
    setRows(toRows(contacts, roles));
    setErrors({});
    setFormError("");
  };

  return (
    <div>
      <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/70 ring-1 ring-emerald-500/15 px-3.5 py-2.5">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" strokeWidth={1.8} />
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">Private numbers stay private.</span> Your AI only
          gives a guest a number when you've switched on{" "}
          <span className="font-semibold">"Guests can get this number"</span>. Everyone else is kept
          on file for you and your team, and is never shared with guests.
        </p>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const meta = ROLE_META[role.key] || { icon: UserRound, help: "" };
          const Icon = meta.icon;
          const list = rows.filter((r) => r.role === role.key);
          const set = list.some((r) => hasText(r.whatsapp));
          const missing = role.required && !set;
          return (
            <section
              key={role.key}
              id={`contact-${role.key}`}
              className={`card group h-full p-4 sm:p-5 scroll-mt-24 transition-shadow duration-500 ${
                meta.multiple ? "md:col-span-2" : ""
              } ${
                missing
                  ? ringWarn
                  : set
                    ? "shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(16,185,129,0.18),0_10px_28px_-18px_rgba(16,185,129,0.35)]"
                    : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${missing ? "bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.55)]" : "bg-sunset-soft text-sunset-flame"} ${hop}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="font-display font-semibold tracking-[-0.01em] text-ink-900">{role.label}</h4>
                    {role.required && <span className={mustHave}>Must-have</span>}
                    {!missing && set && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                        <PulseDot color="bg-emerald-500" /> Set
                      </span>
                    )}
                  </div>
                  {meta.help && <p className="text-xs text-ink-500 mt-0.5">{meta.help}</p>}
                  {missing && (
                    <p className="text-xs font-semibold text-sunset-flame mt-1">
                      Add a WhatsApp number so your AI can point guests here.
                    </p>
                  )}
                </div>
              </div>

              <div className={`mt-4 ${meta.multiple ? "grid lg:grid-cols-2 gap-4" : "space-y-4"}`}>
                {list.map((r, i) => (
                  <ContactFields
                    key={r._k}
                    row={r}
                    errors={errors}
                    onChange={(patch) => update(r._k, patch)}
                    removable={meta.multiple && list.length > 1}
                    clearable={isFilled(r)}
                    onRemove={() => setRows((all) => all.filter((x) => x._k !== r._k))}
                    onClear={() =>
                      update(r._k, { name: "", whatsapp: "", email: "", availability: "", notes: "" })
                    }
                    index={meta.multiple && list.length > 1 ? i + 1 : 0}
                  />
                ))}
              </div>

              {meta.multiple && (
                <button
                  onClick={() => setRows((all) => [...all, blankRow(role)])}
                  className="btn-secondary group/a mt-3 min-h-[40px] text-sm"
                >
                  <Plus className="w-4 h-4 text-sunset-flame transition-transform duration-500 ease-spring group-hover/a:rotate-90" />
                  Add another {role.key === "taxi" ? "driver or taxi company" : "contact"}
                </button>
              )}
            </section>
          );
        })}
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        error={formError}
        onSave={save}
        onDiscard={discard}
        label="Save contacts"
      />
    </div>
  );
}

function ContactFields({ row, errors, onChange, removable, clearable, onRemove, onClear, index }) {
  const err = (f) => errors[`${row._k}.${f}`];
  const field = (f, label, icon, props = {}) => {
    const Icon = icon;
    return (
      <div>
        <label htmlFor={`${row._k}-${f}`} className="text-xs font-semibold text-ink-500">
          {label}
        </label>
        <div className="relative mt-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            id={`${row._k}-${f}`}
            value={row[f]}
            onChange={(e) => onChange({ [f]: e.target.value })}
            aria-invalid={!!err(f)}
            className={`input pl-9 ${err(f) ? "!border-rose-400 focus:!shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : ""}`}
            {...props}
          />
        </div>
        <AnimatePresence>
          {err(f) && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="text-xs text-rose-600 mt-1"
            >
              {err(f)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div id={`row-${row._k}`} className={index ? "rounded-xl bg-white/60 p-3.5 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff]" : ""}>
      {(index > 0 || removable || clearable) && (
        <div className="flex items-center justify-between mb-2 min-h-[20px]">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
            {index ? `#${index}` : ""}
          </span>
          {removable ? (
            <button onClick={onRemove} className="btn-ghost group/r px-2.5 py-1.5 text-xs text-ink-400 hover:!text-rose-600 hover:!bg-rose-50">
              <Trash2 className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/r:rotate-[-12deg]" />
              Remove
            </button>
          ) : clearable ? (
            <button onClick={onClear} className="btn-ghost px-2.5 py-1.5 text-xs text-ink-400">
              Clear
            </button>
          ) : null}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {field("name", "Name", UserRound, { placeholder: "e.g. Wayan", maxLength: 120 })}
        {field("whatsapp", "WhatsApp number", Phone, {
          placeholder: "+62 812 3456 7890",
          inputMode: "tel",
          maxLength: 30,
        })}
        {field("email", "Email (optional)", Mail, {
          placeholder: "name@hotel.com",
          type: "email",
          maxLength: 160,
        })}
        {field("availability", "When they're available", Clock, {
          placeholder: "e.g. 24/7 or Mon–Sat, 8am–5pm",
          maxLength: 120,
        })}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={row.shareWithGuests}
        onClick={() => onChange({ shareWithGuests: !row.shareWithGuests })}
        className={`mt-3 w-full flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-left ring-1 transition-[background-color,box-shadow,transform] duration-300 ease-spring active:scale-[0.99] ${
          row.shareWithGuests
            ? "bg-emerald-50/80 ring-emerald-500/25"
            : "bg-ink-900/[0.03] ring-ink-900/[0.06] hover:bg-white/70"
        }`}
      >
        <span
          className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full shadow-[inset_0_1px_2px_rgba(15,23,42,0.15)] transition-colors duration-300 ${
            row.shareWithGuests ? "bg-emerald-500" : "bg-ink-900/[0.15]"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 600, damping: 28 }}
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_2px_5px_rgba(15,23,42,0.25)] ${
              row.shareWithGuests ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            {row.shareWithGuests ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Guests can get this number
          </span>
          <span className="block text-xs text-ink-500 mt-0.5">
            {row.shareWithGuests
              ? "Your AI may give this number to a guest who needs it."
              : "Private — never given to guests. The AI tells them your team will help instead."}
          </span>
        </span>
      </button>
    </div>
  );
}
