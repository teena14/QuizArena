// POST /api/quiz/[id]/submit — server-side auto-grading
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { submitQuizSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prevent re-attempt
  const existing = await prisma.quizAttempt.findUnique({
    where: { quizId_studentId: { quizId: id, studentId: userId } },
  });
  if (existing) return NextResponse.json({ error: "Already attempted", attemptId: existing.id }, { status: 409 });

  const parsed = submitQuizSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  }
  const { answers, timeTaken } = parsed.data;

  // Fetch questions with correct answers (server-side only)
  const questions = await prisma.question.findMany({
    where: { quizId: id },
    select: { id: true, correctIndex: true },
  });

  if (questions.length === 0) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  // Grade answers
  let score = 0;
  const answerRecords = questions.map((q) => {
    const selected = answers[q.id] ?? -1; // -1 = unanswered
    if (selected === q.correctIndex) score++;
    return { questionId: q.id, selectedIndex: selected };
  });

  // Save attempt + answers in one transaction
  const attempt = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    const att = await tx.quizAttempt.create({
      data: {
        quizId: id,
        studentId: userId,
        score,
        totalQuestions: questions.length,
        timeTaken: timeTaken || 0,
        answers: {
          create: answerRecords,
        },
      },
    });
    return att;
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score,
    totalQuestions: questions.length,
    percentage: Math.round((score / questions.length) * 100),
  });
}
