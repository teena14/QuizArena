import React from "react";
import { X, Sparkles } from "lucide-react";
import type { QuestionDraft } from "@/types";

interface QuestionEditorProps {
  questions: QuestionDraft[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDraft[]>>;
  onShowAiConfig: () => void;
  showAiConfig: boolean;
}

const optionLabels = ["A", "B", "C", "D"];

export function QuestionEditor({ questions, setQuestions, onShowAiConfig, showAiConfig }: QuestionEditorProps) {
  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      { id: crypto.randomUUID(), text: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
  }

  function removeQuestion(id: string) {
    if (questions.length === 1) { 
      // Handle the error externally or accept we can't show a toast here unless we pass a toast prop or use sonner directly
      // Since it's UI, we'll just return. 
      return; 
    }
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, field: keyof QuestionDraft, value: unknown) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }

  function updateOption(qId: string, idx: number, val: string) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[idx] = val;
        return { ...q, options: opts };
      })
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Questions ({questions.length})</h2>
        <div className="flex gap-2">
          <button 
            onClick={onShowAiConfig} 
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
              showAiConfig ? "bg-primary/20 border-primary text-primary" : "border-primary/40 text-primary hover:bg-primary/10"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Auto-Generate (AI)
          </button>
          <button onClick={addQuestion} className="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-medium hover:bg-secondary transition-all">
            + Add Empty
          </button>
        </div>
      </div>

      {questions.map((q, qIdx) => (
        <div key={q.id} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">Question {qIdx + 1}</span>
            <button 
              onClick={() => removeQuestion(q.id)} 
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition text-sm flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="Question text…"
            value={q.text}
            onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuestion(q.id, "correctIndex", oIdx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex-shrink-0 transition-all duration-200 ${
                    q.correctIndex === oIdx
                      ? "gradient-brand text-white scale-110"
                      : "bg-muted text-muted-foreground hover:bg-secondary border border-border"
                  }`}
                >
                  {optionLabels[oIdx]}
                </button>
                <input
                  type="text"
                  placeholder={`Option ${optionLabels[oIdx]}`}
                  value={opt}
                  onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            ✅ Correct: <span className="text-primary font-medium">Option {optionLabels[q.correctIndex]}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
