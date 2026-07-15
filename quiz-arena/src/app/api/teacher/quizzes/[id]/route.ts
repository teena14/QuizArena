import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateQuizSchema } from "@/lib/validations";
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
    select: {
      id: true, title: true, description: true, timeLimit: true, isPublished: true,
      questions: { orderBy: { order: "asc" }, select: { id: true, text: true, options: true, correctIndex: true, order: true } }
    },
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
    const parsed = updateQuizSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const { title, description, timeLimit, isPublished, questions } = parsed.data;

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
            create: questions.map((q) => ({
              text: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
              order: q.order,
            })),
          },
        },
        select: {
          id: true, title: true, description: true, timeLimit: true, isPublished: true,
          questions: { select: { id: true, text: true, options: true, correctIndex: true, order: true } }
        },
      });
    });

    return NextResponse.json({ quiz });
  } catch {
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
