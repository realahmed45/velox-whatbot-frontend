/**
 * ContactsSection — who the AI points guests to (and who stays private).
 * One tidy row per role; tap to open a short form. Must-haves that are still
 * missing start open. Saved with PUT /training/contacts via onSave(list).
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Eye, EyeOff, Lock, Plus, Trash2, UserRound } from "lucide-react";
import SaveBar from "./SaveBar";
import { EMAIL_RE, PHONE_RE, ROLE_META, hasText, newKey } from "./shared";
import { Switch, btnGhost, btnSecondary, field, fieldError, labelCls, mustHavePill, panel } from "./ui";

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
  const [open, setOpen] = useState(
    () =>
      new Set(
        roles
          .filter((r) => r.required && !contacts.some((c) => c.role === r.key && hasText(c.whatsapp)))
          .map((r) => r.key),
      ),
  );
  const baseline = useMemo(() => sig(toRows(contacts, roles)), [contacts, roles]);
  const dirty = sig(rows) !== baseline;

  // Server data changed (initial load, after save) → start from it.
  useEffect(() => {
    setRows(toRows(contacts, roles));
  }, [contacts, roles]);

  const toggle = (key) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

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

  const openRolesFor = (errs) => {
    const ks = new Set(Object.keys(errs).map((x) => x.split(".")[0]));
    const roleKeys = rows.filter((r) => ks.has(r._k)).map((r) => r.role);
    if (roleKeys.length) setOpen((s) => new Set([...s, ...roleKeys]));
  };

  const save = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError("A couple of details need fixing — they're marked in red.");
      openRolesFor(e);
      const first = Object.keys(e)[0].split(".")[0];
      setTimeout(() => {
        document.getElementById(`row-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
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
      if (hit) {
        const errs = { [`${hit._k}.whatsapp`]: res.message };
        setErrors(errs);
        openRolesFor(errs);
      }
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
      <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-3 text-[13px] text-neutral-600">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
        <p>
          <span className="font-semibold text-[#0A0A0A]">Private numbers stay private.</span> Your AI only gives a
          guest a number when you switch on <span className="font-semibold">"Guests can get this number"</span>.
          Everyone else is kept on file for your team and never shared with guests.
        </p>
      </div>

      <div className={`${panel} divide-y divide-neutral-100 overflow-hidden`}>
        {roles.map((role) => {
          const meta = ROLE_META[role.key] || { icon: UserRound, help: "" };
          const Icon = meta.icon;
          const list = rows.filter((r) => r.role === role.key);
          const set = list.some((r) => hasText(r.whatsapp));
          const missing = role.required && !set;
          const isOpen = open.has(role.key);
          const filled = list.filter(isFilled);
          const summary = filled.length
            ? filled
                .map((r) => [r.name, r.whatsapp].filter(hasText).join(" · "))
                .join(", ")
            : "Not added yet";
          return (
            <section key={role.key} id={`contact-${role.key}`} className="scroll-mt-24">
              <button
                type="button"
                onClick={() => toggle(role.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50/80 sm:px-5"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    missing ? "bg-[#FF5A1F] text-[#0A0A0A]" : set ? "bg-[#0A0A0A] text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">{role.label}</span>
                    {missing && <span className={mustHavePill}>Must-have</span>}
                    {set && (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Set
                      </span>
                    )}
                  </span>
                  <span className={`mt-0.5 block truncate text-[13px] ${filled.length ? "text-neutral-600" : "text-neutral-400"}`}>
                    {summary}
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-5 sm:px-5 sm:pl-[72px]"
                  >
                    {meta.help && <p className="mb-3 text-[13px] text-neutral-500">{meta.help}</p>}
                    <div className="space-y-4">
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
                        className={`${btnSecondary} mt-3 min-h-[40px] text-[13px]`}
                      >
                        <Plus className="h-4 w-4 text-[#FF5A1F]" />
                        Add another {role.key === "taxi" ? "driver or taxi company" : "contact"}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
  const [more, setMore] = useState(() => hasText(row.email) || hasText(row.availability));
  const err = (f) => errors[`${row._k}.${f}`];
  const showMore = more || !!err("email");

  const input = (f, label, props = {}) => (
    <div>
      <label htmlFor={`${row._k}-${f}`} className={labelCls}>
        {label}
      </label>
      <input
        id={`${row._k}-${f}`}
        value={row[f]}
        onChange={(e) => onChange({ [f]: e.target.value })}
        aria-invalid={!!err(f)}
        className={`${field} mt-1.5 ${err(f) ? fieldError : ""}`}
        {...props}
      />
      {err(f) && <p className="mt-1 text-[12px] text-rose-600">{err(f)}</p>}
    </div>
  );

  return (
    <div id={`row-${row._k}`} className={index ? "rounded-xl border border-neutral-200 p-3.5" : ""}>
      {(index > 0 || removable || clearable) && (
        <div className="mb-2 flex min-h-[24px] items-center justify-between">
          <span className="text-[12px] font-semibold text-neutral-400">{index ? `#${index}` : ""}</span>
          {removable ? (
            <button onClick={onRemove} className={`${btnGhost} min-h-[32px] px-2 text-[12px] hover:!bg-rose-50 hover:!text-rose-600`}>
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : clearable ? (
            <button onClick={onClear} className={`${btnGhost} min-h-[32px] px-2 text-[12px]`}>
              Clear
            </button>
          ) : null}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {input("name", "Name", { placeholder: "e.g. Wayan", maxLength: 120 })}
        {input("whatsapp", "WhatsApp number", { placeholder: "+62 812 3456 7890", inputMode: "tel", maxLength: 30 })}
        {showMore && (
          <>
            {input("email", "Email (optional)", { placeholder: "name@hotel.com", type: "email", maxLength: 160 })}
            {input("availability", "When they're available", {
              placeholder: "e.g. 24/7 or Mon–Sat, 8am–5pm",
              maxLength: 120,
            })}
          </>
        )}
      </div>
      {!showMore && (
        <button
          type="button"
          onClick={() => setMore(true)}
          className="mt-2 text-[13px] font-medium text-neutral-500 underline-offset-4 hover:text-[#0A0A0A] hover:underline"
        >
          + Email and hours (optional)
        </button>
      )}

      <div className="mt-3 flex items-center gap-3 rounded-xl bg-neutral-50 px-3.5 py-3">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#0A0A0A]">
            {row.shareWithGuests ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Guests can get this number
          </span>
          <span className="mt-0.5 block text-[12px] text-neutral-500">
            {row.shareWithGuests
              ? "Your AI may give this number to a guest who needs it."
              : "Private — never given to guests. The AI tells them your team will help instead."}
          </span>
        </span>
        <Switch
          checked={row.shareWithGuests}
          onChange={(v) => onChange({ shareWithGuests: v })}
          label="Guests can get this number"
        />
      </div>
    </div>
  );
}
