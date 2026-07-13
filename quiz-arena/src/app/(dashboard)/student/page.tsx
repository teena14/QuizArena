import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudentView } from "@/components/student/StudentView";
import { JoinClassForm } from "@/components/student/JoinClassForm";
import { ClipboardList, CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Student Dashboard" };

export default async function StudentDashboard() {
  const session = await auth();
  const userId = (session?.user as { id: string; name: string }).id;
  const userName = (session?.user as { id: string; name: string }).name;

  const quizzes = await prisma.quiz.findMany({
    where: {
      isPublished: true,
      createdBy: {
        students: { some: { id: userId } }
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: userId },
        select: { score: true, totalQuestions: true, timeTaken: true },
        take: 1,
      },
    },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">{userName?.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here are your pending quizzes to complete.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <JoinClassForm />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "Available", value: quizzes.length, icon: <ClipboardList className="w-8 h-8" />, color: "from-violet-500/20 to-violet-500/5 border-violet-500/30" },
          { label: "Attempted", value: quizzes.filter(q => q.attempts.length > 0).length, icon: <CheckCircle2 className="w-8 h-8" />, color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30" },
          { label: "Pending", value: quizzes.filter(q => q.attempts.length === 0).length, icon: <Clock className="w-8 h-8" />, color: "from-amber-500/20 to-amber-500/5 border-amber-500/30" },
        ].map((s) => (
          <div key={s.label} className={`glass rounded-2xl p-6 bg-gradient-to-br ${s.color} flex justify-between items-center`}>
            <div>
              <div className="text-3xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
            <div className="text-muted-foreground opacity-80">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="animate-fade-in space-y-4" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-bold text-foreground">Recent</h2>
        <StudentView quizzes={quizzes} view="dashboard" />
      </div>
    </div>
  );
}
