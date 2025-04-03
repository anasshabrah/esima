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
          { code: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch countries with pagination
    const [countries, totalCountries] = await Promise.all([
      prisma.country.findMany({
        where: whereCondition,
        include: {
          bundles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.country.count({ where: whereCondition }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCountries / limit);

    return NextResponse.json({
      countries,
      pagination: {
        total: totalCountries,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
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
      code, 
      flagUrl, 
      isActive, 
      bundleIds,
      information
    } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if country already exists
    const existingCountry = await prisma.country.findFirst({
      where: {
        OR: [
          { name },
          { code },
        ],
      },
    });

    if (existingCountry) {
      return NextResponse.json(
        { error: 'Country with this name or code already exists' },
        { status: 409 }
      );
    }

    // Create new country
    const newCountry = await prisma.country.create({
      data: {
        name,
        code,
        flagUrl,
        isActive: isActive !== undefined ? isActive : true,
        information,
        ...(bundleIds && bundleIds.length > 0 && {
          bundles: {
            connect: bundleIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        bundles: {
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
        resourceType: 'COUNTRY',
        resourceId: newCountry.id,
        details: `Admin created new country: ${newCountry.name} (${newCountry.code})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ country: newCountry }, { status: 201 });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { error: 'Failed to create country' },
      { status: 500 }
    );
  }
}
