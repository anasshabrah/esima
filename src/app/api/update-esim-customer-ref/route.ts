import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { prisma } from '@/lib/prisma'; // Adjust the import path as needed

export async function POST(req: NextRequest) {
  const API_URL = process.env.API_URL;
  const ESIM_API_KEY = process.env.ESIM_API_KEY;

  if (!API_URL || !ESIM_API_KEY) {
    logger.error('API_URL or ESIM_API_KEY is missing.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const { orderId, iccids } = await req.json();

    if (!orderId || !Array.isArray(iccids) || iccids.some(iccid => typeof iccid !== 'string')) {
      logger.warn('Invalid input data for update-esim-customer-ref.', { orderId, iccids });
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    // Fetch the order with the associated user to get the customer email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      logger.error('Order not found.', { orderId });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (!order.user || !order.user.email) {
      logger.error('User or user email not found for order.', { orderId });
      return NextResponse.json({ error: 'User or user email not found for order.' }, { status: 404 });
    }

    // Create a new customerRef combining the order number and customer email
    const customerRef = `${orderId}-${order.user.email}`;

    const results = await Promise.all(
      iccids.map(async (iccid) => {
        try {
          const response = await fetch(
            `${API_URL}/esims?iccid=${encodeURIComponent(iccid)}&customerRef=${encodeURIComponent(customerRef)}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': ESIM_API_KEY,
              },
              body: JSON.stringify({ iccid, customerRef }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            logger.error('Failed to update eSIM customerRef.', { iccid, error: errorData });
            return { iccid, success: false, error: errorData.message || 'Unknown error' };
          }

          return { iccid, success: true };
        } catch (error) {
          logger.error('Error updating eSIM customerRef.', { iccid, error });
          return { iccid, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    logger.error('Error in update-esim-customer-ref API.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to update eSIM customerRef.' }, { status: 500 });
  }
}
