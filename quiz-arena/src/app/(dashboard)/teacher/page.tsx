import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Link from "next/link";
import { FileText, CheckCircle2, Target } from "lucide-react";
import { QuizActionsMenu } from "@/components/teacher/QuizActionsMenu";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Teacher Dashboard" };

export default async function TeacherDashboard() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  let teacher = await prisma.user.findUnique({ where: { id: userId } });
  if (!teacher?.classCode) {
    const newCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    teacher = await prisma.user.update({
      where: { id: userId },
      data: { classCode: newCode },
    });
  }

  const [totalQuizzes, publishedQuizzes, totalAttempts, recentQuizzes] = await Promise.all([
    prisma.quiz.count({ where: { createdById: userId } }),
    prisma.quiz.count({ where: { createdById: userId, isPublished: true } }),
    prisma.quizAttempt.count({ where: { quiz: { createdById: userId } } }),
    prisma.quiz.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, title: true, timeLimit: true, isPublished: true,
        _count: { select: { questions: true, attempts: true } }
      }
    }),
  ]);

  const stats = [
    { label: "Total Quizzes", value: totalQuizzes, icon: <FileText className="w-8 h-8" />, color: "from-violet-500/20 to-violet-500/5 border-violet-500/30" },
    { label: "Published", value: publishedQuizzes, icon: <CheckCircle2 className="w-8 h-8" />, color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30" },
    { label: "Total Attempts", value: totalAttempts, icon: <Target className="w-8 h-8" />, color: "from-sky-500/20 to-sky-500/5 border-sky-500/30" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your quizzes and track student performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border border-primary/20">
            <span className="text-sm font-medium text-muted-foreground">Class Code:</span>
            <span className="font-mono font-bold text-primary tracking-widest text-lg">{teacher?.classCode}</span>
          </div>
          <Link
            href="/teacher/quizzes/new"
            className="px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all duration-200"
          >
            + New Quiz
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`glass rounded-2xl p-6 bg-gradient-to-br ${s.color} animate-fade-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-extrabold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Quizzes */}
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Quizzes</h2>
          <Link href="/teacher/quizzes" className="text-sm text-primary hover:underline">View all →</Link>
        </div>

        {recentQuizzes.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4 text-muted-foreground"><FileText className="w-12 h-12" /></div>
            <p className="text-lg font-semibold text-foreground mb-2">No quizzes yet</p>
            <p className="text-muted-foreground text-sm mb-6">Create your first quiz and start engaging your students</p>
            <Link
              href="/teacher/quizzes/new"
              className="inline-block px-6 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition"
            >
              Create First Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuizzes.map((quiz: typeof recentQuizzes[0], i: number) => (
              <div
                key={quiz.id}
                className="glass rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${0.35 + i * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {quiz.title[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quiz._count.questions} questions · {quiz._count.attempts} attempts ·{" "}
                      {Math.floor(quiz.timeLimit / 60)} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    quiz.isPublished
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {quiz.isPublished ? "Published" : "Draft"}
                  </span>
                  <QuizActionsMenu quizId={quiz.id} isPublished={quiz.isPublished} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
