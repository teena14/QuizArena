import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, ClipboardList, Timer, Target } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quiz Lobby" };

export default async function QuizLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const quiz = await prisma.quiz.findUnique({
    where: { id, isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      timeLimit: true,
      createdBy: { select: { name: true } },
      _count: { select: { questions: true } },
    },
  });

  if (!quiz) notFound();

  // Redirect if already attempted
  const existing = await prisma.quizAttempt.findUnique({
    where: { quizId_studentId: { quizId: id, studentId: userId } },
  });
  if (existing) redirect(`/quiz/${id}/results/${existing.id}`);

  const minutes = Math.floor(quiz.timeLimit / 60);
  const seconds = quiz.timeLimit % 60;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="glass rounded-3xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-brand flex items-center justify-center text-white">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{quiz.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">by {quiz.createdBy.name}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <ClipboardList className="w-6 h-6 mx-auto" />, label: "Questions", value: quiz._count.questions },
              { icon: <Timer className="w-6 h-6 mx-auto" />, label: "Time Limit", value: `${minutes}:${seconds.toString().padStart(2, "0")}` },
              { icon: <Target className="w-6 h-6 mx-auto" />, label: "Type", value: "MCQ" },
            ].map((s) => (
              <div key={s.label} className="bg-[#111111] rounded-xl p-3">
                <div className="mb-2 flex justify-center text-muted-foreground">{s.icon}</div>
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-foreground mb-2">Rules</p>
            {[
              "Each question has 4 options — only one is correct",
              "Timer counts down from the moment you start",
              "Quiz auto-submits when time runs out",
              "You can only attempt this quiz once",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                {rule}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link
              href="/student"
              className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-primary/40 transition-all"
            >
              ← Back
            </Link>
            <Link
              href={`/quiz/${id}/take`}
              className="flex-2 flex-grow py-3 px-8 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 transition-all duration-200"
            >
              Start Quiz →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
