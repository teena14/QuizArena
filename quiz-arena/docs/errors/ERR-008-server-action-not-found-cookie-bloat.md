# Server Action Not Found / Cookie Bloat

## Symptoms
- Saving the user profile (specifically uploading a profile picture) takes an extremely long time.
- Clicking the profile picture on the sidebar takes an unusually long time to render.
- Submitting the form results in an `UnrecognizedActionError: Server Action ... was not found on the server`.
- Inspecting the browser network tab reveals headers that are multiple megabytes in size.

## Root Cause
When the user uploaded a profile picture, the client-side component converted it into a base64 string (which can be up to 1MB). The `updateProfile` server action correctly stored this base64 string in the database.

However, the NextAuth configuration (`auth.config.ts`) was set to store the entire `user.image` inside the encrypted JWT session token. Because the JWT is stored in an HTTP cookie, Next.js was attempting to serialize a 1MB base64 string into a cookie header.

Modern browsers strictly limit cookies to 4KB. By forcing NextAuth to shove 1MB into the cookie, several things broke:
1. The cookie was either fragmented endlessly or truncated, causing severe performance issues during request serialization/deserialization.
2. The massive headers exceeded Node.js and Next.js request header size limits, causing the server action invocation payload to fail parsing. This resulted in Next.js throwing the `UnrecognizedActionError`.
3. Every server-side and client-side render had to pass this 1MB string through the DOM (in the sidebar component), slowing down React hydration and layout thrashing.

## Fix Implementation
We removed the base64 image from the session cookie entirely and moved to a direct database fetch for the layout.

1. **`auth.config.ts`**:
   Removed `token.image = session.image` and `session.user.image = token.image`. The session cookie now only stores lightweight identifiers (`id`, `name`, `role`).

2. **Server Component Layouts** (`teacher/layout.tsx` and `student/layout.tsx`):
   Instead of passing the image from the session to the `Sidebar`, the layouts now perform a lightweight Prisma query (`findUnique` with `select: { image: true }`) to fetch the base64 string directly from the database and pass it to the sidebar.

3. **`ProfileClient.tsx`**:
   Removed `image` from the `update()` call. The client now only calls `await update({ name })` to sync the name in the JWT. The subsequent `router.refresh()` triggers the server layout to re-fetch the new image from the database.
