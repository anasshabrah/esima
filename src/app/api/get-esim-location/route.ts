// src/app/api/get-esim-location/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'get-esim-location';
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(req.url);
    const iccid = searchParams.get('iccid');

    if (!iccid) {
      logger.warn('Missing iccid parameter.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'Missing ICCID parameter.' }, { status: 400 });
    }

    const trimmedIccid = iccid.trim();
    const iccidRegex = /^[A-Za-z0-9]{15,20}$/;
    if (!iccidRegex.test(trimmedIccid)) {
      logger.warn('Invalid ICCID format.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'Invalid ICCID format.' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized access.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { token },
      include: { orders: { include: { esims: true } } },
    });

    if (!user) {
      logger.warn('User not found.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const ownsIccid = user.orders.some(order =>
      order.esims.some(esim => esim.iccid === trimmedIccid)
    );

    if (!ownsIccid) {
      logger.warn('Forbidden access to ICCID.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
    }

    const { API_URL, ESIM_API_KEY } = process.env;
    if (!API_URL || !ESIM_API_KEY) {
      logger.error('API_URL or ESIM_API_KEY is missing in environment variables.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }

    const externalApiUrl = `${API_URL}/esims/${encodeURIComponent(trimmedIccid)}/location`;

    const externalApiResponse = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
    });

    if (!externalApiResponse.ok) {
      let errorMessage = 'Failed to retrieve eSIM location.';
      try {
        const errorData = await externalApiResponse.json();
        errorMessage = errorData.message || errorMessage;
        logger.error('Failed to retrieve eSIM location.', {
          status: externalApiResponse.status,
          statusText: externalApiResponse.statusText,
          service: serviceName,
          timestamp,
          error: errorMessage,
        });
      } catch {
        logger.error('Failed to retrieve eSIM location.', {
          status: externalApiResponse.status,
          statusText: externalApiResponse.statusText,
          service: serviceName,
          timestamp,
          error: 'Unknown error',
        });
      }
      return NextResponse.json({ message: errorMessage }, { status: externalApiResponse.status });
    }

    const externalData = await externalApiResponse.json();

    return NextResponse.json(externalData, { status: 200 });
  } catch (error) {
    logger.error('Error in get-esim-location.', {
      error: error instanceof Error ? error.message : 'Unknown error',
      service: serviceName,
      timestamp,
    });
    return NextResponse.json(
      { message: 'Failed to retrieve eSIM location.' },
      { status: 500 }
    );
  }
}
