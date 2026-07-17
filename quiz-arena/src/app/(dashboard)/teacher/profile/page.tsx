import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/shared/ProfileClient";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Profile | Teacher Dashboard",
};

export default async function TeacherProfilePage() {
  const session = await auth();
  const user = session?.user as { id: string; name: string; email: string; role: string; image?: string | null } | undefined;

  if (!user || user.role !== "TEACHER") {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { image: true } });

  return <ProfileClient user={{ ...user, image: dbUser?.image }} />;
}
