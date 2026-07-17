import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  robots: { index: false, follow: false },
};

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { id: string; name: string; email: string; role: string; image?: string | null } | undefined;

  if (!user || user.role !== "TEACHER") redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { image: true } });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="TEACHER" userName={user.name} userEmail={user.email} userImage={dbUser?.image} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
