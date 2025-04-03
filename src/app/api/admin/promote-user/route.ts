import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Promote user to admin
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: true,
        role: 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        role: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'UPDATE',
        resourceType: 'USER',
        resourceId: userId,
        details: `Admin promoted user ${updatedUser.email} to admin role`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return NextResponse.json(
      { error: 'Failed to promote user to admin' },
      { status: 500 }
    );
  }
}
