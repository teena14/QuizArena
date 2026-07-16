# ERR-004 — StudentView Filters Teachers by Name Instead of Quiz Title

**Date:** 2026-07-16  
**Severity:** 🟠 Logic Bug  
**Status:** ✅ Fixed  

---

## Affected Files

- [`src/components/student/StudentView.tsx`](../../src/components/student/StudentView.tsx)

---

## Symptoms

- On the Upcoming page, searching for a quiz title like `"React"` would try to find a *teacher* whose name contains "React" — not a quiz with "React" in its title.
- Searching a quiz title would always show "No matches found" even if matching quizzes existed, because no teacher is named after a quiz topic.

---

## Root Cause

When the `searchQuery` prop was first added to `StudentView`, a client-side filter was added that incorrectly filtered the **teacher list** by teacher name:

```tsx
// ❌ Wrong — filters teachers by name, but search intent is to find quizzes by title
const filteredTeachers = searchQuery
  ? teachers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  : teachers;
```

This was logically wrong because:
1. The search bar on the Upcoming page is meant to find **quizzes by title**.
2. The Prisma query in `page.tsx` already filters quizzes by title server-side (via `title: { contains: q }`).
3. Teachers with no matching quizzes automatically disappear from `teachersMap` because the map is built from the (already filtered) quiz list.
4. The client-side teacher-name filter was redundant *and* wrong.

---

## Fix

Removed the client-side teacher-name filter entirely. The server-side query is the single source of truth:

```tsx
// ✅ Correct — server already filtered quizzes; teachers auto-exclude themselves
const teachers = Array.from(teachersMap.values());
// No client-side filtering needed — teachers with no matching quizzes
// are already excluded from teachersMap.
```

The `searchQuery` prop is now **only** used for the empty state message, not for filtering:

```tsx
// Show contextual empty state when search yields no results
{searchQuery ? "No matches found" : "No upcoming quizzes"}
{searchQuery
  ? `No quizzes matching "${searchQuery}".`
  : "Check back later — your teachers are preparing quizzes!"}
```

---

## Notes

- The `searchQuery` prop is intentionally kept on `StudentView` for the empty state UX.
- The actual filtering is now fully server-side in `upcoming/page.tsx`, which is more performant and correct.
