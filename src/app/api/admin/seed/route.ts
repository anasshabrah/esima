// src/app/api/admin/seed/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode.' },
        { status: 403 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists.' },
        { status: 200 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password, ...safeAdmin } = admin;

    return NextResponse.json(
      { 
        message: 'Admin user created successfully.', 
        admin: safeAdmin,
        credentials: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error seeding admin user:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
