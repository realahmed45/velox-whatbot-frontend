import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function PublicBioPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/public/bio/${slug}`)
      .then(({ data }) => setPage(data.page))
      .catch(() => setNotFound(true));
  }, [slug]);

  const clickLink = (link) => {
    // fire-and-forget
    axios
      .post(`${API_URL}/public/bio/${slug}/click/${link._id}`)
      .catch(() => {});
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ink-900">404</h1>
          <p className="text-ink-500 mt-2">This page doesn't exist.</p>
          <a
            href="/"
            className="text-brand-600 hover:underline mt-4 inline-block"
          >
            ← Go home
          </a>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="animate-pulse text-ink-400">Loading…</div>
      </div>
    );
  }

  const themeClasses = {
    dark: "bg-ink-900 text-white",
    light: "bg-white text-ink-900",
    brand: "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
    gradient:
      "bg-gradient-to-br from-brand-500 via-pink-500 to-orange-500 text-white",
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${themeClasses[page.theme] || themeClasses.brand}`}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {page.avatarUrl ? (
            <img
              src={page.avatarUrl}
              alt={page.displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold mb-4">
              {(page.displayName || page.slug)[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold">
            {page.displayName || `@${page.slug}`}
          </h1>
          {page.bio && (
            <p className="text-sm opacity-80 mt-2 max-w-xs">{page.bio}</p>
          )}

          <div className="w-full mt-8 space-y-3">
            {page.links.map((link) => (
              <button
                key={link._id}
                onClick={() => clickLink(link)}
                className="w-full py-4 px-6 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 hover:scale-[1.02] text-center font-semibold transition-all shadow-lg"
                style={
                  page.theme === "light"
                    ? {
                        background: (page.accentColor || "#6366f1") + "15",
                        color: page.accentColor || "#6366f1",
                        border: `1px solid ${page.accentColor || "#6366f1"}30`,
                      }
                    : {}
                }
              >
                {link.title}
              </button>
            ))}
          </div>

          <a
            href="https://botlify.site"
            className="text-xs opacity-50 mt-10 hover:opacity-100 transition"
          >
            ⚡ Powered by Botlify
          </a>
        </div>
      </div>
    </div>
  );
}
