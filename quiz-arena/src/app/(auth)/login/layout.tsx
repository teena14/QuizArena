import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your QuizArena account. Access your teacher dashboard to manage quizzes or join a live student quiz in seconds. Secure email and password login.",
  alternates: {
    canonical: "https://quizarena-gpr1.onrender.com/login",
  },
  openGraph: {
    title: "Sign In — QuizArena",
    description:
      "Sign in to your QuizArena account. Access your teacher dashboard to manage quizzes or join a live student quiz in seconds.",
    url: "https://quizarena-gpr1.onrender.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
