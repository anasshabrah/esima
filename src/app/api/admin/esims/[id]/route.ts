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

    // Fetch eSIM by ID
    const esim = await prisma.eSim.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        bundle: {
          select: {
            id: true,
            name: true,
            description: true,
            dataAmount: true,
            dataUnit: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    if (!esim) {
      return NextResponse.json(
        { error: 'eSIM not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ esim });
  } catch (error) {
    console.error('Error fetching eSIM:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eSIM' },
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
      iccid, 
      status, 
      activationDate, 
      expiryDate,
      dataUsed,
      notes,
      orderId,
      bundleId
    } = body;

    // Check if eSIM exists
    const existingESim = await prisma.eSim.findUnique({
      where: { id },
    });

    if (!existingESim) {
      return NextResponse.json(
        { error: 'eSIM not found' },
        { status: 404 }
      );
    }

    // If ICCID is being changed, check if new ICCID already exists
    if (iccid && iccid !== existingESim.iccid) {
      const iccidExists = await prisma.eSim.findFirst({
        where: { 
          iccid,
          id: { not: id }
        },
      });

      if (iccidExists) {
        return NextResponse.json(
          { error: 'eSIM with this ICCID already exists' },
          { status: 409 }
        );
      }
    }

    // Check if bundle exists (if provided)
    if (bundleId) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
      });

      if (!bundle) {
        return NextResponse.json(
          { error: 'Bundle not found' },
          { status: 404 }
        );
      }
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

    // Prepare update data
    const updateData: any = {};
    if (iccid !== undefined) updateData.iccid = iccid;
    if (status !== undefined) updateData.status = status;
    if (activationDate !== undefined) updateData.activationDate = activationDate ? new Date(activationDate) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (dataUsed !== undefined) updateData.dataUsed = parseFloat(dataUsed);
    if (notes !== undefined) updateData.notes = notes;
    if (orderId !== undefined) updateData.orderId = orderId;
    if (bundleId !== undefined) updateData.bundleId = bundleId;

    // Update eSIM
    const updatedESim = await prisma.eSim.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
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
        action: 'UPDATE',
        resourceType: 'ESIM',
        resourceId: id,
        details: `Admin updated eSIM: ${updatedESim.iccid}, status: ${status || 'unchanged'}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ esim: updatedESim });
  } catch (error) {
    console.error('Error updating eSIM:', error);
    return NextResponse.json(
      { error: 'Failed to update eSIM' },
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

    // Check if eSIM exists
    const existingESim = await prisma.eSim.findUnique({
      where: { id },
      select: { 
        iccid: true,
        status: true,
        orderId: true
      },
    });

    if (!existingESim) {
      return NextResponse.json(
        { error: 'eSIM not found' },
        { status: 404 }
      );
    }

    // Check if eSIM is associated with an order
    if (existingESim.orderId) {
      return NextResponse.json(
        { error: 'Cannot delete eSIM as it is associated with an order' },
        { status: 400 }
      );
    }

    // Check if eSIM is active
    if (existingESim.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot delete active eSIM. Please deactivate it first.' },
        { status: 400 }
      );
    }

    // Delete eSIM
    await prisma.eSim.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'DELETE',
        resourceType: 'ESIM',
        resourceId: id,
        details: `Admin deleted eSIM: ${existingESim.iccid}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting eSIM:', error);
    return NextResponse.json(
      { error: 'Failed to delete eSIM' },
      { status: 500 }
    );
  }
}
