import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build search conditions
    let whereCondition: any = {};
    if (search) {
      whereCondition = {
        OR: [
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { reference: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Fetch withdrawals with pagination
    const [withdrawals, totalWithdrawals] = await Promise.all([
      prisma.withdrawal.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.withdrawal.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalWithdrawals / limit);

    return NextResponse.json({
      withdrawals,
      pagination: {
        total: totalWithdrawals,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

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
    const { 
      userId, 
      amount, 
      paymentMethod, 
      accountDetails, 
      status, 
      notes 
    } = body;

    // Validate required fields
    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'User ID, amount, and payment method are required' },
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

    // Generate reference number
    const reference = `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create new withdrawal
    const newWithdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: parseFloat(amount),
        paymentMethod,
        accountDetails,
        status: status || 'PENDING',
        notes,
        reference,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'CREATE',
        resourceType: 'WITHDRAWAL',
        resourceId: newWithdrawal.id,
        details: `Admin created new withdrawal: ${reference} for user ${user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ withdrawal: newWithdrawal }, { status: 201 });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal' },
      { status: 500 }
    );
  }
}
