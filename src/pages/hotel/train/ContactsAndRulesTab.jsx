/**
 * ContactsAndRulesTab — the second tab. Two short sections:
 *   1. People to contact      (#train-contacts)
 *   2. How your AI behaves    (#ai-rules)
 */
import ContactsSection from "./ContactsSection";
import RulesSection from "./RulesSection";

function SectionHeader({ id, step, title, subtitle, attention }) {
  return (
    <header id={id} className="mb-4 scroll-mt-24">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-400">Step {step}</p>
      <h3 className="mt-1 flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
        {title}
        {attention && <span aria-label="Needs attention" className="h-2 w-2 rounded-full bg-[#FF5A1F]" />}
      </h3>
      <p className="mt-0.5 text-[14px] text-neutral-500">{subtitle}</p>
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
    <div className="mx-auto max-w-3xl space-y-12">
      <section aria-labelledby="train-contacts">
        <SectionHeader
          id="train-contacts"
          step={1}
          title="People to contact"
          subtitle="Who your AI points guests to — and who stays private. Tap a role to fill it in."
          attention={contactsMissing}
        />
        <ContactsSection contacts={contacts} roles={roles} onSave={onSaveContacts} />
      </section>

      <section aria-labelledby="ai-rules">
        <SectionHeader
          id="ai-rules"
          step={2}
          title="How your AI behaves"
          subtitle="Rules for tricky moments, so your AI handles them the way you would."
        />
        <RulesSection playbook={playbook} onSave={onSavePlaybook} />
      </section>
    </div>
  );
}
