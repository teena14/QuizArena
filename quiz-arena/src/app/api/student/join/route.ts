import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classCode } = await req.json();
    if (!classCode) {
      return NextResponse.json({ error: "Class code is required" }, { status: 400 });
    }

    const studentId = (session.user as { id: string }).id;

    // Find the teacher with this class code
    const teacher = await prisma.user.findUnique({
      where: { classCode: classCode.toUpperCase() },
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
  } catch (error: any) {
    console.error("Join Class Error:", error);
    return NextResponse.json(
      { error: "Failed to join class" },
      { status: 500 }
    );
  }
}
