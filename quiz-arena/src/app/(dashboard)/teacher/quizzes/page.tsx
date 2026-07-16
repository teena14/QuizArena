import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QuizActionsMenu } from "@/components/teacher/QuizActionsMenu";
import { QuizFilters } from "@/components/teacher/QuizFilters";
import { Inbox, ListChecks, Clock, Users, SearchX, ChevronRight, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Quizzes" };

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; cursor?: string }>;
}) {
  const { q = "", sort = "desc", cursor } = await searchParams;
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const take = 25;

  const quizzes = await prisma.quiz.findMany({
    take: take + 1, // Fetch one extra to check for next page
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    where: { 
      createdById: userId,
      deletedAt: null, // Enforce soft-delete exclusion
      ...(q && {
        title: { contains: q, mode: "insensitive" }
      })
    },
    orderBy: [
      { createdAt: sort === "asc" ? "asc" : "desc" },
      { id: "asc" } // stable secondary sort
    ],
    select: {
      id: true, title: true, description: true, timeLimit: true, isPublished: true, createdAt: true,
      _count: { select: { questions: true, attempts: true } }
    },
  });

  const hasNextPage = quizzes.length > take;
  const displayedQuizzes = hasNextPage ? quizzes.slice(0, take) : quizzes;
  const nextCursor = hasNextPage ? quizzes[take].id : null;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">Manage your created quizzes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          <QuizFilters />
          <Link
            href="/teacher/quizzes/new"
            className="flex-shrink-0 px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 transition-all duration-200"
          >
            Create Quiz
          </Link>
        </div>
      </div>

      {displayedQuizzes.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center animate-fade-in flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-5 text-muted-foreground">
            {q ? <SearchX className="w-8 h-8" /> : <Inbox className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {q ? "No matches found" : "No quizzes yet"}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {q ? `No quizzes matching "${q}".` : "Start building your first quiz!"}
          </p>
          {q ? (
            <Link href="/teacher/quizzes" className="inline-block px-6 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:border-primary/40 transition">
              Clear Search
            </Link>
          ) : (
            <Link href="/teacher/quizzes/new" className="inline-block px-6 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition">
              Create Quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4">
            {displayedQuizzes.map((quiz, i: number) => (
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
                  <QuizActionsMenu quizId={quiz.id} isPublished={quiz.isPublished} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {(cursor || hasNextPage) && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Link
                href={cursor ? `/teacher/quizzes?q=${q}&sort=${sort}` : "#"}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                  cursor ? "text-foreground hover:bg-muted" : "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Link>
              
              <span className="text-xs text-muted-foreground">
                Page {cursor ? "2+" : "1"}
              </span>

              <Link
                href={hasNextPage ? `/teacher/quizzes?q=${q}&sort=${sort}&cursor=${nextCursor}` : "#"}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                  hasNextPage ? "text-foreground hover:bg-muted" : "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none"
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
