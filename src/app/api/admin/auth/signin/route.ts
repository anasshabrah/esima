// src/app/api/admin/auth/signin/route.ts

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

    // Find the admin user
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check password
    const isValid = await bcrypt.compare(password, admin.password);
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

    const token = generateAuthToken({ adminId: admin.id });
    
    if (!token) {
      throw new Error('Failed to generate authentication token');
    }

    // Update last login time
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });

    // Exclude sensitive fields before sending the admin object
    const { password: _, ...safeAdmin } = admin;

    return NextResponse.json({ admin: safeAdmin, token }, { status: 200 });
  } catch (error: any) {
    console.error('Admin signin error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
