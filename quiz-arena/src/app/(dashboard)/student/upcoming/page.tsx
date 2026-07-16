import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudentView } from "@/components/student/StudentView";
import { SearchBar } from "@/components/shared/SearchBar";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Quizzes" };

export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await auth();
  const userId = (session?.user as { id: string; name: string }).id;

  const quizzes = await prisma.quiz.findMany({
    where: { 
      isPublished: true,
      createdBy: {
        students: { some: { id: userId } }
      },
      ...(q && {
        title: { contains: q, mode: "insensitive" }
      })
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true, timeLimit: true, createdAt: true, isPublished: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: userId },
        select: { id: true, score: true, totalQuestions: true, timeTaken: true },
        take: 1,
      },
    },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Upcoming Quizzes</h1>
        </div>
        <SearchBar placeholder="Search quizzes..." />
      </div>

      {/* Quiz Upcoming View */}
      <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <StudentView quizzes={quizzes} view="upcoming" searchQuery={q} />
      </div>
    </div>
  );
}
