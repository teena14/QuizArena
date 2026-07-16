import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteQuizModalProps {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteQuizModal({ onClose, onConfirm, loading }: DeleteQuizModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 999999 }}
      className="flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass rounded-2xl border border-border shadow-2xl p-7 w-full max-w-sm mx-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Quiz</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          This quiz and all its questions and student attempts will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
