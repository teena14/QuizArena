# QuizArena 🏆

A full-stack, multi-role quiz platform built with Next.js 16, Prisma v7, Supabase, and NextAuth v5.

## Features

- **Role-based access** — Teacher and Student accounts
- **Quiz Builder** — Teachers create MCQ quizzes with dynamic question editor
- **Timed Quizzes** — Countdown timer with auto-submit on expiry
- **Server-side Grading** — Correct answers never sent to the client
- **Per-Quiz Leaderboard** — Ranked by score then time
- **Results Breakdown** — Correct/wrong/skipped per question with answer reveal
- **One attempt per student** — Enforced by unique constraint in the DB

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-first, OKLCH colors) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma v7 with `@prisma/adapter-pg` |
| Auth | NextAuth v5 (Credentials + bcryptjs) |
| UI | shadcn/ui compatible components |
| Toasts | Sonner |

## Setup

### 1. Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 2. Clone & Install

```bash
git clone <repo>
cd quiz-arena
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Get both DB URLs from: **Supabase Dashboard → Project Settings → Database → Connection String → ORM tab**

### 4. Generate Prisma Client & Push Schema

```bash
npx prisma generate
npx prisma db push
```

> `db push` creates all tables in your Supabase database directly.

### 5. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & Register pages
│   ├── (dashboard)/
│   │   ├── teacher/         # Teacher dashboard, quiz CRUD
│   │   └── student/         # Student quiz browser
│   ├── (quiz)/
│   │   └── quiz/[id]/       # Lobby, Take, Results pages
│   └── api/
│       ├── auth/            # NextAuth handler
│       ├── register/        # User registration
│       ├── teacher/quizzes/ # Teacher CRUD APIs
│       └── quiz/[id]/       # Public quiz, submit, leaderboard
├── components/
│   ├── layout/              # Sidebar
│   └── teacher/             # EditQuizClient, QuizActionsMenu
├── lib/
│   ├── prisma.ts            # Prisma client (with PrismaPg adapter)
│   ├── auth.config.ts       # NextAuth credentials config
│   └── utils.ts             # cn(), formatTime(), score helpers
├── auth.ts                  # NextAuth exports
├── middleware.ts             # Route protection + role guards
└── types/next-auth.d.ts     # Session type augmentation
prisma/
└── schema.prisma            # DB schema
prisma.config.ts             # Prisma v7 CLI config
```

## User Flows

### Teacher
1. Register with role **Teacher** → redirected to `/teacher`
2. Create a quiz: title, description, time limit, questions with 4 options
3. Publish quiz → students can now see it
4. View results → per-student scores on the leaderboard

### Student
1. Register with role **Student** → redirected to `/student`
2. Browse published quizzes → click **Start Quiz**
3. Read rules on the lobby page → click **Start Quiz**
4. Answer MCQ questions with countdown timer
5. Submit manually or timer auto-submits
6. View score, answer breakdown, and class leaderboard

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Set all env vars in Vercel Dashboard → Settings → Environment Variables.
