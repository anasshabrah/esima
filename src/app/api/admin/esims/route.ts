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
          { iccid: { contains: search, mode: 'insensitive' } },
          { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
          { order: { user: { email: { contains: search, mode: 'insensitive' } } } },
        ],
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Fetch eSIMs with pagination
    const [esims, totalEsims] = await Promise.all([
      prisma.eSim.findMany({
        where: whereCondition,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          bundle: {
            select: {
              id: true,
              name: true,
              dataAmount: true,
              dataUnit: true,
              duration: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eSim.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalEsims / limit);

    return NextResponse.json({
      esims,
      pagination: {
        total: totalEsims,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching eSIMs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eSIMs' },
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
      iccid, 
      orderId, 
      bundleId, 
      status, 
      activationDate, 
      expiryDate,
      dataUsed,
      notes
    } = body;

    // Validate required fields
    if (!iccid || !bundleId) {
      return NextResponse.json(
        { error: 'ICCID and bundle ID are required' },
        { status: 400 }
      );
    }

    // Check if eSIM with this ICCID already exists
    const existingESim = await prisma.eSim.findFirst({
      where: { iccid },
    });

    if (existingESim) {
      return NextResponse.json(
        { error: 'eSIM with this ICCID already exists' },
        { status: 409 }
      );
    }

    // Check if bundle exists
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Check if order exists (if provided)
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    // Create new eSIM
    const newESim = await prisma.eSim.create({
      data: {
        iccid,
        status: status || 'INACTIVE',
        activationDate: activationDate ? new Date(activationDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        dataUsed: dataUsed ? parseFloat(dataUsed) : 0,
        notes,
        ...(orderId && { orderId }),
        bundleId,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        bundle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'CREATE',
        resourceType: 'ESIM',
        resourceId: newESim.id,
        details: `Admin created new eSIM: ${newESim.iccid}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ esim: newESim }, { status: 201 });
  } catch (error) {
    console.error('Error creating eSIM:', error);
    return NextResponse.json(
      { error: 'Failed to create eSIM' },
      { status: 500 }
    );
  }
}
