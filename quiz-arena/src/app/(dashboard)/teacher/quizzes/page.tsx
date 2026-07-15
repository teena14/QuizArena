import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QuizActionsMenu } from "@/components/teacher/QuizActionsMenu";
import { DeleteQuizButton } from "@/components/teacher/DeleteQuizButton";
import { Inbox, ListChecks, Clock, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Quizzes" };

export default async function QuizzesPage() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const quizzes = await prisma.quiz.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true, timeLimit: true, isPublished: true, createdAt: true,
      _count: { select: { questions: true, attempts: true } }
    },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} total</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/teacher/quizzes/new"
            className="px-6 py-3 rounded-full gradient-brand text-white font-bold text-sm hover:opacity-90 transition-all duration-200"
          >
            Create Quiz
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center animate-fade-in flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-5 text-muted-foreground">
            <Inbox className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No quizzes yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">Start building your first quiz!</p>
          <Link href="/teacher/quizzes/new" className="inline-block px-6 py-2.5 rounded-full gradient-brand text-white font-semibold text-sm hover:opacity-90 transition">
            Create Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: typeof quizzes[0], i: number) => (
            <div
              key={quiz.id}
              className="glass rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-all duration-200 group animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {quiz.title[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">{quiz.title}</p>
                  {quiz.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md truncate">{quiz.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {quiz._count.questions} questions</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.floor(quiz.timeLimit / 60)} min</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {quiz._count.attempts} attempts</span>
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  quiz.isPublished
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {quiz.isPublished ? "● Published" : "○ Draft"}
                </span>
                {quiz.isPublished ? (
                  <Link
                    href={`/teacher/quizzes/${quiz.id}/results`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    Results
                  </Link>
                ) : (
                  <DeleteQuizButton quizId={quiz.id} />
                )}
                <Link
                  href={`/teacher/quizzes/${quiz.id}/edit`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                >
                  Edit
                </Link>
                <QuizActionsMenu quizId={quiz.id} isPublished={quiz.isPublished} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
