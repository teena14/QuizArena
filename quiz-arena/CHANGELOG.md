# Changelog

All notable changes to QuizArena are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-07-15

### Added
- **Role-based auth** — Teacher and Student accounts with JWT sessions via NextAuth v5
- **Quiz Builder** — Teachers can create, edit, publish, and delete MCQ quizzes with a dynamic question editor
- **Timed quiz engine** — Client-side countdown timer with automatic submission on expiry
- **Server-side grading** — `correctIndex` is never exposed to the client; grading runs entirely in a Prisma transaction
- **Per-quiz leaderboard** — Students ranked by score descending, then time taken ascending
- **Results breakdown** — Per-question reveal of correct / wrong / skipped answers after submission
- **One-attempt enforcement** — Unique constraint on `(quizId, studentId)` prevents re-takes at the database level
- **Route protection** — Next.js middleware guards all protected routes and enforces role-based redirects on the Edge
- **Supabase + Prisma v7** — Transaction pooler for runtime, direct connection for migrations via `prisma.config.ts`
- **Responsive UI** — Glassmorphism design system built with Tailwind CSS v4 (OKLCH colors, CSS-first config)
- **CI workflow** — GitHub Actions runs lint, typecheck, and build on every push and pull request

### Technical
- Next.js 16 App Router with React Server Components
- Prisma v7 with `@prisma/adapter-pg` for serverless-safe connection pooling
- NextAuth v5 Credentials provider with `bcryptjs` password hashing
- TypeScript strict mode throughout
- ESLint + `eslint-config-next` for code quality

---

## [Unreleased]

### Planned
- [ ] Class-code system — Students join a teacher's class and only see that teacher's quizzes
- [ ] Question bank — Reuse questions across multiple quizzes
- [ ] Rich text questions — Markdown or image support in question body
- [ ] CSV export — Teachers download results as a spreadsheet
- [ ] Email notifications — Notify students when a new quiz is published
