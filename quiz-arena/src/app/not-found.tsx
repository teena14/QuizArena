import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | QuizArena",
  description: "The page you're looking for doesn't exist. Head back to QuizArena to find your quizzes.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full animate-fade-in">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-12" aria-label="Go to QuizArena home">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold text-lg" aria-hidden="true">Q</div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            Quiz<span className="text-orange-500">Arena</span>
          </span>
        </Link>

        {/* 404 number */}
        <div
          className="text-[10rem] leading-none font-extrabold font-host tracking-tighter select-none mb-2"
          style={{
            background: "linear-gradient(135deg, #FF7F12 0%, #FF7F1250 60%, #55555540 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="text-2xl font-bold font-host text-white mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-10">
          The page you&apos;re looking for might have been moved, deleted, or this URL doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm transition-opacity hover:opacity-90"
          >
            Back to Home
          </Link>
          <Link
            href="/student"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:text-white hover:border-primary/40 transition-all"
          >
            My Dashboard
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-[#222222] flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  );
}
