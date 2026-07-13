import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { id: string; name: string; email: string; role: string } | undefined;

  if (!user || user.role !== "STUDENT") redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="STUDENT" userName={user.name} userEmail={user.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
