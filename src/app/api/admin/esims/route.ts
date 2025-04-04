// src/app/api/admin/esims/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAccess } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthorized) {
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
          { order: { 
              user: { email: { contains: search, mode: 'insensitive' } }
            } 
          }
        ],
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Fetch eSIMs with pagination, including related Order and Bundle data via Order.
    const [esims, totalEsims] = await Promise.all([
      prisma.ESIM.findMany({
        where: whereCondition,
        include: {
          order: {
            select: {
              id: true,
              // Include bundle info from the order (if available)
              bundle: {
                select: {
                  id: true,
                  name: true,
                  dataAmount: true,
                  dataUnit: true,
                  duration: true,
                  price: true
                }
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' }
      }),
      prisma.ESIM.count({ where: whereCondition })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalEsims / limit);

    return NextResponse.json({
      esims,
      pagination: { total: totalEsims, pages: totalPages, page, limit },
    });
  } catch (error) {
    console.error('Error fetching eSIMs:', error);
    return NextResponse.json({ error: 'Failed to fetch eSIMs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

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

    if (!iccid || !bundleId) {
      return NextResponse.json(
        { error: 'ICCID and bundle ID are required' },
        { status: 400 }
      );
    }

    // Check if eSIM with this ICCID already exists
    const existingESim = await prisma.ESIM.findFirst({
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
      where: { id: parseInt(bundleId) },
    });
    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // If orderId is provided, verify its existence
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
      });
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    const newESim = await prisma.ESIM.create({
      data: {
        iccid,
        status: status || 'INACTIVE',
        activationDate: activationDate ? new Date(activationDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        dataUsed: dataUsed ? parseFloat(dataUsed) : 0,
        notes,
        ...(orderId && { orderId: parseInt(orderId) }),
        bundleId: parseInt(bundleId)
      },
      include: {
        order: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        // No direct bundle inclusion; use order.bundle instead.
      },
    });

    // Log the action using the AdminAuditLog model
    await prisma.adminAuditLog.create({
      data: {
        userId: authResult.admin?.id,
        action: 'CREATE',
        entityType: 'ESIM',
        entityId: newESim.id.toString(),
        details: `Admin created new eSIM: ${newESim.iccid}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ esim: newESim }, { status: 201 });
  } catch (error) {
    console.error('Error creating eSIM:', error);
    return NextResponse.json({ error: 'Failed to create eSIM' }, { status: 500 });
  }
}
