"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import type { Quiz, QuizQuestion, QuestionDraft } from "@/types";

import { EditQuizForm, EditQuizFormState } from "./edit-quiz/EditQuizForm";
import { QuestionEditor } from "./edit-quiz/QuestionEditor";
import { AiGeneratorConfig } from "./edit-quiz/AiGeneratorConfig";
import { DeleteQuizModal } from "./edit-quiz/DeleteQuizModal";

import { updateQuizAction, deleteQuizAction } from "@/actions/quiz";

export function EditQuizClient({ quiz }: { quiz: Quiz & { questions: QuizQuestion[] } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [form, setForm] = useState<EditQuizFormState>({
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

  const [showAiConfig, setShowAiConfig] = useState(false);

  async function handleSave(publish?: boolean) {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      await updateQuizAction(quiz.id, {
        title: form.title,
        description: form.description,
        timeLimit: form.timeLimit * 60,
        isPublished: publish ?? form.isPublished,
        questions: questions.map((q, i) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          order: i,
        })),
      });
      toast.success("Quiz updated!");
      router.push("/teacher/quizzes");
      router.refresh();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setShowDeleteConfirm(false);
    try {
      await deleteQuizAction(quiz.id);
      toast.success("Quiz deleted");
      router.push("/teacher/quizzes");
      router.refresh();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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

      <EditQuizForm form={form} setForm={setForm} />

      <QuestionEditor
        questions={questions}
        setQuestions={setQuestions}
        showAiConfig={showAiConfig}
        onShowAiConfig={() => setShowAiConfig(!showAiConfig)}
      />

      {showAiConfig && (
        <AiGeneratorConfig
          onGenerate={(newQuestions) => setQuestions((prev) => [...prev, ...newQuestions])}
          onClose={() => setShowAiConfig(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteQuizModal
          loading={loading}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-3">
          <Link href="/teacher/quizzes" className="px-6 py-3 rounded-full border border-border text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-foreground transition-all">
            Cancel
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="px-6 py-3 rounded-full border border-rose-500/40 text-rose-400 text-sm font-medium hover:bg-rose-500/10 hover:border-rose-500/60 transition-all disabled:opacity-50"
          >
            Delete Quiz
          </button>
        </div>
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
