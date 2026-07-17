"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(name: string, imageBase64: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Name cannot be empty" };
    }

    const data: { name: string; image?: string | null } = { name: name.trim() };
    if (imageBase64 !== undefined) {
      data.image = imageBase64;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    // Revalidate layouts that might use user data
    revalidatePath("/teacher", "layout");
    revalidatePath("/student", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "An unexpected error occurred while deleting your account." };
  }
}
