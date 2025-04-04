// src/app/api/admin/countries/route.ts

// src/app/api/admin/countries/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAccess } from '@/utils/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using verifyAdminAccess
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthorized || !authResult.admin) {
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

    // Build search conditions using correct field names (e.g. "iso" for ISO code)
    let whereCondition: any = {};
    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { iso: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch countries with pagination and include related bundles
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
    // Verify admin authentication using verifyAdminAccess
    const authResult = await verifyAdminAccess(request);
    if (!authResult.isAuthorized || !authResult.admin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { name, iso, flagUrl, isActive, bundleIds, information } = body;
    if (!name || !iso) {
      return NextResponse.json(
        { error: 'Name and ISO code are required' },
        { status: 400 }
      );
    }
    // Check if country already exists
    const existingCountry = await prisma.country.findFirst({
      where: {
        OR: [
          { name },
          { iso },
        ],
      },
    });
    if (existingCountry) {
      return NextResponse.json(
        { error: 'Country with this name or ISO code already exists' },
        { status: 409 }
      );
    }
    // Create new country
    const newCountry = await prisma.country.create({
      data: {
        name,
        iso,
        flagUrl,
        isActive: isActive !== undefined ? isActive : true,
        information,
        ...(bundleIds && bundleIds.length > 0 && {
          bundles: {
            connect: bundleIds.map((id: number) => ({ id })),
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

    // (Optional) Log the action here if needed

    return NextResponse.json({ country: newCountry }, { status: 201 });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { error: 'Failed to create country' },
      { status: 500 }
    );
  }
}
