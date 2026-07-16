"use client";

import { useState, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const [step, setStep] = useState<"EMAIL" | "OTP" | "SUCCESS">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to request OTP.");
      
      toast.success("If an account exists, a reset code was sent.");
      setStep("OTP");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otp, password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid OTP or password.");
      }
      
      toast.success("Password updated successfully!");
      setStep("SUCCESS");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }} aria-hidden="true" />
      
      <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8" aria-label="Go to QuizArena home">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold text-sm">Q</div>
            <span className="text-xl font-extrabold text-white tracking-tight">Quiz<span className="text-orange-500">Arena</span></span>
          </Link>
          <h1 className="text-2xl font-bold font-host text-white">
            {step === "EMAIL" && "Reset Password"}
            {step === "OTP" && "Enter Reset Code"}
            {step === "SUCCESS" && "Password Reset!"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {step === "EMAIL" && "Enter your email to receive a 6-digit code."}
            {step === "OTP" && `We sent a code to ${email}`}
            {step === "SUCCESS" && "You can now sign in with your new password."}
          </p>
        </div>

        {step === "SUCCESS" ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-2xl">✓</div>
            <Link href="/login" className="block w-full py-3 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Back to Sign In
            </Link>
          </div>
        ) : step === "EMAIL" ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email address</label>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary/50 transition-colors disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">6-Digit OTP</label>
              <input
                type="text"
                required
                disabled={loading}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary/50 transition-colors disabled:opacity-50 text-center tracking-widest font-mono text-lg"
                placeholder="123456"
                maxLength={6}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">New Password</label>
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary/50 transition-colors disabled:opacity-50"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Update Password"}
            </button>
            <div className="text-center pt-2">
               <button type="button" onClick={() => setStep("EMAIL")} className="text-xs text-muted-foreground hover:text-white transition-colors">
                 Use a different email
               </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-colors">
            Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
