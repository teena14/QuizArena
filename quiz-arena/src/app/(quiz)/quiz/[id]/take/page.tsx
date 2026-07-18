"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  options: string[];
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
}

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quizId, setQuizId] = useState<string>("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startTime = useRef<number>(0);
  const submitted = useRef(false);

  // Resolve params
  useEffect(() => {
    params.then(({ id }) => setQuizId(id));
  }, [params]);

  useEffect(() => {
    if (startTime.current === 0) startTime.current = Date.now();
  }, []);

  // Fetch quiz
  useEffect(() => {
    if (!quizId) return;
    fetch(`/api/quiz/${quizId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); router.push("/student"); return; }
        setQuiz(d.quiz);
        setTimeLeft(d.quiz.timeLimit);
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load quiz"); router.push("/student"); });
  }, [quizId, router]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitted.current || !quiz) return;
    submitted.current = true;
    setSubmitting(true);

    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken }),
      });
      const data = await res.json();
      if (res.status === 409) {
        // Already attempted
        toast.info("Already attempted — redirecting to results");
        router.push(`/quiz/${quiz.id}/results/${data.attemptId}`);
        return;
      }
      if (!res.ok) { toast.error(data.error || "Submission failed"); submitted.current = false; setSubmitting(false); return; }

      if (auto) toast.warning("Time's up! Quiz auto-submitted.");
      else toast.success("Quiz submitted!");

      router.push(`/quiz/${quiz.id}/results/${data.attemptId}`);
    } catch {
      toast.error("Failed to submit — check your connection");
      submitted.current = false;
      setSubmitting(false);
    }
  }, [quiz, answers, router]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || loading) return;
    if (timeLeft <= 0) {
      setTimeout(() => handleSubmit(true), 0);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimeout(() => handleSubmit(true), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, loading, handleSubmit, timeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const q = quiz.questions[currentIdx];
  const answered = Object.keys(answers).length;
  const total = quiz.questions.length;
  const isUrgent = timeLeft <= 30;
  const isWarning = timeLeft <= 60 && timeLeft > 30;
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top Bar ─── */}
      <header className={`sticky top-0 z-50 border-b border-border transition-colors duration-500 ${
        isUrgent ? "bg-rose-950/90" : "glass"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-xs">Q</div>
            <span className="font-semibold text-foreground text-sm truncate max-w-[200px]">{quiz.title}</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-all duration-300 ${
            isUrgent
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-muted text-foreground border border-border"
          }`}>
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      {/* ── Main Content ─── */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Question Navigator Sidebar */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="glass rounded-xl p-4 sticky top-20">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              Questions ({answered}/{total})
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {quiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    i === currentIdx
                      ? "gradient-brand text-white scale-110"
                      : answers[quiz.questions[i].id] !== undefined
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Question Area */}
        <div className="flex-1 space-y-6 animate-fade-in" key={q.id}>
          <div className="glass rounded-2xl p-6">
            {/* Question header */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Question {currentIdx + 1} of {total}
              </span>
              {answers[q.id] !== undefined && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  ✓ Answered
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground mb-6 leading-relaxed">{q.text}</h2>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[q.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oIdx }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group ${
                      isSelected
                        ? "gradient-brand border-primary/50 scale-[1.01]"
                        : "bg-muted border-border hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      isSelected ? "bg-white/20 text-white" : "bg-background text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {optionLabels[oIdx]}
                    </span>
                    <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-foreground"}`}>
                      {opt}
                    </span>
                    {isSelected && <span className="ml-auto text-white">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 transition-all"
            >
              ← Previous
            </button>

            <span className="text-sm text-muted-foreground">{answered} of {total} answered</span>

            {currentIdx < total - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
                className="px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Submit Quiz →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm Dialog ─── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 animate-fade-in text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Submit Quiz?</h3>
            <p className="text-muted-foreground text-sm mb-2">
              You&apos;ve answered <span className="text-foreground font-semibold">{answered}</span> of <span className="text-foreground font-semibold">{total}</span> questions.
            </p>
            {answered < total && (
              <p className="text-amber-400 text-xs mb-4">
                {total - answered} unanswered question{total - answered !== 1 ? "s" : ""} will count as wrong.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all"
              >
                Keep Going
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSubmit(false); }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {submitting ? "Submitting…" : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
