import type { MetadataRoute } from "next";

/**
 * /robots.txt
 *
 * Allow crawl of public pages only.
 * Disallow auth-required dashboards and API routes — they have no indexable value
 * and expose session-dependent content that differs per user.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/docs/", "/faq"],
        disallow: ["/api/", "/teacher/", "/student/", "/quiz/"],
      },
    ],
    sitemap: "https://quizarena-gpr1.onrender.com/sitemap.xml",
  };
}
