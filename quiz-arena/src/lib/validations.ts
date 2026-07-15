import { z } from "zod";

export const joinClassSchema = z.object({
  classCode: z.string().min(1, "Class code is required").max(10).toUpperCase(),
});

export const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.number()),
  timeTaken: z.number().nonnegative(),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  timeLimit: z.number().positive(),
  isPublished: z.boolean().default(false),
});

export const generateQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  questionCount: z.number().min(1).max(20),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().optional().nullable(),
  timeLimit: z.number().positive().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(z.object({
    text: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    correctIndex: z.number().min(0).max(3),
    order: z.number().nonnegative()
  })).optional().default([])
});
