// src/app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import crypto from 'crypto';
import logger from '@/utils/logger.server';
import { z } from 'zod';

// Define the schema for validating the request body
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Validate input data
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('Invalid input data for forgot-password.', { errors: parsed.error.errors });
      return NextResponse.json(
        { error: 'Invalid email address.', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // First try to find user in the User table
    let user = await prisma.user.findUnique({ where: { email } });
    let isReferralUser = false;
    let userId = null;

    // If not found in User table, try the referralUser table
    if (!user) {
      const referralUser = await prisma.referralUser.findUnique({ where: { email } });
      if (referralUser) {
        user = referralUser;
        isReferralUser = true;
        userId = referralUser.id;
      }
    } else {
      userId = user.id;
    }

    if (!user) {
      // To prevent email enumeration, respond with success even if user doesn't exist
      logger.warn('Forgot password requested for non-existent email.', { email });
      return NextResponse.json(
        { message: 'If that email is registered, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Create or update password reset token based on user type
    if (isReferralUser) {
      await prisma.passwordReset.upsert({
        where: { referralUserId: userId },
        update: { token, expiresAt },
        create: { referralUserId: userId, token, expiresAt },
      });
    } else {
      // For regular users, we need to handle differently
      // Check if the schema supports userId in passwordReset table
      try {
        await prisma.passwordReset.upsert({
          where: { userId: userId },
          update: { token, expiresAt },
          create: { userId: userId, token, expiresAt },
        });
      } catch (error) {
        // If the schema doesn't support userId, log the error
        logger.error('Error creating password reset token for regular user', { error, userId });
        // Still return success to prevent email enumeration
        return NextResponse.json(
          { message: 'If that email is registered, you will receive a password reset link.' },
          { status: 200 }
        );
      }
    }

    // Create password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send password reset email
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,<br/>Your Company Team</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: emailContent,
    });

    logger.info('Password reset email sent.', { userId, email });

    return NextResponse.json(
      { message: 'If that email is registered, you will receive a password reset link.' },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error in forgot-password.', { error: error.message });
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
