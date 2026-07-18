// PATCH /api/teacher/quizzes/[id]/publish — toggle published status
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.quiz.findUnique({ where: { id, createdById: userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Ensure quiz has questions before publishing
  if (!existing.isPublished) {
    const count = await prisma.question.count({ where: { quizId: id } });
    if (count === 0) return NextResponse.json({ error: "Add at least one question before publishing" }, { status: 400 });
  }

  const newPublishedStatus = !existing.isPublished;

  const quiz = await prisma.$transaction(async (tx) => {
    if (!newPublishedStatus) {
      await tx.quizAttempt.deleteMany({ where: { quizId: id } });
    }
    return tx.quiz.update({
      where: { id },
      data: { isPublished: newPublishedStatus },
    });
  });

  return NextResponse.json({ quiz });
}
