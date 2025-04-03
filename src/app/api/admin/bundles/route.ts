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
    
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build search conditions
    let whereCondition: any = {};
    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch bundles with pagination
    const [bundles, totalBundles] = await Promise.all([
      prisma.bundle.findMany({
        where: whereCondition,
        include: {
          countries: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bundle.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalBundles / limit);

    return NextResponse.json({
      bundles,
      pagination: {
        total: totalBundles,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
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
      name, 
      description, 
      price, 
      dataAmount, 
      dataUnit, 
      duration, 
      isActive, 
      countryIds 
    } = body;

    // Validate required fields
    if (!name || !price || !dataAmount || !dataUnit || !duration) {
      return NextResponse.json(
        { error: 'Name, price, dataAmount, dataUnit, and duration are required' },
        { status: 400 }
      );
    }

    // Create new bundle
    const newBundle = await prisma.bundle.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        dataAmount: parseFloat(dataAmount),
        dataUnit,
        duration: parseInt(duration),
        isActive: isActive !== undefined ? isActive : true,
        ...(countryIds && countryIds.length > 0 && {
          countries: {
            connect: countryIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        countries: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'CREATE',
        resourceType: 'BUNDLE',
        resourceId: newBundle.id,
        details: `Admin created new bundle: ${newBundle.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ bundle: newBundle }, { status: 201 });
  } catch (error) {
    console.error('Error creating bundle:', error);
    return NextResponse.json(
      { error: 'Failed to create bundle' },
      { status: 500 }
    );
  }
}
