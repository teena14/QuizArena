import type { Metadata } from "next";
import { Inter, Host_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { CommandPalette } from "@/components/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host",
  display: "swap",
});

const BASE_URL = "https://quizarena-gpr1.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "QuizArena — Competitive Quiz Platform",
    template: "%s | QuizArena",
  },
  description:
    "QuizArena is a free quiz platform where teachers build timed MCQ quizzes and students compete for the top spot on a live leaderboard. No credit card required.",
  keywords: ["quiz platform", "online quiz", "education", "leaderboard", "MCQ", "teacher tools", "student quiz"],

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    type: "website",
    siteName: "QuizArena",
    title: "QuizArena — Quiz. Compete. Win.",
    description:
      "QuizArena is a free quiz platform where teachers build timed MCQ quizzes and students compete for the top spot on a live leaderboard.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "QuizArena — Quiz. Compete. Win.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "QuizArena — Quiz. Compete. Win.",
    description:
      "Free quiz platform: teachers build timed quizzes, students compete on live leaderboards.",
    images: [`${BASE_URL}/opengraph-image`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${hostGrotesk.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Skip-to-content — required for WCAG 2.4.1 keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:gradient-brand focus:text-white focus:font-bold focus:text-sm"
        >
          Skip to main content
        </a>
        <SessionProvider>
          {children}
          <CommandPalette />
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
