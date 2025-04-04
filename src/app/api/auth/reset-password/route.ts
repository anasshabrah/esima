// src/app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import logger from '@/utils/logger.server';
import { z } from 'zod';

// Define the schema for validating the request body
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Validate input data
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('Invalid input data for reset-password.', { errors: parsed.error.errors });
      return NextResponse.json(
        { error: 'Invalid input data.', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    // Find the password reset record associated with the token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { referralUser: true }, // Ensure we fetch the associated ReferralUser
    });

    if (!passwordReset) {
      logger.warn('Invalid or expired password reset token.', { token });
      return NextResponse.json(
        { error: 'Invalid or expired password reset token.' },
        { status: 400 }
      );
    }

    // Check if the token has expired
    if (passwordReset.expiresAt < new Date()) {
      logger.warn('Expired password reset token.', { token });
      return NextResponse.json(
        { error: 'Password reset token has expired.' },
        { status: 400 }
      );
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the ReferralUser's password and log the result
    const updateResult = await prisma.referralUser.update({
      where: { id: passwordReset.referralUserId },
      data: { password: hashedPassword },
    });
    logger.info('Updated referralUser password successfully.', { updateResult });

    // Delete the password reset record to prevent reuse
    await prisma.passwordReset.delete({
      where: { token },
    });

    logger.info('Password reset process completed.', { referralUserId: passwordReset.referralUserId });

    return NextResponse.json(
      { message: 'Password has been reset successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error in reset-password.', { error: error.message });
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
