// GET /api/student/quizzes — list all published quizzes with student's attempt data
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true, timeLimit: true, createdAt: true,
      createdBy: { select: { name: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: userId },
        select: { id: true, score: true, totalQuestions: true, timeTaken: true, completedAt: true },
        take: 1,
      },
    },
  });

  return NextResponse.json({ quizzes });
}
