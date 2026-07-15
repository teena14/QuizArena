import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://quizarena-gpr1.onrender.com";

export const metadata: Metadata = {
  title: "Features — QuizArena Docs",
  description:
    "Explore every QuizArena feature: timed quizzes, server-side grading, live leaderboards, detailed results breakdowns, role-based dashboards, and one-attempt enforcement.",
  alternates: {
    canonical: `${BASE_URL}/docs/features`,
  },
  openGraph: {
    title: "Features — QuizArena Docs",
    description:
      "Timed quizzes, server-side grading, live leaderboards, detailed results, and role-based dashboards — all free.",
    url: `${BASE_URL}/docs/features`,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Docs", item: `${BASE_URL}/docs/getting-started` },
    { "@type": "ListItem", position: 3, name: "Features", item: `${BASE_URL}/docs/features` },
  ],
};

const featureDetails = [
  {
    title: "Role-Based Accounts",
    tag: "Access Control",
    body: "Teachers and Students get entirely separate dashboards. Roles are chosen at registration and enforced at both the route (Next.js Edge Middleware) and API level — a student cannot access any teacher endpoint, and vice versa.",
  },
  {
    title: "Quiz Builder",
    tag: "Teacher",
    body: "Create a quiz in seconds: give it a title, optional description, and a time limit. Add as many MCQ questions as you need — each with four answer options and a 'mark correct' toggle. Save as a draft and publish only when ready.",
  },
  {
    title: "Timed Quiz Engine",
    tag: "Student",
    body: "Every quiz runs a client-side countdown. When the timer reaches zero, the quiz auto-submits with whatever answers the student has entered. Students can also submit manually at any time.",
  },
  {
    title: "Server-Side Grading",
    tag: "Security",
    body: "Correct answer indices are never included in the API response that reaches the browser. Grading happens entirely on the server after submission — students cannot inspect network requests to find answers.",
  },
  {
    title: "Live Leaderboard",
    tag: "Competition",
    body: "After every submission, the leaderboard page ranks all students by score (descending) and then by time taken (ascending). Ties are broken by whoever finished fastest.",
  },
  {
    title: "Detailed Results Breakdown",
    tag: "Learning",
    body: "After submitting, students see a question-by-question breakdown: which they got correct, which were wrong (with the right answer shown), and which were skipped. This turns every quiz into a learning moment.",
  },
  {
    title: "One-Attempt Enforcement",
    tag: "Fairness",
    body: "A database-level unique constraint on (quizId, studentId) means a student cannot submit twice — even if they clear cookies or try from a different browser session. This is enforced at the data layer, not just the UI.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
              <Link href="/docs/getting-started" className="text-muted-foreground hover:text-white transition-colors">Getting Started</Link>
              <Link href="/faq" className="text-muted-foreground hover:text-white transition-colors">FAQ</Link>
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
              <li><Link href="/docs/getting-started" className="hover:text-white transition-colors">Docs</Link></li>
              <li aria-hidden="true" className="text-[#444]">/</li>
              <li className="text-white" aria-current="page">Features</li>
            </ol>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-host text-white mb-4 tracking-tight">
            Features
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Everything QuizArena does — and the design decisions behind each feature.
          </p>

          <div className="space-y-8">
            {featureDetails.map((feature) => (
              <article
                key={feature.title}
                className="border border-[#2a2a2a] rounded-xl p-6 hover:border-[#444] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-xl font-bold font-host text-white">
                    {feature.title}
                  </h2>
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold">
                    {feature.tag}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 border border-orange-500/30 rounded-xl text-center bg-orange-500/5">
            <h2 className="text-2xl font-bold font-host text-white mb-3">
              Ready to try it?
            </h2>
            <p className="text-muted-foreground mb-6">
              Create a free account and build your first quiz in under two minutes.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 rounded-lg gradient-brand font-bold font-host text-base"
            >
              Create Free Account
            </Link>
          </div>

          {/* Cross-links */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/docs/getting-started"
              className="block p-5 border border-[#333333] rounded-xl hover:border-orange-500 transition-colors group"
            >
              <div className="text-orange-500 text-sm font-bold mb-1 group-hover:underline">← Getting Started</div>
              <div className="text-muted-foreground text-sm">Step-by-step setup for teachers and students.</div>
            </Link>
            <Link
              href="/faq"
              className="block p-5 border border-[#333333] rounded-xl hover:border-orange-500 transition-colors group"
            >
              <div className="text-orange-500 text-sm font-bold mb-1 group-hover:underline">FAQ →</div>
              <div className="text-muted-foreground text-sm">Common questions about QuizArena.</div>
            </Link>
          </div>
        </main>

        <footer className="border-t border-[#222222] py-8 px-6 mt-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} QuizArena</span>
            <nav aria-label="Footer navigation" className="flex items-center gap-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/docs/getting-started" className="hover:text-white transition-colors">Getting Started</Link>
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
