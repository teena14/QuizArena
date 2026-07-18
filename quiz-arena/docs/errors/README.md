# Error Log — QuizArena

This folder documents every significant error encountered during development, including root cause analysis and the fix applied.

---

## Index

| # | Error | Severity | File | Date |
|---|---|---|---|---|
| 1 | [Search bar causes infinite navigation loop](#) | 🔴 Critical | [ERR-001-search-infinite-loop.md](./ERR-001-search-infinite-loop.md) | 2026-07-16 |
| 2 | ["View Results" button leads to 404](#) | 🔴 Critical | [ERR-002-view-results-404.md](./ERR-002-view-results-404.md) | 2026-07-16 |
| 3 | [Upcoming page missing search bar](#) | 🟡 Feature Gap | [ERR-003-upcoming-missing-search.md](./ERR-003-upcoming-missing-search.md) | 2026-07-16 |
| 4 | [StudentView filters teachers by name instead of quiz title](#) | 🟠 Logic Bug | [ERR-004-studentview-wrong-filter.md](./ERR-004-studentview-wrong-filter.md) | 2026-07-16 |
| 5 | [Create Quiz page returns 404 / Internal Server Error](#) | 🔴 Critical | [ERR-005-create-quiz-404.md](./ERR-005-create-quiz-404.md) | 2026-07-16 |
| 6 | [Auth session returns Internal Server Error (ClientFetchError)](#) | 🔴 Critical | [ERR-006-auth-session-internal-error.md](./ERR-006-auth-session-internal-error.md) | 2026-07-16 |
| 7 | [AI Quiz Generation Returns 502 Bad Gateway](#) | 🔴 Critical | [ERR-009-ai-generation-502.md](./ERR-009-ai-generation-502.md) | 2026-07-18 |
---

## Severity Legend

| Icon | Severity | Meaning |
|---|---|---|
| 🔴 | Critical | Crashes, broken core flow, or 500/404 errors |
| 🟠 | Logic Bug | Incorrect behavior that silently produces wrong results |
| 🟡 | Feature Gap | Missing feature that was expected to be present |
| 🟢 | Minor | Visual glitch, UX polish, or non-breaking issue |
