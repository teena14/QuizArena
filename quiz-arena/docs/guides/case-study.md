# QuizArena — Case Study

## The Problem

Most classroom quiz tools either cost money (Kahoot! at $10/mo per teacher), require no-code setup that limits flexibility, or don't give teachers ownership of their data. I wanted to build a lean, self-hostable alternative that a developer could clone, configure, and own — while still feeling polished enough for real classroom use.

**Core job-to-be-done:** A teacher should be able to build a quiz, share it with a class, and see ranked results — in under five minutes, from any device, for free.

---

## Technical Decisions

### 1. Server-side grading — the hard constraint that shaped everything

The most important design decision was to **never send `correctIndex` to the browser**. In a typical MCQ app you might fetch all question data including correct answers and do client-side grading. That's fast but cheatable — any student who opens DevTools wins.

QuizArena's `/api/quiz/[id]` route deliberately strips `correctIndex` from the Prisma `select`. Grading runs in a single Prisma transaction on the server after submission:

```ts
// Server fetches ground truth, student never sees it
const questions = await prisma.question.findMany({
  where: { quizId },
  select: { id: true, correctIndex: true } // server-only
});
const score = submitted.answers.filter(
  a => a.selectedIndex === groundTruth[a.questionId]
).length;
```

The trade-off: slightly higher server load per submission vs. guaranteed tamper-proof results. For a classroom context (dozens not millions of submissions), this is the right call.

### 2. One attempt per student — data layer, not application layer

The uniqueness constraint on `(quizId, studentId)` lives in the database, not just in the UI:

```prisma
@@unique([quizId, studentId]) // quiz_attempts table
```

This means even if a student clears cookies, uses a different browser, or finds a direct API URL, the DB rejects a second insert. The application layer just surfaces the error gracefully.

### 3. Supabase connection pooling — two URLs, two purposes

Supabase exposes two connection endpoints. Using the wrong one for the wrong purpose causes subtle failures:

| Endpoint | Port | Use | Why |
|---|---|---|---|
| Transaction pooler | 6543 | App runtime (`DATABASE_URL`) | Serverless-safe; short-lived connections |
| Direct host | 5432 | Prisma CLI (`DIRECT_URL`) | `db push` needs long-lived DDL connections |

Mixing these up causes `prisma db push` to hang on pgbouncer's transaction mode. Keeping them explicitly separated in `.env.example` and `prisma.config.ts` makes this a non-issue for anyone cloning the repo.

### 4. NextAuth v5 split config — Edge middleware + Node credentials

NextAuth v5 can't use Node.js APIs (like `bcryptjs`) on the Edge runtime. The solution: two config files.

- `src/lib/auth.config.ts` — Edge-safe, used by `middleware.ts` for JWT verification and route guards
- `src/auth.ts` — Full Node.js config with the Credentials provider and bcrypt password checking

This means the middleware (which runs on every request) stays lightweight, while actual credential verification only happens during sign-in on a Node.js runtime.

---

## What I'd Do Differently

- **Migrate from `db push` to `prisma migrate dev`** — `db push` is fast for prototyping but loses migration history. For v2 I'd commit migrations so schema changes are reproducible and reversible.
- **Add optimistic UI on quiz actions** — Publish/unpublish currently does a full server round-trip. A `useOptimistic` hook would make it feel instant.
- **Extract `TakeQuizPage` into smaller components** — the take-quiz client component is the largest in the codebase (~400 lines). It mixes timer logic, answer state, and submission — three separate concerns that would benefit from hooks extraction.

---

## Results

- ⚡ Quiz creation to first student attempt: **< 2 minutes**
- 🔒 Zero correct answers exposed to the client across the entire quiz-taking flow
- 📱 Fully responsive — tested on mobile, tablet, and desktop
- ✅ TypeScript strict, ESLint clean, CI on every push
