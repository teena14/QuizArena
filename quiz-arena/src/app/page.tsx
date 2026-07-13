import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
// No icons needed from lucide-react anymore for the landing page


export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string })?.role;
    redirect(role === "TEACHER" ? "/teacher" : "/student");
  }

  return (
    <main className="bg-[#111111] overflow-hidden">

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold text-lg">Q</div>
          <span className="text-2xl font-extrabold font-host text-white tracking-tight">Quiz<span className="text-orange-500">Arena</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-base font-bold font-host text-white hover:text-white/80 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-base font-bold font-host rounded-lg gradient-brand transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">


        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-host text-white leading-tight tracking-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Quiz. Compete.{" "}
          <span className="text-orange-500">Win.</span>
        </h1>

        <p className="text-lg sm:text-xl font-medium text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          QuizArena lets teachers build timed multiple-choice quizzes and students battle for the
          top spot on the leaderboard — in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
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

      {/* ── Feature Cards ────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((f, i) => (
            <div
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
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="border border-[#333333] rounded-xl px-8 py-10 grid grid-cols-3 divide-x divide-[#333333]">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-6">
              <div className="text-4xl font-extrabold font-host text-orange-500">{s.value}</div>
              <div className="text-sm text-muted-foreground font-medium mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-10">
          <div className="flex flex-col items-start max-w-md py-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-host text-white mb-4">Ready to arena up?</h2>
              <p className="text-muted-foreground font-medium text-base sm:text-lg">Join thousands of students and teachers making learning competitive and fun.</p>
            </div>
            <Link
              href="/register"
              className="mt-auto px-6 py-3 rounded-lg gradient-brand font-bold font-host text-base transition-opacity"
            >
              Create Free Account
            </Link>
          </div>
          <div className="flex flex-col items-end text-5xl sm:text-6xl md:text-7xl font-extrabold font-host text-white leading-[1.1] tracking-tight">
            <span>Quiz.</span>
            <span>Compete.</span>
            <span className="text-orange-500">Win.</span>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} QuizArena. Built with Next.js, Prisma & Supabase.
      </footer>
    </main>
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
