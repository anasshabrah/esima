// src/app/api/send-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ServerClient } from 'postmark';
import { prisma } from '@/lib/prisma';
import logger from '@/utils/logger.server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate the email format
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      logger.warn('Invalid email format received.', { email });
      return NextResponse.json(
        { success: false, error: 'A valid email is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if the user already exists
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      // Default values for currency and exchange rate
      const currencyCode = 'USD';
      const exchangeRate = 1.0;
      const currencySymbol = '$';

      // Create a new user
      user = await prisma.user.create({
        data: {
          email: trimmedEmail,
          currencyCode,
          currencySymbol,
          exchangeRate,
          token: uuidv4(),
          password: '',
        },
      });
    }

    // Generate a 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set OTP expiry to 10 minutes from now
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert the OTP for the user
    await prisma.otp.upsert({
      where: { userId: user.id },
      update: { otp: generatedOtp, expiry },
      create: { otp: generatedOtp, expiry, userId: user.id },
    });

    // Ensure the Postmark API key is configured
    const postmarkApiKey = process.env.POSTMARK_API_KEY;
    if (!postmarkApiKey) {
      logger.error('POSTMARK_API_KEY is not configured.');
      return NextResponse.json(
        { success: false, error: 'Email service is not available.' },
        { status: 500 }
      );
    }

    // Initialize the Postmark client
    const postmarkClient = new ServerClient(postmarkApiKey);

    // Send the OTP email
    await postmarkClient.sendEmail({
      From: process.env.EMAIL_FROM || 'support@example.com',
      To: trimmedEmail,
      Subject: `Your Verification Code: ${generatedOtp}`,
      HtmlBody: `
        <p>Your verification code is <strong>${generatedOtp}</strong>.</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
      TextBody: `Your verification code is ${generatedOtp}. This code will expire in 10 minutes.`,
      MessageStream: 'outbound',
    });

    // Respond with success
    return NextResponse.json(
      { success: true, message: 'OTP sent successfully.' },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log the error and respond with a failure message
    logger.error('Error in send-otp API.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP.' },
      { status: 500 }
    );
  }
}
