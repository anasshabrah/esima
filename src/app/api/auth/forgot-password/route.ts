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

    // Normalize email to lowercase for a case-insensitive lookup
    const normalizedEmail = parsed.data.email.toLowerCase();

    // First try to find the referral user in the referralUser table
    let user = await prisma.referralUser.findUnique({ where: { email: normalizedEmail } });
    let isReferralUser = !!user;
    let userId = user ? user.id : null;

    // If not found in referralUser table, then check the regular User table
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      // If the email exists only in User table, then we don't support password reset (per schema)
      if (user) {
        logger.error('Password reset token creation for regular users is not supported by the schema.', { userId: user.id });
        return NextResponse.json(
          { message: 'If that email is registered, you will receive a password reset link.' },
          { status: 200 }
        );
      }
    }

    if (!user) {
      logger.warn('Forgot password requested for non-existent email.', { email: normalizedEmail });
      // Always return success to prevent email enumeration
      return NextResponse.json(
        { message: 'If that email is registered, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate a secure token and set expiration (1 hour from now)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // For referral users, create or update the password reset token
    if (isReferralUser && userId) {
      const upsertResult = await prisma.passwordReset.upsert({
        where: { referralUserId: userId },
        update: { token, expiresAt },
        create: { referralUserId: userId, token, expiresAt },
      });
      logger.info('Password reset token upsert successful.', { upsertResult });
    } else {
      // This branch shouldn't be reached because regular users are handled above
      logger.error('Unexpected branch: regular user found in forgot-password after referral lookup.', { userId });
      return NextResponse.json(
        { message: 'If that email is registered, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Build the password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Prepare the email content
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.name || 'User'},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,<br/>Your Company Team</p>
    `;

    // Log the email content for debugging purposes
    logger.info('Prepared password reset email content.', { to: normalizedEmail, resetLink });

    // Send the password reset email
    await sendEmail({
      to: normalizedEmail,
      subject: 'Password Reset Request',
      html: emailContent,
    });

    logger.info('Password reset email sent successfully.', { userId, email: normalizedEmail });

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
