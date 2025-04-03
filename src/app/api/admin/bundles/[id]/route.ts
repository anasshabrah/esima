import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Fetch bundle by ID
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        countries: {
          select: {
            id: true,
            name: true,
            code: true,
            flagUrl: true,
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error('Error fetching bundle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundle' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
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

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        countries: true,
      },
    });

    if (!existingBundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (dataAmount !== undefined) updateData.dataAmount = parseFloat(dataAmount);
    if (dataUnit !== undefined) updateData.dataUnit = dataUnit;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle country connections/disconnections if provided
    if (countryIds && Array.isArray(countryIds)) {
      // Get current country IDs
      const currentCountryIds = existingBundle.countries.map(country => country.id);
      
      // Determine which countries to disconnect (those in current but not in new list)
      const countriesToDisconnect = currentCountryIds.filter(id => !countryIds.includes(id));
      
      // Determine which countries to connect (those in new list but not in current)
      const countriesToConnect = countryIds.filter(id => !currentCountryIds.includes(id));

      if (countriesToDisconnect.length > 0) {
        updateData.countries = {
          ...(updateData.countries || {}),
          disconnect: countriesToDisconnect.map(id => ({ id })),
        };
      }

      if (countriesToConnect.length > 0) {
        updateData.countries = {
          ...(updateData.countries || {}),
          connect: countriesToConnect.map(id => ({ id })),
        };
      }
    }

    // Update bundle
    const updatedBundle = await prisma.bundle.update({
      where: { id },
      data: updateData,
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
        action: 'UPDATE',
        resourceType: 'BUNDLE',
        resourceId: id,
        details: `Admin updated bundle: ${updatedBundle.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ bundle: updatedBundle });
  } catch (error) {
    console.error('Error updating bundle:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!existingBundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Check if bundle is used in any orders
    const bundleInUse = await prisma.orderItem.findFirst({
      where: { bundleId: id },
    });

    if (bundleInUse) {
      return NextResponse.json(
        { error: 'Cannot delete bundle as it is used in orders' },
        { status: 400 }
      );
    }

    // Delete bundle
    await prisma.bundle.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'DELETE',
        resourceType: 'BUNDLE',
        resourceId: id,
        details: `Admin deleted bundle: ${existingBundle.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bundle:', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
