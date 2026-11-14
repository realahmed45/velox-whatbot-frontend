/**
 * ContactsAndRulesTab — the second top tab. Two clearly separated sections:
 *   1. People to contact      (#train-contacts)
 *   2. How your AI behaves    (#ai-rules)
 */
import { ShieldCheck, Users } from "lucide-react";
import { PulseDot } from "@/components/fx";
import ContactsSection from "./ContactsSection";
import RulesSection from "./RulesSection";

function SectionHeader({ id, icon: Icon, step, title, subtitle, attention }) {
  return (
    <header id={id} className="scroll-mt-24 flex items-start gap-3 mb-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Part {step}</p>
        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900 flex items-center gap-2">
          {title}
          {attention && (
            <span aria-label="Needs attention" className="inline-flex">
              <PulseDot color="bg-sunset-flame" />
            </span>
          )}
        </h3>
        <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>
      </div>
    </header>
  );
}

export default function ContactsAndRulesTab({
  contacts,
  roles,
  playbook,
  onSaveContacts,
  onSavePlaybook,
  contactsMissing,
}) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="train-contacts">
        <SectionHeader
          id="train-contacts"
          icon={Users}
          step={1}
          title="People to contact"
          subtitle="Who your AI points guests to — and who stays private."
          attention={contactsMissing}
        />
        <ContactsSection contacts={contacts} roles={roles} onSave={onSaveContacts} />
      </section>

      <div className="divider" />

      <section aria-labelledby="ai-rules">
        <SectionHeader
          id="ai-rules"
          icon={ShieldCheck}
          step={2}
          title="How your AI behaves"
          subtitle="Rules for tricky moments, so your AI handles them the way you would."
        />
        <RulesSection playbook={playbook} onSave={onSavePlaybook} />
      </section>
    </div>
  );
}
