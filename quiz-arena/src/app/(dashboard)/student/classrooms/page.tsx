import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Target, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Classrooms" };

export default async function ClassroomsPage() {
  const session = await auth();
  const userId = (session?.user as { id: string; name: string }).id;

  const quizzes = await prisma.quiz.findMany({
    where: { 
      isPublished: true,
      createdBy: {
        students: { some: { id: userId } }
      }
    },
    select: {
      id: true,
      createdBy: { select: { id: true, name: true } },
      attempts: {
        where: { studentId: userId },
        select: { id: true },
        take: 1,
      },
    },
  });

  const teachersMap = new Map<string, { id: string; name: string; pending: number; completed: number }>();
  
  quizzes.forEach((q) => {
    if (!teachersMap.has(q.createdBy.id)) {
      teachersMap.set(q.createdBy.id, { id: q.createdBy.id, name: q.createdBy.name, pending: 0, completed: 0 });
    }
    const teacher = teachersMap.get(q.createdBy.id)!;
    if (q.attempts.length > 0) {
      teacher.completed++;
    } else {
      teacher.pending++;
    }
  });

  const teachers = Array.from(teachersMap.values());

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3 animate-fade-in">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Classrooms</h1>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {teachers.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <div className="flex justify-center mb-3 text-muted-foreground">
              <Target className="w-12 h-12" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">No classrooms yet</h2>
            <p className="text-muted-foreground text-xs">Join a class using your teacher&apos;s code to see classrooms here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teachers.map((teacher, i) => (
              <Link
                key={teacher.id}
                href={`/student/classrooms/${teacher.id}`}
                className="glass rounded-xl p-5 flex flex-col items-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xl mb-3 transition-transform duration-200">
                  {teacher.name[0].toUpperCase()}
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">{teacher.name}&apos;s Class</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {teacher.pending} pending • {teacher.completed} completed
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
