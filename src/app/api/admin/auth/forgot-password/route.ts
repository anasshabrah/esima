// src/app/api/admin/auth/forgot-password/route.ts

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
      logger.warn('Invalid input data for admin forgot-password.', { errors: parsed.error.errors });
      return NextResponse.json(
        { error: 'Invalid email address.', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find the admin user
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      // To prevent email enumeration, respond with success even if admin doesn't exist
      logger.warn('Admin forgot password requested for non-existent email.', { email });
      return NextResponse.json(
        { message: 'If that email is registered, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Create or update password reset token
    await prisma.adminPasswordReset.upsert({
      where: { adminId: admin.id },
      update: { token, expiresAt },
      create: { adminId: admin.id, token, expiresAt },
    });

    // Create password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password?token=${token}`;

    // Send password reset email
    const emailContent = `
      <h1>Admin Password Reset Request</h1>
      <p>Hello ${admin.name},</p>
      <p>You requested a password reset for your admin account. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,<br/>Your Company Team</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Admin Password Reset Request',
      html: emailContent,
    });

    logger.info('Admin password reset email sent.', { adminId: admin.id, email });

    return NextResponse.json(
      { message: 'If that email is registered, you will receive a password reset link.' },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error in admin forgot-password.', { error: error.message });
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
