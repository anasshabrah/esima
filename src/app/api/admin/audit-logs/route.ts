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
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('userId') || '';
    const resourceType = searchParams.get('resourceType') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build search conditions
    let whereCondition: any = {};
    
    if (search) {
      whereCondition = {
        OR: [
          { details: { contains: search, mode: 'insensitive' } },
          { resourceId: { contains: search, mode: 'insensitive' } },
          { ipAddress: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (action) {
      whereCondition.action = action;
    }

    if (userId) {
      whereCondition.userId = userId;
    }

    if (resourceType) {
      whereCondition.resourceType = resourceType;
    }

    // Date range filtering
    if (startDate || endDate) {
      whereCondition.timestamp = {};
      
      if (startDate) {
        whereCondition.timestamp.gte = new Date(startDate);
      }
      
      if (endDate) {
        // Set to end of the day for the end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereCondition.timestamp.lte = endDateTime;
      }
    }

    // Fetch audit logs with pagination
    const [logs, totalLogs] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isAdmin: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalLogs / limit);

    return NextResponse.json({
      logs,
      pagination: {
        total: totalLogs,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

// We don't implement POST, PATCH, or DELETE for audit logs as they should be immutable
// Audit logs should only be created through the system's internal processes
