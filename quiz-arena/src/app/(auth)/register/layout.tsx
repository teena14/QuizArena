import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account",
  description:
    "Join QuizArena free as a Teacher or Student. Teachers build MCQ quizzes with timers and leaderboards. Students compete and track their progress. No credit card required.",
  alternates: {
    canonical: "https://quizarena-gpr1.onrender.com/register",
  },
  openGraph: {
    title: "Create Free Account — QuizArena",
    description:
      "Join QuizArena free as a Teacher or Student. Build quizzes, compete on leaderboards, and track progress. Sign up in under a minute.",
    url: "https://quizarena-gpr1.onrender.com/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
