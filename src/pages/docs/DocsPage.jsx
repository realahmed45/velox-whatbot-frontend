import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Aurora, Magnetic, Reveal } from "@/components/fx";
import { DOC_GROUPS } from "./docsContent";

/* Flatten sections for search + lookup. */
const ALL_SECTIONS = DOC_GROUPS.flatMap((g) =>
  g.sections.map((s) => ({ ...s, group: g.group })),
);

/* Turn a section's blocks into plain searchable text. */
const sectionText = (s) => {
  const parts = [s.title, s.summary || ""];
  for (const b of s.blocks || []) {
    if (b.p) parts.push(b.p);
    if (b.h) parts.push(b.h);
    if (b.note) parts.push(b.note);
    if (b.code) parts.push(b.code);
    if (b.list) parts.push(b.list.join(" "));
    if (b.steps) parts.push(b.steps.join(" "));
    if (b.table)
      parts.push(
        [...(b.table.head || []), ...(b.table.rows || []).flat()].join(" "),
      );
  }
  return parts.join(" ").toLowerCase();
};

/* Render **bold** and `code` inside a string. */
function RichText({ text }) {
  const nodes = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**"))
      nodes.push(
        <strong key={key++} className="font-semibold text-ink-900">
          {tok.slice(2, -2)}
        </strong>,
      );
    else
      nodes.push(
        <code
          key={key++}
          className="text-[0.85em] font-mono bg-ink-900/[0.06] text-sunset-flame rounded-md px-1.5 py-0.5"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

const NOTE_STYLE = {
  info: "border-sky-200 bg-sky-50/80 text-sky-900",
  tip: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  warn: "border-amber-200 bg-amber-50/80 text-amber-900",
};

function Block({ b }) {
  if (b.p)
    return (
      <p className="text-ink-600 leading-relaxed">
        <RichText text={b.p} />
      </p>
    );
  if (b.h)
    return (
      <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-950 mt-7 mb-1 scroll-mt-24">
        {b.h}
      </h3>
    );
  if (b.list)
    return (
      <ul className="space-y-2 my-1">
        {b.list.map((li, i) => (
          <li key={i} className="flex gap-2.5 text-ink-600 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-sunset shrink-0" />
            <span>
              <RichText text={li} />
            </span>
          </li>
        ))}
      </ul>
    );
  if (b.steps)
    return (
      <ol className="space-y-2.5 my-1">
        {b.steps.map((st, i) => (
          <li key={i} className="flex gap-3 text-ink-600 leading-relaxed">
            <span className="shrink-0 w-6 h-6 rounded-full bg-sunset text-white text-xs font-bold grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] tabular-nums">
              {i + 1}
            </span>
            <span className="pt-0.5">
              <RichText text={st} />
            </span>
          </li>
        ))}
      </ol>
    );
  if (b.note)
    return (
      <div
        className={`my-2 rounded-xl border px-4 py-3 text-sm leading-relaxed ${NOTE_STYLE[b.tone] || NOTE_STYLE.info}`}
      >
        <RichText text={b.note} />
      </div>
    );
  if (b.code)
    return (
      <div className="my-2 rounded-xl bg-night-950 ring-1 ring-ink-900/10 text-white/85 font-mono text-[13px] px-4 py-3 overflow-x-auto">
        {b.code}
      </div>
    );
  if (b.table)
    return (
      <div className="my-3 overflow-x-auto rounded-xl ring-1 ring-ink-900/[0.08] bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-ink-900/[0.03] text-left">
              {b.table.head.map((h, i) => (
                <th
                  key={i}
                  className="px-3.5 py-2.5 font-semibold text-ink-700 border-b border-ink-900/[0.08] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-ink-900/[0.06] last:border-0 transition-colors hover:bg-ink-900/[0.02]">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3.5 py-2.5 ${ci === 0 ? "font-medium text-ink-900" : "text-ink-600"}`}
                  >
                    {cell || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return null;
}

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(ALL_SECTIONS[0].id);
  const [navOpen, setNavOpen] = useState(false);
  const contentRef = useRef(null);

  const q = query.trim().toLowerCase();

  // Filter groups/sections by the search query.
  const groups = useMemo(() => {
    if (!q) return DOC_GROUPS;
    return DOC_GROUPS.map((g) => ({
      ...g,
      sections: g.sections.filter((s) => sectionText(s).includes(q)),
    })).filter((g) => g.sections.length);
  }, [q]);

  const visibleSections = groups.flatMap((g) => g.sections);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    if (q) return; // don't spy while searching
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-90px 0px -70% 0px", threshold: 0 },
    );
    ALL_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [q]);

  const jump = (id) => {
    setNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 84, behavior: "smooth" });
      setActive(id);
    }
  };

  const navList = (mobile) =>
    groups.map((g) => (
      <div key={g.group} className={mobile ? "mb-5" : undefined}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400 mb-2 px-2.5">
          {g.group}
        </p>
        <ul className="space-y-0.5">
          {g.sections.map((s) => {
            const on = active === s.id && !q;
            return (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  className={`relative isolate block w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-all duration-300 ease-spring ${
                    on
                      ? "text-ink-900 font-medium"
                      : "text-ink-500 hover:text-ink-900 hover:bg-ink-900/[0.04] hover:translate-x-0.5"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId={mobile ? "docs-nav-m" : "docs-nav"}
                      className="absolute inset-0 -z-10 rounded-lg bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_#fff]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    >
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-sunset" />
                    </motion.span>
                  )}
                  <span className="relative">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ));

  return (
    <div className="bg-[#FBFAF8] text-ink-900">
      {/* Header band */}
      <div className="relative isolate overflow-hidden border-b border-ink-900/[0.06]">
        <Aurora />
        <div className="absolute inset-0 -z-10 bg-dot-grid mask-fade-b opacity-60" aria-hidden />
        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 bg-white ring-1 ring-ink-900/[0.08] shadow-sm px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5 text-sunset-flame" strokeWidth={1.8} /> Documentation
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1] text-ink-950">
            Everything you need to{" "}
            <span className="font-serif italic font-normal text-sunset">run</span>{" "}
            Botlify.
          </h1>
          <p className="mt-4 text-ink-600 max-w-2xl sm:text-lg">
            Botlify is the AI channel manager for hotels. Set up your property,
            connect Booking.com, Airbnb, Expedia and WhatsApp, and teach the AI that
            answers your guests — step by step. Search below or browse the sidebar.
          </p>
          <div className="group mt-7 relative max-w-lg">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-transform duration-500 ease-spring group-focus-within:rotate-[-12deg] group-focus-within:scale-110 group-focus-within:text-sunset-flame" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the docs…"
              className="input w-full !pl-10"
            />
          </div>
        </Reveal>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 py-12">
          <nav className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            {navList(false)}
            {!groups.length && (
              <p className="text-sm text-ink-400 px-2.5">No matches.</p>
            )}
          </nav>
        </aside>

        {/* Mobile nav toggle */}
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="lg:hidden fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_-8px_rgba(255,61,119,0.6)] grid place-items-center transition-transform duration-300 ease-spring hover:scale-110 active:scale-95"
          aria-label="Table of contents"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={navOpen ? "x" : "m"}
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
            >
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
        <AnimatePresence>
          {navOpen && (
            <motion.div
              className="lg:hidden fixed inset-0 z-20 bg-night-950/30"
              onClick={() => setNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-strong absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] p-5 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
              >
                {navList(true)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0 py-12 max-w-3xl">
          {visibleSections.length === 0 && (
            <div className="relative text-center py-20">
              <div className="relative mx-auto mb-5 h-14 w-14">
                <div className="absolute inset-0 rounded-full bg-sunset opacity-20 blur-2xl" />
                <div className="relative h-14 w-14 rounded-2xl grid place-items-center bg-white ring-1 ring-ink-900/[0.08]">
                  <Search className="h-6 w-6 text-sunset-flame" strokeWidth={1.8} />
                </div>
              </div>
              <p className="font-display text-xl font-semibold text-ink-950">No results</p>
              <p className="text-sm text-ink-500">Try a different search term.</p>
            </div>
          )}
          {visibleSections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 mb-14 pb-14 border-b border-ink-900/[0.06] last:border-0"
            >
              <Reveal y={16}>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-950">
                  {s.title}
                </h2>
                {s.summary && (
                  <p className="mt-1.5 text-sunset-flame font-medium">{s.summary}</p>
                )}
                <div className="mt-5 space-y-3">
                  {s.blocks.map((b, i) => (
                    <Block key={i} b={b} />
                  ))}
                </div>
              </Reveal>
            </section>
          ))}

          {/* CTA footer */}
          {!q && (
            <Reveal>
              <div className="card relative overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sunset opacity-15 blur-3xl" aria-hidden />
                <div className="relative">
                  <p className="font-display font-semibold text-xl tracking-[-0.02em] text-ink-950">
                    Ready to stop answering guests by hand?
                  </p>
                  <p className="text-ink-600 text-sm">
                    Start your 3-day free trial — live in minutes.
                  </p>
                </div>
                <Magnetic className="relative shrink-0">
                  <Link to="/register" className="btn-primary">
                    Start free <ArrowRight className="w-4 h-4" />
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
