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

    // Fetch withdrawal by ID
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ withdrawal });
  } catch (error) {
    console.error('Error fetching withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal' },
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
      status, 
      paymentMethod, 
      accountDetails, 
      notes,
      transactionId,
      processedAt
    } = body;

    // Check if withdrawal exists
    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!existingWithdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (accountDetails !== undefined) updateData.accountDetails = accountDetails;
    if (notes !== undefined) updateData.notes = notes;
    if (transactionId !== undefined) updateData.transactionId = transactionId;
    
    // If status is changing to COMPLETED, set processedAt date
    if (status === 'COMPLETED' && existingWithdrawal.status !== 'COMPLETED') {
      updateData.processedAt = new Date();
    } else if (processedAt !== undefined) {
      updateData.processedAt = processedAt ? new Date(processedAt) : null;
    }

    // Update withdrawal
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'UPDATE',
        resourceType: 'WITHDRAWAL',
        resourceId: id,
        details: `Admin updated withdrawal: ${existingWithdrawal.reference}, status: ${status || 'unchanged'} for user ${existingWithdrawal.user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ withdrawal: updatedWithdrawal });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
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

    // Check if withdrawal exists
    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      select: { 
        reference: true,
        status: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!existingWithdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Check if withdrawal is already processed
    if (existingWithdrawal.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete a completed withdrawal' },
        { status: 400 }
      );
    }

    // Delete withdrawal
    await prisma.withdrawal.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'DELETE',
        resourceType: 'WITHDRAWAL',
        resourceId: id,
        details: `Admin deleted withdrawal: ${existingWithdrawal.reference} for user ${existingWithdrawal.user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to delete withdrawal' },
      { status: 500 }
    );
  }
}
