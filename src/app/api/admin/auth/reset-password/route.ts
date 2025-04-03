// src/app/api/admin/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import logger from '@/utils/logger.server';

// Define the schema for validating the request body
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Validate input data
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('Invalid input data for admin reset-password.', { errors: parsed.error.errors });
      return NextResponse.json(
        { error: 'Invalid input data.', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Find the password reset record
    const passwordReset = await prisma.adminPasswordReset.findUnique({
      where: { token },
      include: { admin: true },
    });

    // Check if token exists and is valid
    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (passwordReset.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the admin's password
    await prisma.admin.update({
      where: { id: passwordReset.adminId },
      data: { password: hashedPassword },
    });

    // Delete the password reset token
    await prisma.adminPasswordReset.delete({
      where: { id: passwordReset.id },
    });

    logger.info('Admin password reset successful.', { adminId: passwordReset.adminId });

    return NextResponse.json(
      { message: 'Password has been reset successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error in admin reset-password.', { error: error.message });
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
