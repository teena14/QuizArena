"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") === "TEACHER" ? "TEACHER" : "STUDENT";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole as "TEACHER" | "STUDENT",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }
      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Registered but sign-in failed — please log in manually");
        router.push("/login");
      } else {
        toast.success("Account created! Welcome to QuizArena");
        router.push(form.role === "TEACHER" ? "/teacher" : "/student");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.6 0.25 240), transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold">Q</div>
            <span className="text-2xl font-bold">Quiz<span className="gradient-text">Arena</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join QuizArena for free</p>
        </div>

        {/* Role Toggle */}
        <div className="glass rounded-2xl p-1.5 flex mb-6">
          {(["STUDENT", "TEACHER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${form.role === r
                ? "gradient-brand text-white"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {r === "STUDENT" ? " Student" : " Teacher"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                required
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full gradient-brand text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                `Join as ${form.role === "TEACHER" ? "Teacher" : "Student"} →`
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
