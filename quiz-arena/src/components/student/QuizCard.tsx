"use client";

import Link from "next/link";
import { ClipboardList, Timer, User } from "lucide-react";

type QuizCardProps = {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    timeLimit: number;
    _count: { questions: number };
    createdBy: { id: string; name: string };
    attempts: { id: string; score: number; totalQuestions: number; timeTaken: number }[];
  };
  index?: number;
  disableAnimation?: boolean;
};

export function QuizCard({ quiz, index = 0, disableAnimation = false }: QuizCardProps) {
  const attempt = quiz.attempts[0];
  const pct = attempt ? Math.round((attempt.score / attempt.totalQuestions) * 100) : null;

  return (
    <div
      className={`glass rounded-xl p-4 flex flex-col hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group ${!disableAnimation ? "animate-fade-in" : ""}`}
      style={!disableAnimation ? { animationDelay: `${0.1 + index * 0.05}s` } : undefined}
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
          <ClipboardList className="w-3.5 h-3.5" /> {quiz._count.questions} q&apos;s
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
            href={`/quiz/${quiz.id}/results/${attempt.id}`}
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
}
