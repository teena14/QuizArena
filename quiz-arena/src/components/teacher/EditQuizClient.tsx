"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  order: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  isPublished: boolean;
  questions: Question[];
}

interface QuestionDraft {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export function EditQuizClient({ quiz }: { quiz: QuizData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: quiz.title,
    description: quiz.description || "",
    timeLimit: Math.floor(quiz.timeLimit / 60),
    isPublished: quiz.isPublished,
  });
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options as [string, string, string, string],
      correctIndex: q.correctIndex,
    }))
  );

  // AI Generation State
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"topic" | "pdf">("topic");
  const [aiTopic, setAiTopic] = useState("");
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiCount, setAiCount] = useState(5);

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      { id: crypto.randomUUID(), text: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
  }

  function removeQuestion(id: string) {
    if (questions.length === 1) { toast.error("Need at least one question"); return; }
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

  async function handleSave(publish?: boolean) {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          timeLimit: form.timeLimit * 60,
          isPublished: publish ?? form.isPublished,
          questions: questions.map((q, i) => ({ ...q, order: i })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Save failed"); return; }
      toast.success("Quiz updated!");
      router.push("/teacher/quizzes");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAiGenerate() {
    if (aiMode === "topic" && !aiTopic.trim()) { toast.error("Please enter a topic"); return; }
    if (aiMode === "pdf" && !aiFile) { toast.error("Please select a PDF file"); return; }
    
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("count", aiCount.toString());
      if (aiMode === "topic") {
        formData.append("topic", aiTopic);
      } else if (aiMode === "pdf" && aiFile) {
        formData.append("file", aiFile);
      }

      const res = await fetch("/api/teacher/quizzes/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      
      const newQuestions = data.questions.map((q: any) => ({
        id: crypto.randomUUID(),
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
      }));
      
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(`Generated ${newQuestions.length} questions successfully!`);
      setShowAiConfig(false);
      setAiTopic("");
      setAiFile(null);
    } catch (error) {
      toast.error("An error occurred during generation");
    } finally {
      setAiLoading(false);
    }
  }

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 animate-fade-in">
        <Link href="/teacher/quizzes" className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground text-xl">←</Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Quiz</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {form.isPublished
              ? "⚠️ This quiz is published — changes are live immediately"
              : "Draft — not visible to students yet"}
          </p>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Quiz Details</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
          />
        </div>
        <div className="max-w-xs space-y-2">
          <label className="text-sm font-medium text-foreground">Time Limit (minutes)</label>
          <input
            type="number"
            min={1}
            max={180}
            value={form.timeLimit}
            onChange={(e) => setForm((f) => ({ ...f, timeLimit: parseInt(e.target.value) || 10 }))}
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
              onClick={() => setShowAiConfig(!showAiConfig)} 
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

        {/* AI Generation Config Section */}
        {showAiConfig && (
          <div className="glass rounded-2xl p-6 border-primary/30 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <h3 className="text-md font-semibold text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> AI Question Generator
            </h3>
            
            <div className="space-y-5">
              <div className="flex gap-4 p-1 bg-background/50 rounded-lg w-max border border-border/50">
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${aiMode === 'topic' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setAiMode('topic')}
                >
                  By Topic
                </button>
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${aiMode === 'pdf' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setAiMode('pdf')}
                >
                  From PDF Upload
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {aiMode === 'topic' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. History of the Roman Empire"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Upload PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                      className="w-full p-4 rounded-xl bg-card border-2 border-dashed border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 text-center cursor-pointer transition-all hover:border-primary/50"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="px-8 py-3 rounded-full gradient-brand text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
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
          </div>
        )}

        {questions.map((q, qIdx) => (
          <div key={q.id} className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Question {qIdx + 1}</span>
              <button onClick={() => removeQuestion(q.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition text-sm flex items-center justify-center">
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

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <Link href="/teacher/quizzes" className="px-6 py-3 rounded-full border border-border text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-foreground transition-all">
          Cancel
        </Link>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={loading} className="px-6 py-3 rounded-full border border-border text-foreground text-sm font-medium hover:border-primary/40 hover:bg-muted transition-all disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={loading} className="px-8 py-3 rounded-full gradient-brand text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              form.isPublished ? "Save & Publish" : "Publish Quiz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
