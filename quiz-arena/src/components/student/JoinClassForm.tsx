"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search } from "lucide-react";

export function JoinClassForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/student/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to join class");
        return;
      }

      toast.success(`Joined ${data.teacherName}'s class!`);
      setCode("");
      router.refresh(); // Refresh the page to load new quizzes
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleJoin} className="flex items-center gap-2 max-w-xs">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Class Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-muted border border-border focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-semibold tracking-wide"
            maxLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="px-4 py-1.5 rounded-md gradient-brand font-semibold text-sm transition-all shadow-sm"
        >
          {loading ? "..." : "Join"}
        </button>
      </form>
    </div>
  );
}
