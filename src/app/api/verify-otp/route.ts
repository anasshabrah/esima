// src/app/api/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import logger from '@/utils/logger.server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const OTP_LENGTH = 4;

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(OTP_LENGTH).regex(/^\d+$/),
});

export async function POST(req: NextRequest) {
  try {
    const parsedBody = verifyOtpSchema.safeParse(await req.json());

    if (!parsedBody.success) {
      logger.warn('Invalid input data for OTP verification.', { errors: parsedBody.error.errors });
      return NextResponse.json({ valid: false, error: 'Invalid input data.' }, { status: 400 });
    }

    const { email, otp } = parsedBody.data;

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { otp: true },
    });

    if (!user || !user.otp) {
      logger.warn('OTP verification failed: No OTP found or OTP expired.', { email });
      return NextResponse.json({ valid: false, error: 'No OTP found or OTP expired.' }, { status: 400 });
    }

    if (new Date() > user.otp.expiry) {
      await prisma.otp.delete({ where: { id: user.otp.id } });
      logger.warn('OTP verification failed: OTP expired.', { email });
      return NextResponse.json({ valid: false, error: 'OTP expired.' }, { status: 400 });
    }

    if (user.otp.otp !== otp.trim()) {
      logger.warn('OTP verification failed: Invalid OTP.', { email, submittedOtp: otp.trim() });
      return NextResponse.json({ valid: false, error: 'Invalid OTP.' }, { status: 400 });
    }

    await prisma.otp.delete({ where: { id: user.otp.id } });

    const newToken = uuidv4();
    await prisma.user.update({ where: { id: user.id }, data: { token: newToken } });

    return NextResponse.json({ valid: true, token: newToken }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error in verify-otp API.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ valid: false, error: 'Failed to verify OTP.' }, { status: 500 });
  }
}
