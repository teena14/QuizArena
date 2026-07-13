// GET /api/quiz/[id]/leaderboard — top 10 attempts for a quiz
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId: id },
    orderBy: [{ score: "desc" }, { timeTaken: "asc" }],
    take: 10,
    include: { student: { select: { name: true } } },
  });

  return NextResponse.json({ attempts });
}
