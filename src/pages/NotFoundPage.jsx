/**
 * 404 Not Found page (used as catch-all).
 * Shown for both authenticated and unauthenticated users.
 */
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-violet-50/30 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-black bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Page not found</h1>
        <p className="text-sm text-ink-500 mb-6">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ink-200 hover:bg-ink-50 text-sm font-medium text-ink-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
