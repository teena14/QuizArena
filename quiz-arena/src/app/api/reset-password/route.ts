import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import nodemailer from "nodemailer";

const requestSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().length(6), // OTP is exactly 6 digits
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Reset password with OTP
    if (body.token) {
      const parsed = resetSchema.parse(body);
      const hashedClientToken = crypto.createHash("sha256").update(parsed.token).digest("hex");
      
      const user = await prisma.user.findFirst({
        where: {
          resetToken: hashedClientToken,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid or expired OTP." },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(parsed.password, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "RESET_PASSWORD",
          resource: "User",
        },
      });

      return NextResponse.json({ success: true });
    }

    // Request OTP with email
    const parsed = requestSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (user) {
      // Generate a 6-digit OTP (e.g., "049182")
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Hash at rest for security against DB leaks
      const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");
      // 15 minute TTL
      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: expiry,
        },
      });

      // Send Email via Nodemailer if credentials exist
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"QuizArena Support" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: "Your QuizArena Password Reset Code",
          text: `Your password reset code is: ${otp}\n\nThis code expires in 15 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset</h2>
              <p>You requested a password reset for your QuizArena account.</p>
              <p>Your one-time code is:</p>
              <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; color: #18181b;">
                ${otp}
              </div>
              <p style="color: #71717a; font-size: 14px; margin-top: 24px;">
                This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      } else {
        console.warn(`[DEV MODE] Password reset OTP for ${user.email}: ${otp}`);
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
