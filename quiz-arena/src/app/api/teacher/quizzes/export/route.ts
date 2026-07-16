import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as { id: string; role: string })?.id;
    const role = (session?.user as { role: string })?.role;

    if (!userId || role !== "TEACHER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    const quizzesQuery = {
      where: {
        createdById: userId,
        deletedAt: null,
        ...(quizId && { id: quizId }),
      },
      include: {
        attempts: {
          include: { student: { select: { name: true, email: true } } },
        },
      },
    };

    const quizzes = await prisma.quiz.findMany(quizzesQuery);

    if (quizzes.length === 0) {
      return new NextResponse("No quizzes found", { status: 404 });
    }

    // Set headers for streaming CSV download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set(
      "Content-Disposition",
      `attachment; filename="quiz_export_${new Date().toISOString().split("T")[0]}.csv"`
    );

    // Stream CSV data
    const stream = new ReadableStream({
      start(controller) {
        // CSV Header
        controller.enqueue("Quiz Title,Student Name,Student Email,Score,Total Questions,Time Taken (s),Completed At\n");

        for (const quiz of quizzes) {
          for (const attempt of quiz.attempts) {
            const row = [
              `"${quiz.title.replace(/"/g, '""')}"`,
              `"${attempt.student.name.replace(/"/g, '""')}"`,
              `"${attempt.student.email}"`,
              attempt.score,
              attempt.totalQuestions,
              attempt.timeTaken,
              `"${new Date(attempt.completedAt).toISOString()}"`,
            ].join(",");

            controller.enqueue(row + "\n");
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
