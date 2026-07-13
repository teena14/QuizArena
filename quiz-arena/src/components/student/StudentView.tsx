"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Target, Timer, User, ArrowLeft, History, CalendarClock } from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  _count: { questions: number };
  createdBy: { id: string; name: string };
  attempts: { score: number; totalQuestions: number; timeTaken: number }[];
};

export function StudentView({ quizzes, view }: { quizzes: Quiz[]; view: "dashboard" | "upcoming" | "history" }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const attemptedQuizzes = quizzes.filter((q) => q.attempts.length > 0);
  const pendingQuizzes = quizzes.filter((q) => q.attempts.length === 0);

  // Group pending quizzes by teacher
  const teachersMap = new Map<string, { id: string; name: string; pendingCount: number }>();
  pendingQuizzes.forEach((q) => {
    if (!teachersMap.has(q.createdBy.id)) {
      teachersMap.set(q.createdBy.id, { id: q.createdBy.id, name: q.createdBy.name, pendingCount: 0 });
    }
    teachersMap.get(q.createdBy.id)!.pendingCount++;
  });

  const teachers = Array.from(teachersMap.values());
  const selectedTeacher = selectedTeacherId ? teachersMap.get(selectedTeacherId) : null;

  const quizzesToDisplay =
    view === "history"
      ? attemptedQuizzes
      : view === "dashboard"
      ? pendingQuizzes
      : selectedTeacherId
      ? pendingQuizzes.filter((q) => q.createdBy.id === selectedTeacherId)
      : [];

  const renderQuizCard = (quiz: Quiz, i: number) => {
    const attempt = quiz.attempts[0];
    const pct = attempt ? Math.round((attempt.score / attempt.totalQuestions) * 100) : null;

    return (
      <div
        key={quiz.id}
        className="glass rounded-xl p-4 flex flex-col hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group animate-fade-in"
        style={{ animationDelay: `${0.1 + i * 0.05}s` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-lg transition-transform duration-200 flex-shrink-0">
            {quiz.title[0].toUpperCase()}
          </div>
          {attempt ? (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                pct! >= 80
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : pct! >= 60
                  ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
              }`}
            >
              {pct}%
            </span>
          ) : (
            <span className="text-xs font-bold text-primary mt-0.5">
              New
            </span>
          )}
        </div>

        <h3 className="font-bold text-foreground text-base mb-1 leading-tight line-clamp-1">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{quiz.description}</p>
        )}

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3 mt-auto pt-2">
          <span className="flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" /> {quiz._count.questions} q's
          </span>
          <span className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" /> {Math.floor(quiz.timeLimit / 60)}m
          </span>
          <span className="flex items-center gap-1 truncate max-w-[100px]">
            <User className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{quiz.createdBy.name}</span>
          </span>
        </div>

        {attempt ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                Score: {attempt.score}/{attempt.totalQuestions}
              </span>
              <span>
                {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  pct! >= 80 ? "bg-emerald-400" : pct! >= 60 ? "bg-yellow-400" : "bg-rose-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <Link
              href={`/quiz/${quiz.id}/results`}
              className="block w-full py-1.5 text-center text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all mt-1"
            >
              View Results
            </Link>
          </div>
        ) : (
          <Link
            href={`/quiz/${quiz.id}`}
            className="block w-full py-1.5 text-center text-xs font-semibold rounded-md gradient-brand text-white hover:opacity-90 transition-all duration-200 mt-1"
          >
            Start Quiz →
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {view === "history" ? (
          <div className="animate-fade-in">
            {quizzesToDisplay.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="flex justify-center mb-3 text-muted-foreground">
                  <Target className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">No quizzes completed yet</h2>
                <p className="text-muted-foreground text-xs">Your completed quizzes will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {quizzesToDisplay.map(renderQuizCard)}
              </div>
            )}
          </div>
        ) : view === "dashboard" ? (
          <div className="animate-fade-in">
            {quizzesToDisplay.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="flex justify-center mb-3 text-muted-foreground">
                  <Target className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">No pending quizzes</h2>
                <p className="text-muted-foreground text-xs">You're all caught up!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {quizzesToDisplay.map(renderQuizCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {!selectedTeacherId ? (
              // Teacher Cards Grid
              teachers.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <div className="flex justify-center mb-3 text-muted-foreground">
                    <Target className="w-12 h-12" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">No upcoming quizzes</h2>
                  <p className="text-muted-foreground text-xs">Check back later — your teachers are preparing quizzes!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {teachers.map((teacher, i) => (
                    <button
                      key={teacher.id}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className="glass rounded-xl p-5 flex flex-col items-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
                      style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                    >
                      <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xl mb-3 transition-transform duration-200">
                        {teacher.name[0].toUpperCase()}
                      </div>
                      <h3 className="font-bold text-foreground text-base mb-1">{teacher.name}&apos;s Class</h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {teacher.pendingCount} pending quiz{teacher.pendingCount !== 1 ? "zes" : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )
            ) : (
              // Selected Teacher's Quizzes
              <div className="animate-fade-in">
                <button
                  onClick={() => setSelectedTeacherId(null)}
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Classes
                </button>
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-base">
                    {selectedTeacher?.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedTeacher?.name}&apos;s Pending Quizzes</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {quizzesToDisplay.map(renderQuizCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
