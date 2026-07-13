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
    where: { id, createdById: userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz) notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <EditQuizClient quiz={quiz} />
    </div>
  );
}
