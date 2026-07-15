import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  robots: { index: false, follow: false },
};

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { id: string; name: string; email: string; role: string } | undefined;

  if (!user || user.role !== "TEACHER") redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="TEACHER" userName={user.name} userEmail={user.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
