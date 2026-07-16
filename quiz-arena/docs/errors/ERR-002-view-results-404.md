# ERR-002 — "View Results" Button Leads to 404

**Date:** 2026-07-16  
**Severity:** 🔴 Critical  
**Status:** ✅ Fixed  

---

## Affected Files

- [`src/components/student/DashboardTabs.tsx`](../../src/components/student/DashboardTabs.tsx)

---

## Symptoms

- Clicking "View Results" on a completed quiz in the **Student Dashboard** (`/student`) navigated to a 404 page.
- The `QuizCard` component (used in Classrooms and Upcoming pages) was **not** affected.

---

## Root Cause

`DashboardTabs.tsx` had a hardcoded "View Results" link that was missing the `attemptId` segment of the URL path:

```tsx
// ❌ Wrong — route does not exist at this path
<Link href={`/quiz/${quiz.id}/results`}>
  View Results
</Link>
```

The actual route structure in Next.js App Router is:

```
src/app/(quiz)/quiz/[id]/results/[attemptId]/page.tsx
```

So the correct URL requires **both** the quiz ID and the attempt ID. The `QuizCard` component had already implemented this correctly:

```tsx
// ✅ Correct (in QuizCard.tsx — was already correct)
<Link href={`/quiz/${quiz.id}/results/${attempt.id}`}>
  View Results
</Link>
```

---

## Fix

Updated `DashboardTabs.tsx` to include `attempt.id` in the href:

```tsx
// ✅ Fixed
<Link href={`/quiz/${quiz.id}/results/${attempt.id}`}>
  View Results
</Link>
```

---

## Notes

- The `attempt` object was already available in scope (`const attempt = quiz.attempts[0]`) — it just wasn't being used in the link.
- This was a copy-paste inconsistency between `DashboardTabs` (custom card renderer) and `QuizCard` (shared component).
