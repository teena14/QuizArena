import type { MetadataRoute } from "next";

const BASE_URL = "https://quizarena-gpr1.onrender.com";

/**
 * /sitemap.xml
 *
 * Covers all publicly crawlable pages.
 * Auth-required routes (/teacher, /student, /quiz) are excluded —
 * they are also blocked in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date("2025-07-15"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date("2025-07-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date("2025-07-15"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date("2025-07-15"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/docs/getting-started`,
      lastModified: new Date("2025-07-15"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/docs/features`,
      lastModified: new Date("2025-07-15"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
