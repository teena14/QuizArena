"use client";

import { useState } from "react";
import { Target, ArrowLeft, History, CalendarClock } from "lucide-react";
import { QuizCard } from "./QuizCard";

import type { Quiz } from "@/types";

export function DashboardTabs({ quizzes }: { quizzes: Quiz[] }) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const attemptedQuizzes = quizzes.filter((q) => (q.attempts?.length ?? 0) > 0);
  const pendingQuizzes = quizzes.filter((q) => !((q.attempts?.length ?? 0) > 0));

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
    activeTab === "history"
      ? attemptedQuizzes
      : selectedTeacherId
      ? pendingQuizzes.filter((q) => q.createdBy.id === selectedTeacherId)
      : [];

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex space-x-2 border-b border-border pb-px">
        <button
          onClick={() => {
            setActiveTab("upcoming");
            setSelectedTeacherId(null);
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "upcoming"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Upcoming
          {pendingQuizzes.length > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {pendingQuizzes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            setSelectedTeacherId(null);
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "history" ? (
          <div className="animate-fade-in">
            {quizzesToDisplay.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center">
                <div className="flex justify-center mb-4 text-muted-foreground">
                  <Target className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No quizzes completed yet</h2>
                <p className="text-muted-foreground text-sm">Your completed quizzes will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {quizzesToDisplay.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} index={i} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {!selectedTeacherId ? (
              // Teacher Cards Grid
              teachers.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center">
                  <div className="flex justify-center mb-4 text-muted-foreground">
                    <Target className="w-16 h-16" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">No upcoming quizzes</h2>
                  <p className="text-muted-foreground text-sm">Check back later — your teachers are preparing quizzes!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {teachers.map((teacher, i) => (
                    <button
                      key={teacher.id}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className="glass rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary/40 transition-all duration-300 group"
                      style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                    >
                      <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-2xl mb-4 transition-transform duration-200">
                        {teacher.name[0].toUpperCase()}
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-1">{teacher.name}&apos;s Class</h3>
                      <p className="text-sm text-muted-foreground font-medium">
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
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Classes
                </button>
                <div className="mb-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-lg">
                    {selectedTeacher?.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedTeacher?.name}&apos;s Pending Quizzes</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {quizzesToDisplay.map((quiz, i) => (
                    <QuizCard key={quiz.id} quiz={quiz} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
