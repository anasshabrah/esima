// src/app/api/get-esim-history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { EsimHistoryEvent } from '@/types/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'get-esim-history';
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
      logger.warn('User not found.', { serviceName, timestamp });
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    // Log user's orders and associated eSIMs
    logger.info('User orders and eSIMs', {
      serviceName,
      userId: user.id,
      orders: user.orders.map((order) => ({
        orderId: order.id,
        esims: order.esims.map((esim) => esim.iccid),
      })),
    });

    // Check if the user owns the ICCID
    const ownsIccid = user.orders.some((order) =>
      order.esims.some((esim) => esim.iccid === trimmedIccid)
    );

    if (!ownsIccid) {
      logger.warn('Forbidden access to ICCID.', { serviceName, timestamp });
      return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
    }

    const { API_URL, ESIM_API_KEY } = process.env;
    if (!API_URL || !ESIM_API_KEY) {
      logger.error('API_URL or ESIM_API_KEY is missing in environment variables.', {
        service: serviceName,
        timestamp,
      });
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }

    const externalApiUrl = `${API_URL}/esims/${encodeURIComponent(trimmedIccid)}/history`;

    const externalApiResponse = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
    });

    const responseText = await externalApiResponse.text();

    // Log the external API response
    logger.info('External API response', {
      status: externalApiResponse.status,
      statusText: externalApiResponse.statusText,
      responseText,
    });

    if (!externalApiResponse.ok) {
      let errorMessage = 'Failed to retrieve eSIM history.';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
        logger.error('Failed to retrieve eSIM history.', {
          status: externalApiResponse.status,
          statusText: externalApiResponse.statusText,
          service: serviceName,
          timestamp,
          error: errorMessage,
        });
      } catch {
        logger.error('Failed to retrieve eSIM history.', {
          status: externalApiResponse.status,
          statusText: externalApiResponse.statusText,
          service: serviceName,
          timestamp,
          error: 'Unknown error',
        });
      }
      return NextResponse.json({ message: errorMessage }, { status: externalApiResponse.status });
    }

    // Parse the response
    const responseData = JSON.parse(responseText);

    // Log the parsed response data
    logger.info('Parsed external API response data', { responseData });

    // Extract the actions array
    const actions = responseData.actions || [];

    // Map actions to match the EsimHistoryEvent type without bundleState
    const historyData: EsimHistoryEvent[] = actions.map((action: any) => ({
      name: action.name || '',
      date: action.date || '',
      bundle: action.bundleName || '',
      alertType: action.alertType || '',
    }));

    // Log the final history data
    logger.info('Final history data sent to frontend', { historyData });

    return NextResponse.json({ history: historyData }, { status: 200 });
  } catch (error) {
    logger.error('Error in get-esim-history.', {
      error: error instanceof Error ? error.message : 'Unknown error',
      service: serviceName,
      timestamp,
    });
    return NextResponse.json(
      { message: 'Failed to retrieve eSIM history.' },
      { status: 500 }
    );
  }
}
