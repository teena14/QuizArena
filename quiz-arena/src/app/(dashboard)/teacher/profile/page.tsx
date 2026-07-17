import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/shared/ProfileClient";

export const metadata = {
  title: "Profile | Teacher Dashboard",
};

export default async function TeacherProfilePage() {
  const session = await auth();
  const user = session?.user as { id: string; name: string; email: string; role: string; image?: string | null } | undefined;

  if (!user || user.role !== "TEACHER") {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}
