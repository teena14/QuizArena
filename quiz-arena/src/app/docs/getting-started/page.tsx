import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const BASE_URL = "https://quizarena-gpr1.onrender.com";

export const metadata: Metadata = {
  title: "Getting Started — QuizArena Docs",
  description:
    "Set up QuizArena in under 5 minutes: create your teacher or student account, build your first timed MCQ quiz, publish it, and share with your class.",
  alternates: {
    canonical: `${BASE_URL}/docs/getting-started`,
  },
  openGraph: {
    title: "Getting Started — QuizArena Docs",
    description:
      "Set up QuizArena in under 5 minutes: create an account, build a quiz, publish, and share.",
    url: `${BASE_URL}/docs/getting-started`,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Docs", item: `${BASE_URL}/docs/getting-started` },
    { "@type": "ListItem", position: 3, name: "Getting Started", item: `${BASE_URL}/docs/getting-started` },
  ],
};

export default function GettingStartedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-[#111111]">
        {/* ── Header ────────────────────────────────────────────────── */}
        <SiteHeader />

        <main className="max-w-3xl mx-auto px-6 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-[#444]">/</li>
              <li><Link href="/docs/getting-started" className="hover:text-white transition-colors">Docs</Link></li>
              <li aria-hidden="true" className="text-[#444]">/</li>
              <li className="text-white" aria-current="page">Getting Started</li>
            </ol>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-host text-white mb-4 tracking-tight">
            Getting Started
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Get up and running with QuizArena in under five minutes — no setup, no credit card, no installs.
          </p>

          {/* Step 1 */}
          <article className="mb-12">
            <h2 className="text-2xl font-bold font-host text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">1</span>
              Create your account
            </h2>
            <div className="pl-11 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Go to{" "}
                <Link href="/register" className="text-orange-500 hover:underline">
                  quizarena-gpr1.onrender.com/register
                </Link>{" "}
                and choose your role:
              </p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">→</span>
                  <span><strong className="text-white">Teacher</strong> — you can create, edit, publish, and delete quizzes, and view student results.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">→</span>
                  <span><strong className="text-white">Student</strong> — you browse published quizzes, take them once, and compete on the leaderboard.</span>
                </li>
              </ul>
              <p>Fill in your name, email, and password, then click <strong className="text-white">Create Account</strong>. You are redirected to your dashboard automatically.</p>
            </div>
          </article>

          {/* Step 2 */}
          <article className="mb-12">
            <h2 className="text-2xl font-bold font-host text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">2</span>
              Build your first quiz <span className="text-base font-normal text-muted-foreground">(Teachers)</span>
            </h2>
            <div className="pl-11 space-y-3 text-muted-foreground leading-relaxed">
              <p>From your Teacher Dashboard, click <strong className="text-white">New Quiz</strong>. Fill in:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span><span><strong className="text-white">Title</strong> — shown to students on the quiz browser.</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span><span><strong className="text-white">Description</strong> — optional context or instructions.</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span><span><strong className="text-white">Time Limit</strong> — seconds (default is 600 = 10 minutes).</span></li>
              </ul>
              <p>
                Use the <strong className="text-white">Question Editor</strong> to add questions. Each question has a text field, four option fields, and a &ldquo;Mark correct&rdquo; toggle. Add as many questions as you need. Click <strong className="text-white">Save Quiz</strong> when done.
              </p>
            </div>
          </article>

          {/* Step 3 */}
          <article className="mb-12">
            <h2 className="text-2xl font-bold font-host text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">3</span>
              Publish and share
            </h2>
            <div className="pl-11 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Quizzes are <strong className="text-white">draft by default</strong> — students cannot see or start them until you publish. Toggle <strong className="text-white">Publish</strong> on the quiz card in your dashboard.
              </p>
              <p>
                Share the live URL <code className="bg-[#222] text-orange-400 px-1.5 py-0.5 rounded text-sm">quizarena-gpr1.onrender.com</code> with your students. They register, find your quiz in the Student Dashboard, and click <strong className="text-white">Start Quiz</strong>.
              </p>
            </div>
          </article>

          {/* Step 4 */}
          <article className="mb-12">
            <h2 className="text-2xl font-bold font-host text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">4</span>
              View results
            </h2>
            <div className="pl-11 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                After submission, students see their <strong className="text-white">score, time taken, and a per-question breakdown</strong> — correct, wrong, or skipped — with the right answer revealed.
              </p>
              <p>
                As a teacher, open the quiz and click <strong className="text-white">Results</strong> to see the full leaderboard ranked by score, then by fastest time.
              </p>
            </div>
          </article>

          {/* Cross-links */}
          <div className="mt-16 pt-8 border-t border-[#222222] grid sm:grid-cols-2 gap-4">
            <Link
              href="/docs/features"
              className="block p-5 border border-[#333333] rounded-xl hover:border-orange-500 transition-colors group"
            >
              <div className="text-orange-500 text-sm font-bold mb-1 group-hover:underline">Explore All Features →</div>
              <div className="text-muted-foreground text-sm">Leaderboards, server-side grading, and more.</div>
            </Link>
            <Link
              href="/faq"
              className="block p-5 border border-[#333333] rounded-xl hover:border-orange-500 transition-colors group"
            >
              <div className="text-orange-500 text-sm font-bold mb-1 group-hover:underline">FAQ →</div>
              <div className="text-muted-foreground text-sm">Common questions about accounts, attempts, and security.</div>
            </Link>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
