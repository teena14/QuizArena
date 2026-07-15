import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateQuizSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET /api/teacher/quizzes — list teacher's quizzes
export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quizzes = await prisma.quiz.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true, timeLimit: true, isPublished: true, createdAt: true, updatedAt: true,
      _count: { select: { questions: true, attempts: true } }
    },
  });
  return NextResponse.json({ quizzes });
}

// POST /api/teacher/quizzes — create quiz with questions
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const parsed = updateQuizSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const { title, description, timeLimit, isPublished, questions } = parsed.data;
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const quiz = await prisma.quiz.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        timeLimit: timeLimit || 600,
        isPublished: isPublished ?? false,
        createdById: userId,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            order: q.order,
          })),
        },
      },
      select: {
        id: true, title: true, description: true, timeLimit: true, isPublished: true, createdAt: true, updatedAt: true,
        questions: { select: { id: true, text: true, options: true, correctIndex: true, order: true } },
        _count: { select: { questions: true } }
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
