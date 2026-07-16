import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[#222222] py-8 px-6 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} QuizArena. Built with Next.js, Prisma & Supabase.</span>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/docs/getting-started" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/docs/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <a
            href="https://github.com/teena14/QuizArena"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
