import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudentView } from "@/components/student/StudentView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Quizzes" };

export default async function StudentDashboard() {
  const session = await auth();
  const userId = (session?.user as { id: string; name: string }).id;

  const quizzes = await prisma.quiz.findMany({
    where: { 
      isPublished: true,
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

  return (
    <div className="p-8 space-y-8">
      {/* Quiz Upcoming View */}
      <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <StudentView quizzes={quizzes} view="upcoming" />
      </div>
    </div>
  );
}
