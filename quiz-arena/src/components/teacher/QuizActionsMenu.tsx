"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleDelete() {
    setLoading(true);
    setShowConfirm(false);
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

  async function handlePublishToggle() {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/publish`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update"); return; }
      toast.success(data.quiz.isPublished ? "Quiz published!" : "Quiz moved to drafts");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function navigate(path: string) {
    setOpen(false);
    router.push(path);
  }

  const dropdown = open ? (
    <div
      ref={menuRef}
      style={{ position: "absolute", top: menuPos.top, right: menuPos.right, zIndex: 99999 }}
      className="w-48 glass rounded-xl border border-border shadow-2xl overflow-hidden animate-fade-in"
    >
      {/* Edit — only for drafts */}
      {!isPublished && (
        <button
          onClick={() => navigate(`/teacher/quizzes/${quizId}/edit`)}
          className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
        >
          Edit
        </button>
      )}

      {/* Results — only for published */}
      {isPublished && (
        <>
          <button
            onClick={() => navigate(`/teacher/quizzes/${quizId}/results`)}
            className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            Results
          </button>
          <div className="h-px bg-border" />
        </>
      )}

      {!isPublished && <div className="h-px bg-border" />}

      <button
        onClick={handlePublishToggle}
        className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>

      <div className="h-px bg-border" />
      <button
        onClick={() => { setOpen(false); setShowConfirm(true); }}
        className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
      >
        Delete
      </button>
    </div>
  ) : null;

  // Confirmation modal
  const confirmModal = showConfirm ? (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 999999 }}
      className="flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
    >
      <div className="glass rounded-2xl border border-border shadow-2xl p-7 w-full max-w-sm mx-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Quiz</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          This quiz and all its questions and student attempts will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
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

      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}

      {typeof document !== "undefined" && confirmModal
        ? createPortal(confirmModal, document.body)
        : null}
    </div>
  );
}
