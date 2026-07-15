import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { joinClassSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = joinClassSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { classCode } = parsed.data;

    const studentId = (session.user as { id: string }).id;

    const teacher = await prisma.user.findUnique({
      where: { classCode },
      select: { id: true, name: true, role: true },
    });

    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Invalid class code" }, { status: 404 });
    }

    // Connect the student to the teacher
    await prisma.user.update({
      where: { id: studentId },
      data: {
        teachers: {
          connect: { id: teacher.id },
        },
      },
    });

    return NextResponse.json({ success: true, teacherName: teacher.name });
  } catch {
    return NextResponse.json(
      { error: "Failed to join class" },
      { status: 500 }
    );
  }
}
