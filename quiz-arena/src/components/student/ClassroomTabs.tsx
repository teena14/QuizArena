"use client";

import { useState } from "react";
import { Target, CalendarClock, History } from "lucide-react";
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

export function ClassroomTabs({ pendingQuizzes, attemptedQuizzes }: { pendingQuizzes: Quiz[], attemptedQuizzes: Quiz[] }) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Tabs Header */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "upcoming"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Upcoming Tests
          {pendingQuizzes.length > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {pendingQuizzes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
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
      <div className="min-h-[300px]">
        {activeTab === "upcoming" ? (
          <div className="animate-fade-in">
            {pendingQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="flex justify-center mb-3 text-muted-foreground">
                  <Target className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">No upcoming tests</h2>
                <p className="text-muted-foreground text-xs">You&apos;re all caught up for this class!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingQuizzes.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} index={i} disableAnimation={false} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {attemptedQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="flex justify-center mb-3 text-muted-foreground">
                  <Target className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">No quizzes completed yet</h2>
                <p className="text-muted-foreground text-xs">Your completed quizzes for this class will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {attemptedQuizzes.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} index={i} disableAnimation={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
