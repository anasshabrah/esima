// src/app/api/auth/signin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateAuthToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Normalize the email to lowercase for a case-insensitive lookup
    const normalizedEmail = email.toLowerCase();

    // For partner (referral) login, check the ReferralUser table first
    let user = await prisma.referralUser.findUnique({ where: { email: normalizedEmail } });
    let isReferralUser = false;

    if (user) {
      isReferralUser = true;
    } else {
      // Otherwise, check the regular User table
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check password using bcrypt.compare (user.password is a hashed string)
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT token with the appropriate ID field
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const tokenPayload = isReferralUser 
      ? { referralUserId: user.id, isReferralUser: true }
      : { userId: user.id, isReferralUser: false };

    const token = generateAuthToken(tokenPayload);
    
    if (!token) {
      throw new Error('Failed to generate authentication token');
    }

    // Exclude sensitive fields (like password) before sending the user object
    const { password: _, ...safeUser } = user;

    // Add isAdmin flag to the response if it exists
    const responseUser = {
      ...safeUser,
      isAdmin: user.isAdmin || false
    };

    return NextResponse.json({ user: responseUser, token }, { status: 200 });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
