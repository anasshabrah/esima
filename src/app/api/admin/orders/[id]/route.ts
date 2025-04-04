// src/app/admin/orders/[id]/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAccess } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { isAuthorized, admin, error } = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        esims: { select: { id: true, iccid: true, activationCode: true, status: true, activationDate: true, expiryDate: true } },
        // If you have transactions relation, include that as well.
      },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { isAuthorized, admin, error } = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    const body = await request.json();
    const { status, paymentStatus, notes } = body;
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
      select: { orderNumber: true },
    });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(notes && { notes }),
        updatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: admin?.id,
        action: 'UPDATE',
        entityType: 'ORDER',
        resourceId: id,
        details: `Admin updated order: ${existingOrder.orderNumber}, status: ${status || 'unchanged'}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { isAuthorized, admin, error } = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
      select: { orderNumber: true },
    });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    await prisma.order.delete({ where: { id: Number(id) } });
    await prisma.auditLog.create({
      data: {
        userId: admin?.id,
        action: 'DELETE',
        entityType: 'ORDER',
        resourceId: id,
        details: `Admin deleted order: ${existingOrder.orderNumber}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
