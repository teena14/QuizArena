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

export function DashboardTabs({ quizzes }: { quizzes: Quiz[] }) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
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
    activeTab === "history"
      ? attemptedQuizzes
      : selectedTeacherId
      ? pendingQuizzes.filter((q) => q.createdBy.id === selectedTeacherId)
      : [];

  const renderQuizCard = (quiz: Quiz, i: number) => {
    const attempt = quiz.attempts[0];
    const pct = attempt ? Math.round((attempt.score / attempt.totalQuestions) * 100) : null;

    return (
      <div
        key={quiz.id}
        className="glass rounded-2xl p-6 flex flex-col hover:border-primary/40 transition-all duration-300 group animate-fade-in"
        style={{ animationDelay: `${0.1 + i * 0.05}s` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-xl transition-transform duration-200 flex-shrink-0">
            {quiz.title[0].toUpperCase()}
          </div>
          {attempt ? (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
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
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 font-medium">
              New
            </span>
          )}
        </div>

        <h3 className="font-bold text-foreground text-lg mb-1 leading-tight">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{quiz.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 mt-auto pt-3">
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" /> {quiz._count.questions} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Timer className="w-4 h-4" /> {Math.floor(quiz.timeLimit / 60)} min
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" /> {quiz.createdBy.name}
          </span>
        </div>

        {attempt ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Score: {attempt.score}/{attempt.totalQuestions}
              </span>
              <span>
                {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  pct! >= 80 ? "bg-emerald-400" : pct! >= 60 ? "bg-yellow-400" : "bg-rose-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <Link
              href={`/quiz/${quiz.id}/results`}
              className="block w-full py-2 text-center text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              View Results
            </Link>
          </div>
        ) : (
          <Link
            href={`/quiz/${quiz.id}`}
            className="block w-full py-2.5 text-center text-sm font-semibold rounded-lg gradient-brand text-white hover:opacity-90 transition-all duration-200"
          >
            Start Quiz →
          </Link>
        )}
      </div>
    );
  };

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
                {quizzesToDisplay.map(renderQuizCard)}
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
                  {quizzesToDisplay.map(renderQuizCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
