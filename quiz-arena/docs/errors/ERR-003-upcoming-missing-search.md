# ERR-003 — Upcoming Page Missing Search Bar

**Date:** 2026-07-16  
**Severity:** 🟡 Feature Gap  
**Status:** ✅ Fixed  

---

## Affected Files

- [`src/app/(dashboard)/student/upcoming/page.tsx`](../../src/app/(dashboard)/student/upcoming/page.tsx)
- [`src/components/student/StudentView.tsx`](../../src/components/student/StudentView.tsx)

---

## Symptoms

- The **Upcoming** page (`/student/upcoming`) had no way to filter or search quizzes by title.
- All other search-enabled pages (Teacher Quizzes, Student Classrooms, Classroom Detail) already had search bars.
- The Upcoming page was the only one left out.

---

## Root Cause

The `upcoming/page.tsx` was written as a simple server component that fetched all quizzes and passed them directly to `StudentView`. No `searchParams` were read, no search bar was rendered, and the `StudentView` component received no search query.

```tsx
// ❌ Before: no search support
export default async function StudentDashboard() {
  const quizzes = await prisma.quiz.findMany({ where: { ... } });
  return (
    <div>
      <StudentView quizzes={quizzes} view="upcoming" />
    </div>
  );
}
```

---

## Fix

Three changes were made:

### 1. `upcoming/page.tsx` — Accept `searchParams`, filter server-side, render `SearchBar`

```tsx
export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const quizzes = await prisma.quiz.findMany({
    where: {
      ...
      ...(q && { title: { contains: q, mode: "insensitive" } }),
    },
  });

  return (
    <div>
      <div className="flex ...">
        <h1>Upcoming Quizzes</h1>
        <SearchBar placeholder="Search quizzes..." />
      </div>
      <StudentView quizzes={quizzes} view="upcoming" searchQuery={q} />
    </div>
  );
}
```

### 2. `StudentView.tsx` — Accept `searchQuery` prop for contextual empty states

The `searchQuery` prop is used to show a "No matches found" message when the server-side filter returns no quizzes, instead of the generic "No upcoming quizzes" message.

### 3. Empty state messaging

When `searchQuery` is active but no quizzes match, the component now shows:
> **No matches found** — No quizzes matching "math".

Instead of the misleading:
> **No upcoming quizzes** — Check back later…
