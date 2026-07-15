// GET /api/quiz/[id] — returns quiz with questions (options only, NO correct answers)
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { id, isPublished: true },
    select: {
      id: true, title: true, description: true, timeLimit: true,
      createdBy: { select: { name: true } },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          options: true,
          order: true,
          // ❌ correctIndex intentionally excluded — server-side only
        },
      },
      _count: { select: { questions: true } },
    },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  return NextResponse.json({ quiz });
}
