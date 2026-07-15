# QuizArena

> A timed, multi-role quiz platform where teachers build MCQ quizzes and students compete on a live leaderboard — built with Next.js 16 and Supabase.

![Hero screenshot](docs/screenshots/hero.png)

[![CI](https://github.com/your-username/quiz-arena/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/quiz-arena/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Live demo → [https://quizarena-gpr1.onrender.com](https://quizarena-gpr1.onrender.com)**

---

## Features

- 🏫 **Role-based accounts** — separate Teacher and Student dashboards, enforced at the Edge
- 📝 **Quiz Builder** — teachers create, edit, publish, and delete MCQ quizzes with a dynamic question editor
- ⏱️ **Timed quizzes** — countdown timer auto-submits when time runs out
- 🔒 **Server-side grading** — `correctIndex` is never sent to the browser; cheating is structurally impossible
- 🏆 **Live leaderboard** — students ranked by score, then by time taken
- 📊 **Results breakdown** — per-question correct / wrong / skipped reveal after submission
- 🚫 **One attempt per student** — enforced by a unique DB constraint, not just application logic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-first, OKLCH colors) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma v7 with `@prisma/adapter-pg` |
| Auth | NextAuth v5 — Credentials + bcryptjs |
| Icons / Toasts | lucide-react · Sonner |
| Deployment | Render |

---

## Quick Start

```bash
git clone https://github.com/your-username/quiz-arena.git
cd quiz-arena

cp .env.example .env.local   # fill in your Supabase + NextAuth values

npm install
npx prisma generate
npx prisma db push           # creates all tables in your Supabase DB

npm run dev                  # http://localhost:3000
```

> **Prerequisites:** Node.js 18+ and a free [Supabase](https://supabase.com) project.

---

## Environment Variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler connection string (port **6543**, `?pgbouncer=true`) — used at runtime |
| `DIRECT_URL` | Supabase Direct connection string (port **5432**) — used by Prisma CLI for `db push` |
| `NEXTAUTH_SECRET` | Random secret for signing JWT sessions — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of your app (`http://localhost:3000` in dev, your Render URL in production) |

Both DB URLs are found at: **Supabase Dashboard → Project Settings → Database → Connection String → ORM tab**.

---

## Architecture

QuizArena uses React Server Components for data fetching, Next.js middleware for Edge-based route protection, and a server-side grading flow that never exposes correct answers to the client.

→ **Full details, Mermaid diagrams, and API reference:** [`docs/architecture.md`](docs/architecture.md)

→ **Hard decisions & trade-offs:** [`docs/case-study.md`](docs/case-study.md)

---

## Testing

```bash
npm run typecheck   # TypeScript — zero errors required
npm run lint        # ESLint + Next.js rules
npm run build       # production build smoke-test
```

> Unit and E2E tests are on the [roadmap](#roadmap).

---

## Project Structure

```
quiz-arena/
├── .github/
│   ├── workflows/ci.yml          # lint + typecheck + build on every push
│   ├── ISSUE_TEMPLATE/           # bug_report.md, feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── architecture.md           # ER diagram, auth flow, API reference
│   └── screenshots/
├── prisma/
│   └── schema.prisma             # DB schema (5 models)
├── public/
├── src/
│   ├── app/                      # App Router routes
│   │   ├── (auth)/               # /login  /register
│   │   ├── (dashboard)/          # /teacher  /student
│   │   ├── (quiz)/               # /quiz/[id]  lobby → take → results
│   │   └── api/                  # REST handlers
│   ├── components/
│   │   ├── layout/               # Sidebar
│   │   └── teacher/              # EditQuizClient, QuizActionsMenu
│   ├── lib/                      # prisma.ts, auth.config.ts, utils.ts, validations.ts
│   ├── types/                    # next-auth.d.ts
│   ├── auth.ts                   # full NextAuth init (Node runtime)
│   └── proxy.ts                  # Edge-safe NextAuth re-export
├── tests/                        # unit + e2e (planned)
├── .env.example                  # every variable with safe dummy values
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Roadmap

- [x] Role-based auth (Teacher / Student)
- [x] Quiz Builder with dynamic question editor
- [x] Timed quiz engine with auto-submit
- [x] Server-side grading (correctIndex never leaves the server)
- [x] Per-quiz leaderboard
- [x] Results breakdown with answer reveal
- [ ] Class-code system — students join a teacher's class
- [ ] Question bank — reuse questions across multiple quizzes
- [ ] Rich text / image support in questions
- [ ] CSV export of results
- [ ] AI-generated question suggestions

---

## Screenshots

_Add screenshots to `docs/screenshots/` — the `hero.png` is shown at the top._

---

## User Flows

**Teacher:** Register → Create quiz (title + questions) → Publish → View per-student leaderboard

**Student:** Register → Browse published quizzes → Lobby → Timed MCQ → Submit → Score + breakdown

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit style, and the PR process.

---

## License

MIT — see [LICENSE](./LICENSE).
