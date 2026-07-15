"use client";

import { useState } from "react";
import { Target, ArrowLeft } from "lucide-react";
import { QuizCard } from "./QuizCard";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  _count: { questions: number };
  createdBy: { id: string; name: string };
  attempts: { id: string; score: number; totalQuestions: number; timeTaken: number }[];
};

export function StudentView({ quizzes, view }: { quizzes: Quiz[]; view: "dashboard" | "upcoming" | "history" }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const attemptedQuizzes = quizzes.filter((q) => q.attempts.length > 0);
  const pendingQuizzes = quizzes.filter((q) => q.attempts.length === 0);

  const isGroupedView = view === "history" || view === "upcoming";
  const sourceQuizzes = view === "history" ? attemptedQuizzes : pendingQuizzes;

  // Group sourceQuizzes by teacher
  const teachersMap = new Map<string, { id: string; name: string; count: number }>();
  if (isGroupedView) {
    sourceQuizzes.forEach((q) => {
      if (!teachersMap.has(q.createdBy.id)) {
        teachersMap.set(q.createdBy.id, { id: q.createdBy.id, name: q.createdBy.name, count: 0 });
      }
      teachersMap.get(q.createdBy.id)!.count++;
    });
  }

  const teachers = Array.from(teachersMap.values());
  const selectedTeacher = selectedTeacherId ? teachersMap.get(selectedTeacherId) : null;

  const quizzesToDisplay = view === "dashboard"
    ? sourceQuizzes
    : selectedTeacherId
    ? sourceQuizzes.filter((q) => q.createdBy.id === selectedTeacherId)
    : [];



  return (
    <div className="w-full">
      {view === "dashboard" ? (
        <div className="animate-fade-in">
          {quizzesToDisplay.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="flex justify-center mb-3 text-muted-foreground">
                <Target className="w-12 h-12" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">No pending quizzes</h2>
              <p className="text-muted-foreground text-xs">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {quizzesToDisplay.map((quiz, i) => (
                <QuizCard key={quiz.id} quiz={quiz} index={i} disableAnimation={false} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={view !== "history" ? "animate-fade-in" : ""}>
          {!selectedTeacherId ? (
            teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="flex justify-center mb-3 text-muted-foreground">
                  <Target className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {view === "history" ? "No quizzes completed yet" : "No upcoming quizzes"}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {view === "history"
                    ? "Your completed quizzes will appear here."
                    : "Check back later — your teachers are preparing quizzes!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {teachers.map((teacher, i) => (
                  <button
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={`glass rounded-xl p-5 flex flex-col items-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group ${view !== "history" ? "animate-fade-in" : ""}`}
                    style={view !== "history" ? { animationDelay: `${0.1 + i * 0.05}s` } : undefined}
                  >
                    <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xl mb-3 transition-transform duration-200">
                      {teacher.name[0].toUpperCase()}
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-1">{teacher.name}&apos;s Class</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {teacher.count} {view === "history" ? "completed" : "pending"} quiz{teacher.count !== 1 ? "zes" : ""}
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className={view !== "history" ? "animate-fade-in" : ""}>
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
                  <h2 className="text-lg font-bold text-foreground">{selectedTeacher?.name}&apos;s {view === "history" ? "Completed" : "Pending"} Quizzes</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {quizzesToDisplay.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} index={i} disableAnimation={view === "history"} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
