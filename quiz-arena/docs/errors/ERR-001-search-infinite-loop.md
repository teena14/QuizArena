# ERR-001 — Search Bar Causes Infinite Navigation Loop

**Date:** 2026-07-16  
**Severity:** 🔴 Critical  
**Status:** ✅ Fixed  

---

## Affected Files

- [`src/components/shared/SearchBar.tsx`](../../src/components/shared/SearchBar.tsx)
- [`src/components/teacher/QuizFilters.tsx`](../../src/components/teacher/QuizFilters.tsx)

---

## Symptoms

- Typing any character in the search bar triggered a rapid, unending sequence of URL navigations.
- The browser address bar would flicker continuously.
- Network tab showed repeated `router.replace` calls firing in a tight loop.
- Page became unresponsive after a few keystrokes.

---

## Root Cause

Both `SearchBar` and `QuizFilters` used `searchParams` (the raw `ReadonlyURLSearchParams` object) as a dependency in a `useEffect`:

```ts
// ❌ Bug: searchParams is a NEW object reference on every render
useEffect(() => {
  const params = new URLSearchParams(searchParams);
  params.set("q", debouncedSearch);
  router.replace(`${pathname}?${params.toString()}`);
}, [debouncedSearch, pathname, router, searchParams]); // ← searchParams here is the culprit
```

**Why this loops:**  
1. User types → `debouncedSearch` changes → effect runs → `router.replace(...)` is called  
2. `router.replace` causes Next.js to re-render with new `searchParams`  
3. `searchParams` is a *new object reference* on every render, even if the string value is identical  
4. React sees a dependency change → effect runs again → `router.replace` is called again  
5. → Back to step 2, infinite loop

---

## Fix

Replace the `searchParams` object with `searchParams.toString()` (a stable primitive string) as the dependency. Also guard the `router.replace` call so it only fires when the URL would actually change:

```ts
// ✅ Fix: use the serialised string — only changes when content changes
const searchParamsStr = searchParams.toString();

// Sync local state when URL changes externally (browser back/forward)
useEffect(() => {
  setSearch(searchParams.get("q") || "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParamsStr]);

useEffect(() => {
  const params = new URLSearchParams(searchParamsStr);
  params.set("q", debouncedSearch);
  const next = `${pathname}?${params.toString()}`;
  // Guard: only navigate if URL actually changes
  if (next !== `${pathname}?${searchParamsStr}`) {
    router.replace(next);
  }
}, [debouncedSearch, pathname, router, searchParamsStr]);
```

---

## Additional Benefit

The sync effect also handles **browser back/forward navigation** — if the user presses Back to clear the search, the input field now correctly clears itself instead of staying stale.
