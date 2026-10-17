import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { OiOLogo } from "./OiOLogo";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.hash = "#home";
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <OiOLogo size="md" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold">
                Something didn't load right
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                The academy platform encountered a temporary display issue. Click below to refresh your view.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface)] transition-all"
              >
                <Home className="w-4 h-4 text-[var(--accent-orange)]" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
