// src/app/api/auth/signin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find the referral user
    const user = await prisma.referralUser.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = jwt.sign(
      { referralUserId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude sensitive fields before sending the user object
    const { password: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, token }, { status: 200 });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
