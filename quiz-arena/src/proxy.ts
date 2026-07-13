import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Edge-safe: uses authConfig which has no Node.js-only imports
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isTeacherRoute = nextUrl.pathname.startsWith("/teacher");
  const isStudentRoute = nextUrl.pathname.startsWith("/student");
  const isQuizRoute = nextUrl.pathname.startsWith("/quiz");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    const role = req.auth?.user?.role;
    return NextResponse.redirect(
      new URL(role === "TEACHER" ? "/teacher" : "/student", nextUrl)
    );
  }

  // Protect dashboard/quiz routes
  if ((isTeacherRoute || isStudentRoute || isQuizRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Role-based access control
  if (isLoggedIn) {
    const role = req.auth?.user?.role;
    if (isTeacherRoute && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/student", nextUrl));
    }
    if (isStudentRoute && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/teacher", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

