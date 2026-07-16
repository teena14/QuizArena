import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditQuizClient } from "@/components/teacher/EditQuizClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Quiz" };

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const quiz = await prisma.quiz.findUnique({
    where: { id, createdById: userId, deletedAt: null },
    select: {
      id: true, title: true, description: true, timeLimit: true, isPublished: true,
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, text: true, options: true, correctIndex: true, order: true }
      }
    },
  });

  if (!quiz) notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <EditQuizClient quiz={{ ...quiz, createdBy: { id: "1", name: "You" }, attempts: [] }} />
    </div>
  );
}
