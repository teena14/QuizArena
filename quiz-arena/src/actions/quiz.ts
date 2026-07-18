"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateQuizSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function createQuizAction(data: z.infer<typeof updateQuizSchema>) {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  const parsed = updateQuizSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid data");
  
  const { title, description, timeLimit, isPublished, questions } = parsed.data;
  if (!title?.trim()) throw new Error("Title is required");

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
      id: true,
    },
  });

  revalidatePath("/teacher/quizzes");
  return { success: true, quizId: quiz.id };
}

export async function updateQuizAction(id: string, data: z.infer<typeof updateQuizSchema>) {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  const existing = await prisma.quiz.findUnique({ where: { id, createdById: userId, deletedAt: null } });
  if (!existing) throw new Error("Not found");

  const parsed = updateQuizSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid data");
  
  const { title, description, timeLimit, isPublished, questions } = parsed.data;

  // Replace questions atomically
  await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    if (existing.isPublished && isPublished === false) {
      await tx.quizAttempt.deleteMany({ where: { quizId: id } });
    }
    
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
    });
  });

  revalidatePath("/teacher/quizzes");
  return { success: true };
}

export async function deleteQuizAction(id: string) {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  const existing = await prisma.quiz.findUnique({ where: { id, createdById: userId, deletedAt: null } });
  if (!existing) throw new Error("Not found");

  // Hard Delete
  await prisma.quiz.delete({
    where: { id }
  });
  
  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: "HARD_DELETE_QUIZ",
      resource: "Quiz",
      details: JSON.stringify({ quizId: id, title: existing.title })
    }
  });

  revalidatePath("/teacher/quizzes");
  return { success: true };
}
