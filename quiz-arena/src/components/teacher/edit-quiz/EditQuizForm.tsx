import React from "react";

export interface EditQuizFormState {
  title: string;
  description: string;
  timeLimit: number; // in minutes for UI
  isPublished: boolean;
}

interface EditQuizFormProps {
  form: EditQuizFormState;
  setForm: React.Dispatch<React.SetStateAction<EditQuizFormState>>;
}

export function EditQuizForm({ form, setForm }: EditQuizFormProps) {
  return (
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
  );
}
