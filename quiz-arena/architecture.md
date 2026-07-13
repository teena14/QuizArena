# Architecture of QuizArena

## High-Level Overview
QuizArena is a full-stack, multi-role web application built with **Next.js 16 (App Router)**, using **React Server Components** alongside Client Components. It relies on a **Supabase (PostgreSQL)** backend and uses **Prisma v7** as the ORM to interact with the database. Authentication is handled by **NextAuth v5 (Auth.js)** with a credentials provider, enforcing role-based access control between Teachers and Students.

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, custom CSS with glassmorphism effects
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma v7 with `@prisma/adapter-pg`
- **Authentication:** NextAuth v5 (Beta) using `bcryptjs` for password hashing
- **UI Components:** shadcn/ui inspired (custom built), `lucide-react` for icons, `sonner` for toast notifications

## Data Model (Prisma)
The database schema consists of five main entities:
- **User:** Stores both Teachers and Students. Includes credentials (email, hashed password) and role (`TEACHER` or `STUDENT`).
- **Quiz:** Created by Teachers. Contains a title, description, time limit, and publish status.
- **Question:** Belongs to a Quiz. Includes text, an array of 4 options, and the `correctIndex` (which is kept server-side only).
- **QuizAttempt:** Records a student's attempt on a quiz. Stores the score, total questions, time taken, and completion time. Has a unique constraint on `(quizId, studentId)` to prevent multiple attempts.
- **Answer:** Belongs to a QuizAttempt and a Question. Records the student's selected option index.

## Directory Structure
- `/src/app`: Contains Next.js routes, layout, and global CSS.
  - `(auth)`: Login and Registration routes.
  - `(dashboard)`: Role-specific dashboards.
    - `/teacher`: Quiz management (list, create, edit, results).
    - `/student`: Quiz browsing and status.
  - `(quiz)`: The quiz-taking flow (lobby, active quiz, results view).
  - `/api`: API routes for authentication, quiz CRUD, and submission logic.
- `/src/components`: Reusable UI components.
  - `/layout`: Layout components like the Sidebar.
  - `/teacher`: Teacher-specific interactive components (e.g., `EditQuizClient`, `QuizActionsMenu`).
- `/src/lib`: Utilities and singletons.
  - `prisma.ts`: Initializes the Prisma client with the Postgres adapter.
  - `auth.config.ts`: Edge-safe NextAuth configuration used by Middleware.
  - `utils.ts`: Helper functions (class merging, time formatting, grading).
- `/src/auth.ts`: Full NextAuth initialization including the Node-only credentials provider.
- `/src/middleware.ts`: Next.js middleware handling route protection and role-based redirects using the edge-safe `authConfig`.

## Authentication Flow & Middleware
Authentication is powered by NextAuth v5.
1. Users register or log in using email and password via `/api/register` or the built-in credentials provider.
2. Upon successful authentication, a JWT session is created, storing the user's ID and role.
3. The `middleware.ts` runs on the Edge runtime and intercepts incoming requests.
4. It redirects unauthenticated users to `/login` if they attempt to access protected routes.
5. It enforces Role-Based Access Control (RBAC): Teachers cannot access `/student` routes and vice versa. It also redirects authenticated users away from `/login` and `/register`.
6. Server-side APIs and components use `auth()` from `src/auth.ts` to verify session state securely.

## Quiz-Taking & Auto-Grading Logic
The quiz-taking mechanism is designed to prevent client-side cheating:
1. **Fetching:** When a student starts a quiz (`/api/quiz/[id]`), the server returns the quiz metadata and questions but **deliberately omits the `correctIndex`** field.
2. **Taking:** The client-side application (`TakeQuizPage`) tracks the time remaining and user selections locally.
3. **Submission:** Upon timer expiration or manual submission, the client sends a `POST` request to `/api/quiz/[id]/submit` containing the selected answers and time taken.
4. **Grading:** The server retrieves the actual `correctIndex` values directly from the database, compares them against the submitted answers, calculates the score, and saves the `QuizAttempt` and individual `Answer` records atomically within a Prisma transaction.
5. **Results:** The client redirects to the results page, where the full breakdown of correct and incorrect answers is finally revealed to the student.

## Database Connection Strategy (Supabase + Prisma v7)
Supabase provides two types of connection poolers: Session (port 5432) and Transaction (port 6543).
- **Runtime (`DATABASE_URL`):** Uses the Transaction Pooler (port 6543) with `pgbouncer=true`. The Next.js application connects using Prisma's `@prisma/adapter-pg` which is optimized for serverless/edge environments.
- **Migrations/CLI (`DIRECT_URL`):** Uses the Direct Database Host (port 5432) bypassing the pooler entirely, requiring `sslmode=require`. This is necessary because Prisma's `db push` and migrations require long-lived connections for DDL operations, which are incompatible with transaction mode pgbouncer.
- `prisma.config.ts` directs the Prisma CLI to use the `DIRECT_URL`.

## Key Client-Side Interactions
- **Quiz Timer:** A React `useEffect` interval manages the countdown state on the client. It automatically triggers the submit function if the timer reaches 0.
- **Dynamic Question Builder:** The `EditQuizClient` component uses standard React state (`useState`) to manage an array of question objects, allowing teachers to add, remove, and update questions and options dynamically before sending the entire payload to the server.
