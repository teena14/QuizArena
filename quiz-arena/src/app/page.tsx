import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const BASE_URL = "https://quizarena-gpr1.onrender.com";

export const metadata: Metadata = {
  title: "QuizArena — Competitive Quiz Platform for Teachers & Students",
  description:
    "Build timed MCQ quizzes in minutes, share with your class, and watch students compete on a live leaderboard. Free for teachers and students. No credit card needed.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "QuizArena — Quiz. Compete. Win.",
    description:
      "Build timed MCQ quizzes in minutes, share with your class, and watch students compete on a live leaderboard. Free forever.",
    url: BASE_URL,
  },
};

// ── JSON-LD payloads ─────────────────────────────────────────────────────────

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QuizArena",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: BASE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "QuizArena is a free competitive quiz platform where teachers build timed MCQ quizzes and students compete for the top spot on a live leaderboard.",
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string })?.role;
    redirect(role === "TEACHER" ? "/teacher" : "/student");
  }

  return (
    <>
      {/* ── Structured Data ─────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main id="main-content" className="bg-[#111111] overflow-hidden">

        {/* ── Navbar ──────────────────────────────────────────────────── */}
        <SiteHeader />

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center"
        >
          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-host text-white leading-tight tracking-tight mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Quiz. Compete.{" "}
            <span className="text-orange-500">Win.</span>
          </h1>

          <p
            className="text-lg sm:text-xl font-medium text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            QuizArena lets teachers build timed multiple-choice quizzes and students battle for the
            top spot on the leaderboard — in real time.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/register?role=STUDENT"
              className="px-8 py-3.5 rounded-lg gradient-brand font-bold font-host text-lg transition-all duration-200"
            >
              Join as Student
            </Link>
            <Link
              href="/register?role=TEACHER"
              className="px-8 py-3.5 rounded-lg border border-orange-500 text-white font-bold font-host text-lg hover:bg-orange-500/10 transition-all duration-200"
            >
              Create as Teacher
            </Link>
          </div>
        </section>

        {/* ── Feature Cards ───────────────────────────────────────────── */}
        <section aria-labelledby="features-heading" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
          <h2 id="features-heading" className="sr-only">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {features.map((f, i) => (
              <article
                key={f.title}
                className={`rounded-2xl flex flex-col border overflow-hidden animate-fade-in ${f.color === "orange" ? "border-orange-500" : "border-white"
                  }`}
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div
                  className={`px-4 py-4 text-center font-host font-bold text-lg ${f.color === "orange" ? "bg-orange-500 text-white" : "bg-white text-[#111111]"
                    }`}
                >
                  {f.title}
                </div>
                <div className="p-6 bg-[#111111] flex-1 flex items-center justify-center">
                  <p className="text-[15px] leading-relaxed text-muted-foreground text-left">
                    {f.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Stats Strip ─────────────────────────────────────────────── */}
        <section aria-label="Platform statistics" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
          <div className="border border-[#333333] rounded-xl px-6 py-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#333333]">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-6 sm:py-0 sm:px-6">
                <div className="text-4xl font-extrabold font-host text-orange-500">{s.value}</div>
                <div className="text-sm text-muted-foreground font-medium mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="cta-heading" className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-10">
            <div className="flex flex-col items-start max-w-md py-2">
              <div>
                <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold font-host text-white mb-4">
                  Ready to arena up?
                </h2>
                <p className="text-muted-foreground font-medium text-base sm:text-lg">
                  Join thousands of students and teachers making learning competitive and fun.
                </p>
              </div>
              <Link
                href="/register"
                className="mt-8 md:mt-auto px-6 py-3 rounded-lg gradient-brand font-bold font-host text-base transition-opacity"
              >
                Create Free Account
              </Link>
            </div>
            {/* Decorative — hidden on mobile to prevent overflow */}
            <div className="hidden md:flex flex-col items-end text-5xl sm:text-6xl md:text-7xl font-extrabold font-host text-white leading-[1.1] tracking-tight" aria-hidden="true">
              <span>Quiz.</span>
              <span>Compete.</span>
              <span className="text-orange-500">Win.</span>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="faq-heading" className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold font-host text-white mb-10 text-center">
            Frequently Asked Questions
          </h2>
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
          <div className="text-center mt-8">
            <Link href="/faq" className="text-orange-500 hover:underline text-sm font-medium">
              See all FAQs →
            </Link>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <SiteFooter />
      </main>
    </>
  );
}

const features = [
  {
    title: "Live Leaderboard",
    desc: "After every submission, a ranked leaderboard shows scores and completion times for the class.",
    color: "orange",
  },
  {
    title: "Easy Quiz Builder",
    desc: "Teachers add questions, write 4 options, mark the correct answer, and publish — all in one page.",
    color: "white",
  },
  {
    title: "Detailed Results",
    desc: "Students see a full breakdown: correct, wrong, skipped — with the right answer highlighted.",
    color: "orange",
  },
  {
    title: "Role-Based Access",
    desc: "Separate dashboards for Teachers and Students. Your role is set at registration and enforced by the server.",
    color: "white",
  },
];

const stats = [
  { value: "∞", label: "Quizzes you can create" },
  { value: "4", label: "Options per question" },
  { value: "0s", label: "Setup time for students" },
];
