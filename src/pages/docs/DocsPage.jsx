import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ArrowRight, Menu, X } from "lucide-react";
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
          className="text-[0.85em] font-mono bg-ink-100 text-brand-700 rounded px-1.5 py-0.5"
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
  info: "border-blue-200 bg-blue-50 text-blue-900",
  tip: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
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
      <h3 className="text-lg font-bold text-ink-900 mt-6 mb-1 scroll-mt-24">
        {b.h}
      </h3>
    );
  if (b.list)
    return (
      <ul className="space-y-2 my-1">
        {b.list.map((li, i) => (
          <li key={i} className="flex gap-2.5 text-ink-600 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
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
            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold grid place-items-center">
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
      <div className="my-2 rounded-xl bg-ink-950 text-ink-100 font-mono text-[13px] px-4 py-3 overflow-x-auto">
        {b.code}
      </div>
    );
  if (b.table)
    return (
      <div className="my-3 overflow-x-auto rounded-xl border border-ink-100">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-ink-50 text-left">
              {b.table.head.map((h, i) => (
                <th
                  key={i}
                  className="px-3.5 py-2.5 font-semibold text-ink-700 border-b border-ink-100"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-ink-50 last:border-0">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3.5 py-2.5 ${ci === 0 ? "font-medium text-ink-800" : "text-ink-600"}`}
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

  return (
    <div className="bg-white">
      {/* Header band */}
      <div className="border-b border-ink-100 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-white border border-brand-100 px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> Documentation
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-ink-900">
            Everything you need to run Botlify.
          </h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Set up your account, teach your AI, and automate your Instagram —
            step by step. Search below or browse the sidebar.
          </p>
          <div className="mt-5 relative max-w-lg">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the docs…"
              className="w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 py-10">
          <nav className="sticky top-24 space-y-6">
            {groups.map((g) => (
              <div key={g.group}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
                  {g.group}
                </p>
                <ul className="space-y-0.5">
                  {g.sections.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => jump(s.id)}
                        className={`block w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition ${
                          active === s.id && !q
                            ? "bg-brand-50 text-brand-700 font-semibold"
                            : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
                        }`}
                      >
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!groups.length && (
              <p className="text-sm text-ink-400">No matches.</p>
            )}
          </nav>
        </aside>

        {/* Mobile nav toggle */}
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="lg:hidden fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-brand-500 text-white shadow-lg grid place-items-center"
          aria-label="Table of contents"
        >
          {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {navOpen && (
          <div className="lg:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setNavOpen(false)}>
            <div
              className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {groups.map((g) => (
                <div key={g.group} className="mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
                    {g.group}
                  </p>
                  <ul className="space-y-0.5">
                    {g.sections.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => jump(s.id)}
                          className="block w-full text-left text-sm px-2.5 py-1.5 rounded-lg text-ink-600 hover:bg-ink-50"
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0 py-10 max-w-3xl">
          {visibleSections.length === 0 && (
            <div className="text-center py-20 text-ink-400">
              <p className="text-lg font-semibold text-ink-600">No results</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}
          {visibleSections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 mb-14 pb-14 border-b border-ink-100 last:border-0"
            >
              <h2 className="text-2xl font-black tracking-tight text-ink-900">
                {s.title}
              </h2>
              {s.summary && (
                <p className="mt-1 text-brand-600 font-medium">{s.summary}</p>
              )}
              <div className="mt-4 space-y-3">
                {s.blocks.map((b, i) => (
                  <Block key={i} b={b} />
                ))}
              </div>
            </section>
          ))}

          {/* CTA footer */}
          {!q && (
            <div className="rounded-2xl bg-ink-950 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-lg">Ready to automate your DMs?</p>
                <p className="text-ink-300 text-sm">
                  Start your 3-day free trial — live in minutes.
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition shrink-0"
              >
                Start free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
