"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getScoreColor, getScoreGrade } from "@/lib/utils";

interface Answer {
  selectedIndex: number;
  question: {
    text: string;
    options: string[];
    correctIndex: number;
    order: number;
  };
}

interface AttemptResult {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  quiz: { title: string };
  answers: Answer[];
}

interface LeaderboardEntry {
  id: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  student: { name: string };
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"breakdown" | "leaderboard">("breakdown");

  useEffect(() => {
    Promise.all([
      fetch(`/api/quiz/${quizId}/results/${attemptId}`).then((r) => r.json()),
      fetch(`/api/quiz/${quizId}/leaderboard`).then((r) => r.json()),
    ])
      .then(([r, lb]) => {
        if (r.error) { router.push("/student"); return; }
        setResult(r.attempt);
        setLeaderboard(lb.attempts || []);
        setLoading(false);
      })
      .catch(() => router.push("/student"));
  }, [quizId, attemptId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) return null;

  const pct = Math.round((result.score / result.totalQuestions) * 100);
  const grade = getScoreGrade(pct);
  const scoreColor = getScoreColor(pct);
  const mins = Math.floor(result.timeTaken / 60);
  const secs = result.timeTaken % 60;
  const optionLabels = ["A", "B", "C", "D"];

  const correct = result.answers.filter((a) => a.selectedIndex === a.question.correctIndex).length;
  const wrong = result.answers.filter((a) => a.selectedIndex !== -1 && a.selectedIndex !== a.question.correctIndex).length;
  const skipped = result.answers.filter((a) => a.selectedIndex === -1).length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Score Card */}
        <div className="glass rounded-3xl p-8 text-center animate-fade-in relative">
          <Link href="/student" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2 mt-2">{result.quiz.title}</h1>
          <p className="text-muted-foreground text-sm mb-8">Quiz Complete!</p>

          {/* Circular Score */}
          <div className="relative w-40 h-40 mx-auto mb-6 animate-count-up">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                strokeWidth="8"
                strokeDasharray={`${(pct / 100) * 251.2} 251.2`}
                stroke={pct >= 80 ? "var(--color-success)" : pct >= 60 ? "var(--color-primary)" : "var(--color-destructive)"}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold ${scoreColor}`}>{pct}%</span>
              <span className="text-lg font-bold text-muted-foreground">{grade}</span>
            </div>
          </div>

          <div className="text-3xl font-extrabold text-foreground mb-1">
            {result.score}/{result.totalQuestions}
          </div>
          <p className="text-muted-foreground text-sm">Completed in {mins}m {secs.toString().padStart(2, "0")}s</p>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-emerald-400">{correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-rose-400">{wrong}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div className="bg-muted border border-border rounded-xl p-3">
              <div className="text-2xl font-bold text-muted-foreground">{skipped}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1.5 flex animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {(["breakdown", "leaderboard"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                tab === t ? "gradient-brand text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "breakdown" ? "Answer Breakdown" : "Leaderboard"}
            </button>
          ))}
        </div>

        {/* Breakdown */}
        {tab === "breakdown" && (
          <div className="space-y-4 animate-fade-in">
            {result.answers.map((a, i) => {
              const isCorrect = a.selectedIndex === a.question.correctIndex;
              const isSkipped = a.selectedIndex === -1;
              return (
                <div
                  key={i}
                  className={`glass rounded-xl p-5 border-l-4 ${
                    isCorrect ? "border-emerald-500" : isSkipped ? "border-muted-foreground" : "border-rose-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Q{i + 1}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isCorrect ? "bg-emerald-500/15 text-emerald-400" :
                      isSkipped ? "bg-muted text-muted-foreground" :
                      "bg-rose-500/15 text-rose-400"
                    }`}>
                      {isCorrect ? "✓ Correct" : isSkipped ? "— Skipped" : "✗ Wrong"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-3">{a.question.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {a.question.options.map((opt, oIdx) => {
                      const isSelected = oIdx === a.selectedIndex;
                      const isAnswerCorrect = oIdx === a.question.correctIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all ${
                            isAnswerCorrect ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : isSelected ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                            : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <span className="font-bold w-5 flex-shrink-0">{optionLabels[oIdx]}</span>
                          <span>{opt}</span>
                          {isAnswerCorrect && <span className="ml-auto">✓</span>}
                          {isSelected && !isAnswerCorrect && <span className="ml-auto">✗</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <div className="glass rounded-2xl overflow-hidden animate-fade-in">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Rank</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Student</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Score</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">%</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => {
                  const entryPct = Math.round((entry.score / entry.totalQuestions) * 100);
                  const m = Math.floor(entry.timeTaken / 60);
                  const s = entry.timeTaken % 60;
                  const initials = entry.student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={entry.id} className={`border-b border-border last:border-0 ${i === 0 ? "bg-yellow-500/5" : i === 1 ? "bg-slate-500/5" : i === 2 ? "bg-orange-500/5" : ""} hover:bg-muted/30 transition-colors`}>
                      <td className="px-6 py-4 text-lg">#{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs">{initials}</div>
                          <span className="font-medium text-foreground">{entry.student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{entry.score}/{entry.totalQuestions}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${entryPct >= 80 ? "text-emerald-400" : entryPct >= 60 ? "text-yellow-400" : "text-rose-400"}`}>{entryPct}%</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{m}m {s.toString().padStart(2, "0")}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
