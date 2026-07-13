"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface QuestionDraft {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

function newQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}

export default function NewQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState({ title: "", description: "", timeLimit: 10 });
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);

  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiFile, setAiFile] = useState<File | null>(null);

  async function generateAI() {
    if (!aiTopic.trim() && !aiFile) {
      toast.error("Please provide a topic or upload a file");
      return;
    }
    setAiLoading(true);
    try {
      const formData = new FormData();
      if (aiTopic) formData.append("topic", aiTopic);
      if (aiFile) formData.append("file", aiFile);
      formData.append("count", aiCount.toString());

      const res = await fetch("/api/teacher/quizzes/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      const generated = data.questions.map((q: any) => ({
        id: crypto.randomUUID(),
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
      }));

      setQuestions((prev) => {
        // If the only question is empty, replace it
        if (prev.length === 1 && !prev[0].text && prev[0].options.every(o => !o)) {
          return generated;
        }
        return [...prev, ...generated];
      });
      toast.success(`Generated ${generated.length} questions!`);
      setShowAI(false);
      setAiTopic("");
      setAiFile(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setAiLoading(false);
    }
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

  function addQuestion() {
    setQuestions((qs) => [...qs, newQuestion()]);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  }

  function removeQuestion(id: string) {
    if (questions.length === 1) { toast.error("Need at least one question"); return; }
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    setQuestions((qs) => {
      const idx = qs.findIndex((q) => q.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= qs.length) return qs;
      const arr = [...qs];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }

  async function handleSubmit(publish: boolean) {
    if (!quiz.title.trim()) { toast.error("Quiz title is required"); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { toast.error(`Question ${i + 1} text is required`); return; }
      if (q.options.some((o) => !o.trim())) { toast.error(`All options in question ${i + 1} must be filled`); return; }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quiz,
          timeLimit: quiz.timeLimit * 60,
          isPublished: publish,
          questions: questions.map((q, i) => ({ ...q, order: i })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create quiz"); return; }
      toast.success(publish ? "Quiz published!" : "Quiz saved as draft");
      router.push("/teacher/quizzes");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <Link href="/teacher/quizzes" className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground text-xl">←</Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Quiz</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Build your quiz and add questions below</p>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="glass rounded-2xl p-6 space-y-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-lg font-semibold text-foreground">Quiz Details</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="quiz-title">Title *</label>
          <input
            id="quiz-title"
            type="text"
            placeholder="e.g. React Fundamentals"
            value={quiz.title}
            onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="quiz-desc">Description (optional)</label>
          <textarea
            id="quiz-desc"
            rows={3}
            placeholder="What will students be tested on?"
            value={quiz.description}
            onChange={(e) => setQuiz((q) => ({ ...q, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
          />
        </div>
        <div className="space-y-2 max-w-xs">
          <label className="text-sm font-medium text-foreground" htmlFor="quiz-time">Time Limit (minutes) *</label>
          <input
            id="quiz-time"
            type="number"
            min={1}
            max={180}
            value={quiz.timeLimit}
            onChange={(e) => setQuiz((q) => ({ ...q, timeLimit: parseInt(e.target.value) || 10 }))}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Questions ({questions.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAI(true)}
              className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              ✨ Generate with AI
            </button>
            <button
              onClick={addQuestion}
              className="px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-all"
            >
              + Add Question
            </button>
          </div>
        </div>

        {showAI && (
          <div className="glass rounded-2xl p-6 space-y-4 border border-primary/40 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <h3 className="text-lg font-bold gradient-text flex items-center gap-2">✨ AI Question Generator</h3>
              <button onClick={() => setShowAI(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="relative z-10 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Server Components"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-muted border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Number of Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-muted border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Source Material (PDF/Text)</label>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                    className="w-full mt-1 px-4 py-1.5 rounded-lg bg-muted border border-border text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
              </div>
              <button
                onClick={generateAI}
                disabled={aiLoading}
                className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Questions"
                )}
              </button>
            </div>
          </div>
        )}

        {questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="glass rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Question {qIdx + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveQuestion(q.id, -1)}
                  disabled={qIdx === 0}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition text-xs"
                  title="Move up"
                >↑</button>
                <button
                  onClick={() => moveQuestion(q.id, 1)}
                  disabled={qIdx === questions.length - 1}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition text-xs"
                  title="Move down"
                >↓</button>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition text-sm"
                  title="Remove question"
                >✕</button>
              </div>
            </div>

            <textarea
              rows={2}
              placeholder="Enter your question here…"
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
                    title={`Mark option ${optionLabels[oIdx]} as correct`}
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
              ✅ Correct answer: <span className="text-primary font-medium">Option {optionLabels[q.correctIndex]}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pb-8 animate-fade-in">
        <Link href="/teacher/quizzes" className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-foreground transition-all">
          Cancel
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/40 hover:bg-muted transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing…
              </span>
            ) : (
              "Publish Quiz →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
