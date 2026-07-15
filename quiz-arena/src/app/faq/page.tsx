import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://quizarena-gpr1.onrender.com";

export const metadata: Metadata = {
  title: "FAQ — QuizArena",
  description:
    "Answers to common questions about QuizArena: how quizzes work, role differences, attempt limits, answer security, pricing, and mobile support.",
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: "FAQ — QuizArena",
    description:
      "Answers to common questions about QuizArena: how quizzes work, role differences, attempt limits, and more.",
    url: `${BASE_URL}/faq`,
  },
};

const faqItems = [
  {
    question: "Is QuizArena free to use?",
    answer:
      "Yes — QuizArena is completely free for both teachers and students. Create an account in under a minute with no credit card required.",
  },
  {
    question: "What is the difference between a Teacher and a Student account?",
    answer:
      "Teachers can create, edit, publish, and delete quizzes and view per-student results. Students browse published quizzes, take them once within the time limit, and see their score and ranking on the leaderboard.",
  },
  {
    question: "Can a student retake a quiz?",
    answer:
      "No. QuizArena enforces a single attempt per student per quiz at the database level, so results are fair and cannot be gamed by retrying.",
  },
  {
    question: "Are the correct answers secure?",
    answer:
      "Yes. Correct answers are never sent to the browser. All grading happens server-side after submission, so students cannot inspect network responses to cheat.",
  },
  {
    question: "Does QuizArena work on mobile?",
    answer:
      "Yes. QuizArena is fully responsive and works in any modern mobile browser — no app download needed.",
  },
  {
    question: "What happens if the quiz timer runs out?",
    answer:
      "The quiz auto-submits whatever answers the student has entered so far. Unanswered questions are recorded as skipped and do not count toward the score.",
  },
  {
    question: "Can teachers see which answers each student chose?",
    answer:
      "Yes. The teacher results page shows each student's score, time taken, and their position on the leaderboard. Detailed per-question breakdowns are visible to the student on their own results page.",
  },
  {
    question: "Does QuizArena work offline?",
    answer:
      "No. QuizArena requires an internet connection because quizzes are fetched and submitted in real time from the server.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-[#111111]">
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="border-b border-[#222222]">
          <nav aria-label="Main navigation" className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-extrabold text-sm" aria-hidden="true">Q</div>
              <span className="text-xl font-extrabold font-host text-white tracking-tight">
                Quiz<span className="text-orange-500">Arena</span>
              </span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/docs/getting-started" className="text-muted-foreground hover:text-white transition-colors">Docs</Link>
              <Link href="/login" className="text-muted-foreground hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg gradient-brand font-bold text-sm">Get Started</Link>
            </div>
          </nav>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-[#444]">/</li>
              <li className="text-white" aria-current="page">FAQ</li>
            </ol>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-host text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Everything you need to know about QuizArena. Can&apos;t find what you&apos;re looking for?{" "}
            <a href="https://github.com/your-username/quiz-arena/issues" className="text-orange-500 hover:underline">
              Open an issue on GitHub
            </a>
            .
          </p>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="border border-[#333333] rounded-xl overflow-hidden group"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-white font-semibold font-host select-none hover:bg-white/5 transition-colors">
                  {item.question}
                  <span className="text-orange-500 ml-4 text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-5 pt-1 text-muted-foreground text-[15px] leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          {/* Cross-links */}
          <div className="mt-16 pt-8 border-t border-[#222222] grid sm:grid-cols-2 gap-4">
            <Link
              href="/docs/getting-started"
              className="block p-5 border border-[#333333] rounded-xl hover:border-orange-500 transition-colors group"
            >
              <div className="text-orange-500 text-sm font-bold mb-1 group-hover:underline">Getting Started →</div>
              <div className="text-muted-foreground text-sm">Set up QuizArena and create your first quiz in minutes.</div>
            </Link>
            <Link
              href="/docs/features"
              className="block p-5 border border-[#333333] rounded-xl hover:border-orange-500 transition-colors group"
            >
              <div className="text-orange-500 text-sm font-bold mb-1 group-hover:underline">Features →</div>
              <div className="text-muted-foreground text-sm">Explore everything QuizArena can do for teachers and students.</div>
            </Link>
          </div>
        </main>

        <footer className="border-t border-[#222222] py-8 px-6 mt-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} QuizArena</span>
            <nav aria-label="Footer navigation" className="flex items-center gap-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/docs/getting-started" className="hover:text-white transition-colors">Docs</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
