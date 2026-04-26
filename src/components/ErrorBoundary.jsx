import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50">
        <div className="card max-w-md text-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-ink-900 mb-1">
            Something broke
          </h1>
          <p className="text-sm text-ink-500 mb-5">
            The page hit an unexpected error. Try reloading — if it persists,
            our team will see it.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-[11px] text-left bg-ink-100 text-ink-700 p-2 rounded mb-4 overflow-auto max-h-40">
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
