/**
 * useTraining — loads /api/training and owns every write.
 *
 * Every write returns the full payload, which replaces local state; question
 * edits are applied optimistically first and rolled back on failure. Contacts
 * and rules are edited as drafts inside their sections, so a failed save simply
 * leaves the draft as is.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { computeReadiness, errMsg, hasText } from "./shared";

export default function useTraining() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [playbook, setPlaybook] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [serverReadiness, setServerReadiness] = useState(null);

  const apply = useCallback((data) => {
    if (!data) return;
    // Only swap arrays that actually changed: the contacts and rules editors
    // reset their drafts when their source changes, so saving a question must
    // not wipe unsaved edits in another section.
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const keep = (next) => (prev) => (same(prev, next) ? prev : next);
    if (data.faqs) setFaqs(data.faqs);
    if (data.contacts) setContacts(keep(data.contacts));
    if (data.playbook) setPlaybook(keep(data.playbook));
    if (data.categories) setCategories(keep(data.categories));
    if (data.roles) setRoles(keep(data.roles));
    if (data.readiness) setServerReadiness(data.readiness);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/training");
      apply(data);
    } catch (e) {
      setLoadError(errMsg(e, "We couldn't load your AI's training."));
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  const readiness = useMemo(
    () => (roles.length ? computeReadiness(faqs, contacts, roles) : serverReadiness),
    [faqs, contacts, roles, serverReadiness],
  );

  /* ── Question writes ─────────────────────────────────────────────── */
  // `quiet`: guided mode shows its own progress, so no toast per answer.
  const saveFaq = async (faq, form, { quiet = false } = {}) => {
    const prev = faqs;
    setFaqs((list) => list.map((f) => (f._id === faq._id ? { ...f, ...form } : f)));
    try {
      const { data } = await api.patch(`/training/${faq._id}`, form);
      apply(data);
      if (!quiet) {
        toast.success(hasText(form.answer) ? "Saved — your AI will use this answer" : "Saved — the AI won't answer this one yet");
      }
      return true;
    } catch (e) {
      setFaqs(prev);
      toast.error(errMsg(e, "Couldn't save that answer"));
      return false;
    }
  };

  const addFaq = async (form) => {
    try {
      const { data } = await api.post("/training", form);
      apply(data);
      toast.success("Question added");
      return true;
    } catch (e) {
      toast.error(errMsg(e, "Couldn't add that question"));
      return false;
    }
  };

  const deleteFaq = async (faq) => {
    const yes = await confirm({
      title: "Delete this question?",
      description: `"${faq.question}" — your AI will stop using this answer.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!yes) return;
    const prev = faqs;
    setFaqs((list) => list.filter((f) => f._id !== faq._id));
    try {
      const { data } = await api.delete(`/training/${faq._id}`);
      apply(data);
      toast.success("Question deleted");
    } catch (e) {
      setFaqs(prev);
      toast.error(errMsg(e, "Couldn't delete that question"));
    }
  };

  /** Resolves true when the defaults were restored. */
  const resetFaqs = async () => {
    const yes = await confirm({
      title: "Restore the default questions?",
      description:
        "This replaces every question and answer on this tab with the original set. Answers you've written will be lost. Your contacts and AI behaviour stay as they are.",
      confirmLabel: "Restore defaults",
      danger: true,
    });
    if (!yes) return false;
    try {
      const { data } = await api.post("/training/reset");
      apply(data);
      toast.success("Default questions restored");
      return true;
    } catch (e) {
      toast.error(errMsg(e, "Couldn't restore the defaults"));
      return false;
    }
  };

  /* ── Contacts & playbook writes ─────────────────────────────────── */
  const saveContacts = async (list) => {
    try {
      const { data } = await api.put("/training/contacts", { contacts: list });
      apply(data);
      toast.success("Contacts saved");
      return { ok: true };
    } catch (e) {
      const message = errMsg(e, "Couldn't save your contacts");
      if (e?.response?.status !== 400) toast.error(message);
      return { ok: false, message, validation: e?.response?.status === 400 };
    }
  };

  const savePlaybook = async (list) => {
    try {
      const { data } = await api.put("/training/playbook", { playbook: list });
      apply(data);
      toast.success("Saved — your AI will follow these from its next reply");
      return true;
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save these rules"));
      return false;
    }
  };

  return {
    loading,
    loadError,
    load,
    faqs,
    contacts,
    playbook,
    categories,
    roles,
    readiness,
    saveFaq,
    addFaq,
    deleteFaq,
    resetFaqs,
    saveContacts,
    savePlaybook,
  };
}
