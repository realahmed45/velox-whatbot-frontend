import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { reportError } from "@/utils/errorMonitor";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // A stale-deploy chunk 404 that slipped past lazyWithRetry — reload once
    // (guarded) instead of showing the error screen.
    const isChunkError =
      /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk/i.test(
        error?.message || "",
      );
    if (isChunkError && !sessionStorage.getItem("botlify_chunk_reload")) {
      sessionStorage.setItem("botlify_chunk_reload", "1");
      window.location.reload();
      return;
    }
    reportError(error, { componentStack: info?.componentStack });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden p-6" style={{ background: "var(--canvas)" }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sunset-gold/25 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sunset-magenta/20 blur-[100px]" />
          <div className="absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        </div>
        <div className="glass-strong relative max-w-md rounded-3xl p-8 text-center animate-pop-in">
          <div className="relative mx-auto mb-5 h-14 w-14">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-rose-400/30 blur-2xl" />
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-sunset-magenta shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_28px_-10px_rgba(225,29,72,0.6)]">
              <AlertTriangle className="h-7 w-7 text-white" strokeWidth={1.8} />
            </div>
          </div>
          <h1 className="mb-1.5 font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">
            Something broke
          </h1>
          <p className="text-sm text-ink-500 mb-5">
            The page hit an unexpected error. Try reloading — if it persists,
            our team will see it.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mb-4 max-h-40 overflow-auto rounded-xl bg-night-900 p-3 text-left font-mono text-[11px] text-rose-200">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload page
            </button>
            <button onClick={this.reset} className="btn-secondary">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
