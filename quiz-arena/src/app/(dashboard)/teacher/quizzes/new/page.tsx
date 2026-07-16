"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import type { QuestionDraft } from "@/types";

import { EditQuizForm, EditQuizFormState } from "@/components/teacher/edit-quiz/EditQuizForm";
import { QuestionEditor } from "@/components/teacher/edit-quiz/QuestionEditor";
import { AiGeneratorConfig } from "@/components/teacher/edit-quiz/AiGeneratorConfig";
import { createQuizAction } from "@/actions/quiz";

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
  
  const [form, setForm] = useState<EditQuizFormState>({
    title: "",
    description: "",
    timeLimit: 10,
    isPublished: false,
  });

  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [showAiConfig, setShowAiConfig] = useState(false);

  async function handleSubmit(publish: boolean) {
    if (!form.title.trim()) { toast.error("Quiz title is required"); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { toast.error(`Question ${i + 1} text is required`); return; }
      if (q.options.some((o) => !o.trim())) { toast.error(`All options in question ${i + 1} must be filled`); return; }
    }

    setLoading(true);
    try {
      await createQuizAction({
        title: form.title,
        description: form.description,
        timeLimit: form.timeLimit * 60,
        isPublished: publish,
        questions: questions.map((q, i) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          order: i,
        })),
      });
      toast.success(publish ? "Quiz published!" : "Quiz saved as draft");
      router.push("/teacher/quizzes");
      router.refresh();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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

      <EditQuizForm form={form} setForm={setForm} />

      <QuestionEditor
        questions={questions}
        setQuestions={setQuestions}
        showAiConfig={showAiConfig}
        onShowAiConfig={() => setShowAiConfig(!showAiConfig)}
      />

      {showAiConfig && (
        <AiGeneratorConfig
          onGenerate={(newQuestions) => setQuestions((prev) => {
            // Replace empty first question if it exists
            if (prev.length === 1 && !prev[0].text && prev[0].options.every(o => !o)) {
              return newQuestions;
            }
            return [...prev, ...newQuestions];
          })}
          onClose={() => setShowAiConfig(false)}
        />
      )}

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
