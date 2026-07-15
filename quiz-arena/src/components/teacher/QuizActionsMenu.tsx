"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QuizActionsMenuProps {
  quizId: string;
  isPublished: boolean;
}

export function QuizActionsMenu({ quizId, isPublished }: QuizActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handlePublishToggle() {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/publish`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update"); return; }
      toast.success(data.quiz.isPublished ? "Quiz published!" : "Quiz unpublished");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this quiz? This action cannot be undone.")) return;
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      toast.success("Quiz deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all disabled:opacity-50"
        aria-label="More actions"
      >
        {loading ? (
          <span className="w-4 h-4 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin inline-block" />
        ) : (
          "⋯"
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 glass rounded-xl border border-border shadow-xl overflow-hidden animate-fade-in">
          <button
            onClick={handlePublishToggle}
            className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {isPublished ? "○ Unpublish" : "✅ Publish"}
          </button>
          {isPublished && (
            <>
              <div className="h-px bg-border" />
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                🗑 Delete Quiz
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
