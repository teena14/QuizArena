import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        if (!user.password) return null;
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        try {
          // Find existing user
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            const intendedRole = cookieStore.get("quizarena_intended_role")?.value;
            const newRole = intendedRole === "TEACHER" ? "TEACHER" : "STUDENT";

            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "OAuth User",
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                emailVerified: new Date(),
                role: newRole,
              },
            });
          }
          
          // Attach role to user object so jwt callback picks it up
          user.id = existingUser.id;
          (user as unknown as { role: string }).role = existingUser.role;
          return true;
        } catch (error) {
          console.error("Google OAuth signIn error:", error);
          return false;
        }
      }
      return true; // Credentials flow
    },
  },
});
