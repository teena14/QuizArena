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

## [1.3.0] — 2026-07-17 (User Profiles)

### Added
- **User Profile Page**: Added `/profile` pages for both teachers and students.
- **Avatar Uploads**: Added the ability to upload a profile picture. The image is validated on the client (max 1MB limit), converted to base64, and stored securely in the database.
- **Account Deletion**: Added a "Danger Zone" allowing users to permanently delete their accounts. This correctly cascades to delete all their associated quizzes and attempts.
- **Clickable Sidebar Profile**: The user profile section in the sidebar is now an interactive button that links to the settings page, and dynamically displays the uploaded avatar if available.

### Fixed
- **Session State Sync**: Resolved an issue where updating the profile in the database did not immediately reflect the new name or avatar in the sidebar. Configured `auth.config.ts` to support the `trigger === "update"` event and implemented `useSession().update()` to instantly sync the client session cookie with new database values.
- **🔴 Server Action Crash & Cookie Bloat** ([ERR-008](docs/errors/ERR-008-server-action-not-found-cookie-bloat.md)): Fixed a critical bug where uploading a 1MB profile image caused the NextAuth session cookie to exceed browser limits, resulting in a server action failure (`UnrecognizedActionError`) and severe UI lag. The image is now excluded from the JWT session entirely and is fetched directly from the database in the layout layer.

---

## [1.2.0] — 2026-07-16 (Production Refactor)

### Changed
- **Type Safety Centralization**: Extracted local types from components (e.g., `Quiz`, `QuizQuestion`) into a shared `src/types/index.ts` file, resolving prop mismatches and duplicate definitions across the codebase.
- **Component Modularity**: Refactored massive 300+ line components (`EditQuizClient`, `DashboardTabs`) by extracting smaller, focused sub-components (`QuizCard`, `EditQuizForm`, `QuestionEditor`, `DeleteQuizModal`, etc.).
- **Server Actions Migration**: Replaced traditional API routes for Quiz CRUD operations with Next.js Server Actions (`src/actions/quiz.ts`), improving type safety, reducing client-side code, and eliminating manual `fetch` calls.
- **Documentation Overhaul**: Reorganized `docs/` folder structure, separating architecture and guides, and tracked all refactoring errors in `docs/errors/`.

---

## [1.1.0] — 2026-07-16

### Added

- **Search bar — Teacher "My Quizzes"**: Already present via `QuizFilters` component; confirmed working with server-side `title contains` filtering and cursor-based pagination reset on new search.
- **Search bar — Student Classrooms** (`/student/classrooms`): Already present via `SearchBar` component; confirmed filtering teachers by name client-side with empty-state feedback.
- **Search bar — Classroom Detail** (`/student/classrooms/[teacherId]`): Already present via `SearchBar`; confirmed server-side quiz title filtering with `?q=` param.
- **Search bar — Upcoming Quizzes** (`/student/upcoming`): **New.** Added `SearchBar`, `searchParams` support, and server-side Prisma `title contains` filter. Empty state now shows contextual "No matches found" message when a search yields no results.
- **Error documentation folder** (`docs/errors/`): New directory with individual Markdown files for every encountered error, including root cause analysis and fix details.

### Fixed

- **🔴 Infinite navigation loop in `SearchBar` and `QuizFilters`** ([ERR-001](docs/errors/ERR-001-search-infinite-loop.md))  
  `searchParams` (a new object reference on every render) was listed as a `useEffect` dependency. Every `router.replace` call triggered a re-render, which provided a new `searchParams` reference, which re-triggered the effect — causing an infinite navigation loop. Fixed by using `searchParams.toString()` (a stable primitive) as the dependency and adding a URL equality guard before calling `router.replace`. Also added a sync effect to update local input state when the URL changes externally (browser back/forward).

- **🔴 "View Results" button leading to 404** ([ERR-002](docs/errors/ERR-002-view-results-404.md))  
  `DashboardTabs.tsx` had a hardcoded `href={/quiz/${quiz.id}/results}` that was missing the required `[attemptId]` segment. The actual App Router path is `/quiz/[id]/results/[attemptId]`. Fixed to `href={/quiz/${quiz.id}/results/${attempt.id}}`, consistent with the already-correct `QuizCard` component.

- **🟠 `StudentView` filtering teachers by name instead of quiz title** ([ERR-004](docs/errors/ERR-004-studentview-wrong-filter.md))  
  When `searchQuery` prop was introduced, a client-side filter was added that matched teachers by name. This was incorrect — the search intent is to find quizzes by title, which is already handled server-side. Teachers with no matching quizzes are automatically excluded from `teachersMap`. Removed the wrong client-side filter; `searchQuery` is now only used for empty-state messaging.

- **🔴 Auth session endpoint returning "Internal Server Error"** ([ERR-006](docs/errors/ERR-006-auth-session-internal-error.md))  
  The project uses next-auth v5 (beta), which renamed all environment variables from `NEXTAUTH_*` to `AUTH_*`. The `.env` file still used the v4 names (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`). Without `AUTH_SECRET`, Auth.js v5 cannot sign/verify JWTs — the `/api/auth/session` endpoint threw an unhandled exception, returning plain text "Internal Server Error". The client-side `SessionProvider` attempted to parse this as JSON, producing a `ClientFetchError`. Fixed by adding `AUTH_SECRET` and `AUTH_URL` to `.env`.

- **🔴 Create Quiz page returning 404** ([ERR-005](docs/errors/ERR-005-create-quiz-404.md))  
  The `/teacher/quizzes/new` page was unreachable due to the auth session failure (ERR-006) crashing `auth()` in the teacher layout. Additionally, the Turbopack build cache had become corrupted ("Compaction failed" errors). Fixed by resolving ERR-006 and clearing the `.next` cache.

### Changed

- **`upcoming/page.tsx`**: Renamed function from `StudentDashboard` to `UpcomingPage`. Added `searchParams` prop, server-side title filtering, page header with `Clock` icon, and `SearchBar`.
- **`StudentView.tsx`**: Added optional `searchQuery?: string` prop. Empty state messaging now adapts based on whether a search query is active.
- **`.env`**: Added `AUTH_SECRET` and `AUTH_URL` for next-auth v5 compatibility, alongside the existing `NEXTAUTH_*` variables.

---

## [1.0.0] — 2025-07-15

