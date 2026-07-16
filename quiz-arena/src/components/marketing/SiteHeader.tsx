import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-[#222222]">
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto"
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold text-lg" aria-hidden="true">Q</div>
          <span className="text-2xl font-extrabold font-host text-white tracking-tight">
            Quiz<span className="text-orange-500">Arena</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/docs/getting-started"
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/docs/features"
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/faq"
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/login"
            className="text-base font-bold font-host text-white hover:text-white/80 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-base font-bold font-host rounded-lg gradient-brand transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
