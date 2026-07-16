import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { QuestionDraft } from "@/types";

interface AiGeneratorConfigProps {
  onGenerate: (newQuestions: QuestionDraft[]) => void;
  onClose: () => void;
}

export function AiGeneratorConfig({ onGenerate, onClose }: AiGeneratorConfigProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"topic" | "pdf">("topic");
  const [aiTopic, setAiTopic] = useState("");
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiCount, setAiCount] = useState(5);

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
      
      const newQuestions = data.questions.map((q: { text: string; options: [string, string, string, string]; correctIndex: number }) => ({
        id: crypto.randomUUID(),
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
      }));
      
      onGenerate(newQuestions);
      toast.success(`Generated ${newQuestions.length} questions successfully!`);
      onClose();
    } catch {
      toast.error("An error occurred during generation");
    } finally {
      setAiLoading(false);
    }
  }

  return (
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

        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            Cancel
          </button>
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
  );
}
