# ERR-005 — Create Quiz Page Returns 404

**Date:** 2026-07-16  
**Severity:** 🔴 Critical  
**Status:** ✅ Fixed (root cause was ERR-006)  

---

## Affected Pages

- `/teacher/quizzes/new`

---

## Symptoms

- Navigating to `/teacher/quizzes/new` (via the "Create Quiz" button) returned a **404 Not Found** or **Internal Server Error** page.
- The page file `src/app/(dashboard)/teacher/quizzes/new/page.tsx` exists and is structurally correct.
- The teacher layout, middleware, and API routes all looked correct on inspection.

---

## Investigation

The following were checked and ruled out:

| Check | Result |
|---|---|
| `new/page.tsx` exists | ✅ File present with correct content |
| Route conflict with `[id]` segment | ✅ No conflict — `[id]` has no `page.tsx` directly, only `edit/` and `results/` sub-routes |
| Teacher layout auth guard | ✅ Correct role check |
| Middleware RBAC | ✅ Correct path protection |
| `updateQuizSchema` validation | ✅ Schema accepts the payload shape |
| Next.js config | ✅ No problematic redirects or rewrites |

---

## Root Cause

The 404/error was a **symptom of a deeper auth failure** (see [ERR-006](./ERR-006-auth-session-internal-error.md)).

When `AUTH_SECRET` is missing, Auth.js v5 cannot sign or verify JWTs. The `/api/auth/session` endpoint throws an unhandled exception, which bubbled up as an Internal Server Error. Because the teacher layout calls `auth()` server-side and the session was broken, the page failed to render — appearing as a 404 or error page depending on how Next.js handled the uncaught exception.

Additionally, the `.next` build cache had become corrupted (Turbopack "Compaction failed" errors), which prevented proper page compilation.

---

## Fix

Two actions resolved this:

1. **Added `AUTH_SECRET` to `.env`** (see [ERR-006](./ERR-006-auth-session-internal-error.md) for details).
2. **Cleared the `.next` cache** and restarted the dev server:
   ```powershell
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

After these fixes, `/teacher/quizzes/new` loads and functions correctly.
