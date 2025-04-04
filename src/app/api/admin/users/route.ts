// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAccess } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication.
    const { isAuthorized, admin, error } = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: error || 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Parse query parameters.
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Base condition: Only return users with a non-null and non-empty email.
    let whereCondition: any = {
      email: { not: null, not: "" }
    };

    // If there is a search term, add an AND condition with an OR for name and email.
    if (search) {
      whereCondition.AND = [
        {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Fetch users and total count in parallel.
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);
    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAuthorized, admin, error } = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: error || 'Unauthorized access' }, { status: 401 });
    }
    const body = await request.json();
    const { name, email, password, role, isAdmin } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Remember: In production, hash passwords!
        role: role || 'USER',
        isAdmin: isAdmin || false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    // Log the action (assuming prisma.auditLog exists)
    await prisma.auditLog.create({
      data: {
        userId: admin?.id,
        action: 'CREATE',
        entityType: 'USER',
        resourceId: newUser.id.toString(),
        details: `Admin created new user: ${newUser.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
