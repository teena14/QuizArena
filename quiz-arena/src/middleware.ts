import { NextResponse } from "next/server";
import { authConfig } from "./lib/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

// In-memory rate limiting map for Edge (clears on cold start, but adds basic protection without Redis)
const rateLimits = new Map<string, { count: number; timestamp: number }>();

export default auth((req) => {
  const { nextUrl } = req;
  const isAuth = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting on sensitive routes (login submissions and registrations)
  const isRateLimitedPath = 
    nextUrl.pathname === "/api/auth/callback/credentials" || 
    nextUrl.pathname === "/api/register" || 
    nextUrl.pathname === "/api/reset-password";

  if (isRateLimitedPath) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 mins
    const maxAttempts = 5;

    const record = rateLimits.get(ip);
    if (record) {
      if (now - record.timestamp < windowMs) {
        if (record.count >= maxAttempts) {
          // Calculate retry-after in seconds
          const retryAfter = Math.ceil((windowMs - (now - record.timestamp)) / 1000);
          return NextResponse.json(
            { error: "Too Many Requests. Please try again later." },
            { status: 429, headers: { "Retry-After": retryAfter.toString() } }
          );
        }
        record.count++;
      } else {
        rateLimits.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimits.set(ip, { count: 1, timestamp: now });
    }
  }

  // RBAC protection
  if (nextUrl.pathname.startsWith("/teacher")) {
    if (!isAuth) return NextResponse.redirect(new URL("/login", nextUrl));
    if (role !== "TEACHER") return NextResponse.redirect(new URL("/student", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/student")) {
    if (!isAuth) return NextResponse.redirect(new URL("/login", nextUrl));
    if (role !== "STUDENT") return NextResponse.redirect(new URL("/teacher", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/api/teacher")) {
    if (!isAuth || role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });
  }

  if (nextUrl.pathname.startsWith("/api/student")) {
    if (!isAuth || role !== "STUDENT") return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  // Matcher for middleware: run on all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
