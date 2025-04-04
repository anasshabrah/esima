// src/app/api/admin/orders/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAccess } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build search conditions (search by user email)
    let whereCondition: any = {};
    if (search) {
      whereCondition = {
        user: { email: { contains: search, mode: 'insensitive' } }
      };
    }
    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    // Fetch orders with pagination and include defined relations
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        include: {
          user: { select: { id: true, name: true, email: true } },
          bundle: { select: { id: true, name: true } },
          country: { select: { id: true, name: true } },
          esims: { select: { id: true, iccid: true, status: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalOrders / limit);
    return NextResponse.json({
      orders,
      pagination: { total: totalOrders, pages: totalPages, page, limit }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, items, status, paymentMethod, shippingAddress } = body;
    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'User ID and at least one item are required' },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total order amount (assuming items is an array with bundleId and quantity)
    let totalAmount = 0;
    for (const item of items) {
      const bundle = await prisma.bundle.findUnique({ where: { id: item.bundleId } });
      if (!bundle) {
        return NextResponse.json(
          { error: `Bundle with ID ${item.bundleId} not found` },
          { status: 404 }
        );
      }
      totalAmount += bundle.price * (item.quantity || 1);
    }

    // Create new order record (adjust fields as needed)
    const newOrder = await prisma.order.create({
      data: {
        userId,
        amount: totalAmount,
        currency: user.currencyCode,
        paymentIntentId: `PI-${Date.now()}`, // Dummy payment intent ID
        quantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        bundleId: items[0].bundleId, // This is a placeholder if multiple items exist
        countryId: 1, // Placeholder – update as needed
        remainingQuantity: items[0].quantity || 1, // Placeholder
        status: status || 'PENDING',
        couponCode: null,
        couponSponsor: null,
        discountPercent: null,
        exchangeRate: user.exchangeRate
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bundle: { select: { id: true, name: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: authResult.admin?.id,
        action: 'CREATE',
        entityType: 'ORDER',
        resourceId: newOrder.id.toString(),
        details: `Admin created new order for user ${user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
