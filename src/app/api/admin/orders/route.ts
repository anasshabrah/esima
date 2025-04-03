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
          { id: { contains: search } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { orderNumber: { contains: search } },
        ],
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Fetch orders with pagination
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              bundle: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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
    const { userId, items, status, paymentMethod, shippingAddress } = body;

    // Validate required fields
    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'User ID and at least one item are required' },
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

    // Calculate order total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: item.bundleId },
      });

      if (!bundle) {
        return NextResponse.json(
          { error: `Bundle with ID ${item.bundleId} not found` },
          { status: 404 }
        );
      }

      const itemTotal = bundle.price * (item.quantity || 1);
      totalAmount += itemTotal;

      orderItems.push({
        bundleId: bundle.id,
        quantity: item.quantity || 1,
        price: bundle.price,
        subtotal: itemTotal,
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: status || 'PENDING',
        totalAmount,
        paymentMethod: paymentMethod || 'CREDIT_CARD',
        shippingAddress,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            bundle: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'CREATE',
        resourceType: 'ORDER',
        resourceId: newOrder.id,
        details: `Admin created new order: ${orderNumber} for user ${user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
