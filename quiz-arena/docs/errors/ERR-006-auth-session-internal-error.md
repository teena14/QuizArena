# ERR-006 — Auth Session Returns Internal Server Error (ClientFetchError)

**Date:** 2026-07-16  
**Severity:** 🔴 Critical  
**Status:** ✅ Fixed  

---

## Affected Files

- [`.env`](../../.env)

---

## Error Message

```
ClientFetchError: Unexpected token 'I', "Internal S"... is not valid JSON.
Read more at https://errors.authjs.dev#autherror

    at fetchData (.next/dev/static/chunks/node_modules_0v-cj9f._.js:1609:22)
    at async getSession (.next/dev/static/chunks/node_modules_0v-cj9f._.js:1776:21)
    at async SessionProvider.useEffect [as _getSession] (...)
```

---

## Symptoms

- All authenticated pages threw an Internal Server Error on load.
- The browser console showed `ClientFetchError` with `"Unexpected token 'I'"`.
- The `/api/auth/session` endpoint returned plain text `"Internal Server Error"` instead of a JSON object.
- The `SessionProvider` in `layout.tsx` tried to parse that text as JSON → threw `SyntaxError` → wrapped as `ClientFetchError`.
- Side effect: the teacher dashboard and create quiz page appeared as 404s because `auth()` was crashing server-side.

---

## Root Cause

The project uses **next-auth v5 (beta)** (`"next-auth": "^5.0.0-beta.31"`), which is Auth.js v5. This version **renamed all environment variables**, dropping the `NEXTAUTH_` prefix:

| next-auth v4 | next-auth v5 (Auth.js) |
|---|---|
| `NEXTAUTH_SECRET` | `AUTH_SECRET` |
| `NEXTAUTH_URL` | `AUTH_URL` |

The `.env` file still used the **v4 variable names**:

```env
# ❌ These are ignored by next-auth v5
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=my-super-secret-key-for-nextauth-32-chars
```

Without `AUTH_SECRET`, Auth.js v5 cannot:
- Sign JWT tokens on login
- Verify JWT tokens on any request
- Return a valid session from `/api/auth/session`

Instead, it throws an unhandled error → Express/Node returns "Internal Server Error" as plain text → `SessionProvider.getSession()` gets non-JSON → `ClientFetchError`.

---

## Fix

Added the correct v5 variable names to `.env`, pointing to the same values:

```env
# Auth.js v5 (next-auth@^5) uses AUTH_SECRET / AUTH_URL instead of NEXTAUTH_*
AUTH_SECRET=my-super-secret-key-for-nextauth-32-chars
AUTH_URL=http://localhost:3000
```

Also cleared the corrupted Turbopack cache and restarted the dev server:

```powershell
Stop-Process -Id <old-process-id> -Force
Remove-Item -Recurse -Force .next
npm run dev
```

After these steps, `/api/auth/session` returned `200` with a valid JSON session object.

---

## Prevention

- When upgrading `next-auth` from v4 to v5, always rename env vars from `NEXTAUTH_*` to `AUTH_*`.
- The `.env.example` file should be updated to reflect v5 variable names so future contributors don't hit the same issue.
- Auth.js v5 will log a warning to the server console if `AUTH_SECRET` is missing — monitor server logs during setup.

---

## Related

- [ERR-005 — Create Quiz 404](./ERR-005-create-quiz-404.md) was a downstream symptom of this error.
