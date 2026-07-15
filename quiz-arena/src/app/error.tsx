"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Global error boundary — catches unhandled errors in the React tree.
 * Must be a Client Component (Next.js requirement).
 * Renders in place of the crashed subtree without a full page reload.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative z-10 max-w-md w-full animate-fade-in">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-12" aria-label="Go to QuizArena home">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold text-lg" aria-hidden="true">Q</div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            Quiz<span className="text-orange-500">Arena</span>
          </span>
        </Link>

        {/* Error icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-4xl" aria-hidden="true">
          ⚠
        </div>

        <h1 className="text-2xl font-bold font-host text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          An unexpected error occurred. Try refreshing — if it keeps happening,{" "}
          <a
            href="https://github.com/your-username/quiz-arena/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            report it on GitHub
          </a>
          .
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono mb-8">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:text-white hover:border-primary/40 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
