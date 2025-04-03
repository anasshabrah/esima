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

    // Fetch country by ID
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        bundles: {
          select: {
            id: true,
            name: true,
            dataAmount: true,
            dataUnit: true,
            duration: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ country });
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country' },
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
      code, 
      flagUrl, 
      isActive, 
      bundleIds,
      information
    } = body;

    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id },
      include: {
        bundles: true,
      },
    });

    if (!existingCountry) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (flagUrl !== undefined) updateData.flagUrl = flagUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (information !== undefined) updateData.information = information;

    // Handle bundle connections/disconnections if provided
    if (bundleIds && Array.isArray(bundleIds)) {
      // Get current bundle IDs
      const currentBundleIds = existingCountry.bundles.map(bundle => bundle.id);
      
      // Determine which bundles to disconnect (those in current but not in new list)
      const bundlesToDisconnect = currentBundleIds.filter(id => !bundleIds.includes(id));
      
      // Determine which bundles to connect (those in new list but not in current)
      const bundlesToConnect = bundleIds.filter(id => !currentBundleIds.includes(id));

      if (bundlesToDisconnect.length > 0) {
        updateData.bundles = {
          ...(updateData.bundles || {}),
          disconnect: bundlesToDisconnect.map(id => ({ id })),
        };
      }

      if (bundlesToConnect.length > 0) {
        updateData.bundles = {
          ...(updateData.bundles || {}),
          connect: bundlesToConnect.map(id => ({ id })),
        };
      }
    }

    // Update country
    const updatedCountry = await prisma.country.update({
      where: { id },
      data: updateData,
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
        action: 'UPDATE',
        resourceType: 'COUNTRY',
        resourceId: id,
        details: `Admin updated country: ${updatedCountry.name} (${updatedCountry.code})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ country: updatedCountry });
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { error: 'Failed to update country' },
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

    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id },
      select: { 
        name: true,
        code: true,
        bundles: {
          select: { id: true }
        }
      },
    });

    if (!existingCountry) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    // Check if country has associated bundles
    if (existingCountry.bundles.length > 0) {
      // Instead of preventing deletion, we can disconnect the bundles first
      await prisma.country.update({
        where: { id },
        data: {
          bundles: {
            disconnect: existingCountry.bundles.map(bundle => ({ id: bundle.id })),
          },
        },
      });
    }

    // Delete country
    await prisma.country.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'DELETE',
        resourceType: 'COUNTRY',
        resourceId: id,
        details: `Admin deleted country: ${existingCountry.name} (${existingCountry.code})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { error: 'Failed to delete country' },
      { status: 500 }
    );
  }
}
