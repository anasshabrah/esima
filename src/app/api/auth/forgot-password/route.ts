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

    // Find ReferralUser by email
    const referralUser = await prisma.referralUser.findUnique({ where: { email } });
    if (!referralUser) {
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

    // Create or update password reset token
    await prisma.passwordReset.upsert({
      where: { referralUserId: referralUser.id },
      update: { token, expiresAt },
      create: { referralUserId: referralUser.id, token, expiresAt },
    });

    // Create password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send password reset email
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Hello ${referralUser.name},</p>
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

    logger.info('Password reset email sent.', { referralUserId: referralUser.id, email });

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
