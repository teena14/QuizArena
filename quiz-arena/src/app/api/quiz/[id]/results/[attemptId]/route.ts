// GET /api/quiz/[id]/results/[attemptId] — detailed results for a student's attempt
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const { id, attemptId } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId, studentId: userId, quizId: id },
    select: {
      id: true, score: true, totalQuestions: true, timeTaken: true, completedAt: true,
      quiz: { select: { title: true, timeLimit: true } },
      answers: {
        select: {
          id: true, selectedIndex: true,
          question: { select: { text: true, options: true, correctIndex: true, order: true } },
        },
        orderBy: { question: { order: "asc" } },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

  return NextResponse.json({ attempt });
}
