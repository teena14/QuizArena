import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ClipboardList, BarChart, Timer, Trophy, Inbox, Medal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quiz Results" };

export default async function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const quiz = await prisma.quiz.findUnique({
    where: { id, createdById: userId },
    select: {
      title: true,
      timeLimit: true,
      _count: { select: { questions: true } },
      attempts: {
        orderBy: [{ score: "desc" }, { timeTaken: "asc" }],
        select: {
          id: true, score: true, totalQuestions: true, timeTaken: true, completedAt: true,
          student: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!quiz) notFound();

  type AttemptWithStudent = typeof quiz.attempts[0];
  const avgScore = quiz.attempts.length
    ? Math.round(quiz.attempts.reduce((s: number, a: AttemptWithStudent) => s + (a.score / a.totalQuestions) * 100, 0) / quiz.attempts.length)
    : 0;

  const medals = [
    <Medal key="1" className="w-5 h-5 text-yellow-500" />,
    <Medal key="2" className="w-5 h-5 text-slate-400" />,
    <Medal key="3" className="w-5 h-5 text-orange-600" />
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <Link href="/teacher/quizzes" className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground text-xl">←</Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Results & Leaderboard</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "Total Attempts", value: quiz.attempts.length, icon: <Users className="w-6 h-6" /> },
          { label: "Questions", value: quiz._count.questions, icon: <ClipboardList className="w-6 h-6" /> },
          { label: "Avg Score", value: `${avgScore}%`, icon: <BarChart className="w-6 h-6" /> },
          { label: "Time Limit", value: `${Math.floor(quiz.timeLimit / 60)}m`, icon: <Timer className="w-6 h-6" /> },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-5 text-center flex flex-col items-center">
            <div className="mb-2 text-muted-foreground">{s.icon}</div>
            <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
        </h2>

        {quiz.attempts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center flex flex-col items-center">
            <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No attempts yet</p>
            <p className="text-muted-foreground text-sm">Share the quiz link with your students to start.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Rank</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Student</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Score</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Percentage</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Time Taken</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {quiz.attempts.map((attempt: AttemptWithStudent, i: number) => {
                  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const mins = Math.floor(attempt.timeTaken / 60);
                  const secs = attempt.timeTaken % 60;
                  const initials = attempt.student.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr
                      key={attempt.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        i === 0 ? "bg-yellow-500/5" : i === 1 ? "bg-slate-500/5" : i === 2 ? "bg-orange-500/5" : ""
                      } hover:bg-muted/30`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center text-lg font-semibold text-muted-foreground">
                          {medals[i] ?? `#${i + 1}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{attempt.student.name}</p>
                            <p className="text-xs text-muted-foreground">{attempt.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {attempt.score}/{attempt.totalQuestions}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-yellow-400" : "text-rose-400"}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {mins}m {secs.toString().padStart(2, "0")}s
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(attempt.completedAt).toLocaleString()}
                      </td>
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
