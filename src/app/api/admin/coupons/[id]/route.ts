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

    // Fetch coupon by ID
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
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
      code, 
      discountType, 
      discountValue, 
      description, 
      maxUses, 
      expiryDate, 
      isActive,
      minOrderAmount,
      usedCount
    } = body;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: { 
          code,
          id: { not: id }
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Coupon with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (description !== undefined) updateData.description = description;
    if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;
    if (usedCount !== undefined) updateData.usedCount = parseInt(usedCount);

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'UPDATE',
        resourceType: 'COUPON',
        resourceId: id,
        details: `Admin updated coupon: ${updatedCoupon.code}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ coupon: updatedCoupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
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

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      select: { code: true, usedCount: true },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon has been used
    if (existingCoupon.usedCount > 0) {
      // Instead of deleting, we can deactivate the coupon
      const deactivatedCoupon = await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: authResult.user?.id,
          action: 'UPDATE',
          resourceType: 'COUPON',
          resourceId: id,
          details: `Admin deactivated coupon: ${existingCoupon.code} (instead of deletion because it has been used)`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ 
        coupon: deactivatedCoupon,
        message: 'Coupon has been used and cannot be deleted. It has been deactivated instead.'
      });
    }

    // Delete coupon
    await prisma.coupon.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'DELETE',
        resourceType: 'COUPON',
        resourceId: id,
        details: `Admin deleted coupon: ${existingCoupon.code}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
