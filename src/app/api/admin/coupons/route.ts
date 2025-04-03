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
    const active = searchParams.get('active');
    
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build search conditions
    let whereCondition: any = {};
    if (search) {
      whereCondition = {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (active !== null && active !== undefined) {
      whereCondition.isActive = active === 'true';
    }

    // Fetch coupons with pagination
    const [coupons, totalCoupons] = await Promise.all([
      prisma.coupon.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCoupons / limit);

    return NextResponse.json({
      coupons,
      pagination: {
        total: totalCoupons,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
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
      code, 
      discountType, 
      discountValue, 
      description, 
      maxUses, 
      expiryDate, 
      isActive,
      minOrderAmount
    } = body;

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Code, discount type, and discount value are required' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: { code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon with this code already exists' },
        { status: 409 }
      );
    }

    // Create new coupon
    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        description,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        usedCount: 0,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'CREATE',
        resourceType: 'COUPON',
        resourceId: newCoupon.id,
        details: `Admin created new coupon: ${newCoupon.code}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ coupon: newCoupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
