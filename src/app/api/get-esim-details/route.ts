// src/app/api/get-esim-details/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { ESIMDetailWithQRCode, EsimDetailsResponse } from '@/types/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'get-esim-details';
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(req.url);
    const iccid = searchParams.get('iccid');
    const additionalFields = searchParams.get('additionalFields');

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

    const esimRecord = user.orders
      .flatMap((order) => order.esims)
      .find((esim) => esim.iccid === trimmedIccid);

    if (!esimRecord) {
      logger.warn('eSIM record not found.', { service: serviceName, timestamp });
      return NextResponse.json({ message: 'eSIM record not found.' }, { status: 404 });
    }

    const { API_URL, ESIM_API_KEY } = process.env;
    if (!API_URL || !ESIM_API_KEY) {
      logger.error('API_URL or ESIM_API_KEY is missing in environment variables.', {
        service: serviceName,
        timestamp,
      });
      return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }

    const externalApiUrl = new URL(`${API_URL}/esims/${encodeURIComponent(trimmedIccid)}`);
    if (additionalFields) {
      externalApiUrl.searchParams.append('additionalFields', additionalFields);
    }

    const externalApiResponse = await fetch(externalApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
    });

    if (!externalApiResponse.ok) {
      let errorMessage = 'Failed to retrieve eSIM details.';
      try {
        const errorData = await externalApiResponse.json();
        errorMessage = errorData.message || errorMessage;
        logger.error('Failed to retrieve eSIM details from external API.', {
          status: externalApiResponse.status,
          statusText: externalApiResponse.statusText,
          service: serviceName,
          timestamp,
          error: errorMessage,
        });
      } catch {
        logger.error('Failed to retrieve eSIM details from external API.', {
          status: externalApiResponse.status,
          statusText: externalApiResponse.statusText,
          service: serviceName,
          timestamp,
          error: 'Unknown error',
        });
      }
      return NextResponse.json(
        { message: errorMessage },
        { status: externalApiResponse.status }
      );
    }

    const externalData: EsimDetailsResponse = await externalApiResponse.json();

    const combinedData: ESIMDetailWithQRCode = {
      id: esimRecord.id,
      orderId: esimRecord.orderId,
      iccid: externalData.iccid,
      matchingId: externalData.matchingId,
      smdpAddress: externalData.smdpAddress,
      activationCode: externalData.pin || '',
      status: externalData.profileStatus || 'Unknown',
      firstInstalledDateTime: externalData.firstInstalledDateTime,
      appleInstallUrl: externalData.appleInstallUrl || '',
    };

    return NextResponse.json(combinedData, { status: 200 });
  } catch (error) {
    logger.error('Error in get-esim-details.', {
      service: serviceName,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { message: 'Failed to retrieve eSIM details.' },
      { status: 500 }
    );
  }
}
