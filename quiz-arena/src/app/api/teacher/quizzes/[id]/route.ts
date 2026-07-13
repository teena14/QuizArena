import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/teacher/quizzes/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { id, createdById: userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ quiz });
}

// PUT /api/teacher/quizzes/[id] — update quiz + replace questions
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.quiz.findUnique({ where: { id, createdById: userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { title, description, timeLimit, isPublished, questions } = await req.json();

    // Replace questions atomically
    const quiz = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      await tx.question.deleteMany({ where: { quizId: id } });
      return tx.quiz.update({
        where: { id },
        data: {
          title: title?.trim() || existing.title,
          description: description?.trim() || null,
          timeLimit: timeLimit || existing.timeLimit,
          isPublished: isPublished ?? existing.isPublished,
          questions: {
            create: (questions || []).map((q: { text: string; options: string[]; correctIndex: number; order: number }) => ({
              text: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
              order: q.order,
            })),
          },
        },
        include: { questions: true },
      });
    });

    return NextResponse.json({ quiz });
  } catch (err) {
    console.error("[PUT /api/teacher/quizzes/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/teacher/quizzes/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.quiz.findUnique({ where: { id, createdById: userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
