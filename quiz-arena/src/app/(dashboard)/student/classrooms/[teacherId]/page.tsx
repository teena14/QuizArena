import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClassroomTabs } from "@/components/student/ClassroomTabs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Classroom" };

export default async function ClassroomDetailsPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id: string; name: string }).id;
  const { teacherId } = await params;

  const teacher = await prisma.user.findUnique({
    where: { id: teacherId, role: "TEACHER" }
  });

  if (!teacher) {
    notFound();
  }

  const quizzes = await prisma.quiz.findMany({
    where: { 
      isPublished: true,
      createdById: teacherId,
      createdBy: {
        students: { some: { id: userId } }
      }
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true, timeLimit: true, createdAt: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: userId },
        select: { id: true, score: true, totalQuestions: true, timeTaken: true },
        take: 1,
      },
    },
  });

  const pendingQuizzes = quizzes.filter(q => q.attempts.length === 0);
  const attemptedQuizzes = quizzes.filter(q => q.attempts.length > 0);

  return (
    <div className="p-8 space-y-8">
      <div className="animate-fade-in">
        <Link
          href="/student/classrooms"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Classrooms
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-lg">
            {teacher.name[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{teacher.name}&apos;s Class</h1>
        </div>
      </div>

      <ClassroomTabs pendingQuizzes={pendingQuizzes} attemptedQuizzes={attemptedQuizzes} />
    </div>
  );
}
