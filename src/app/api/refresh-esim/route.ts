// src/app/api/refresh-esim/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract ICCID from query parameters
    const iccid = req.nextUrl.searchParams.get('iccid');
    if (!iccid || !/^[A-Za-z0-9]{15,20}$/.test(iccid.trim())) {
      logger.warn('Invalid or missing ICCID.');
      return NextResponse.json({ success: false, message: 'Invalid ICCID.' }, { status: 400 });
    }
    const trimmedIccid = iccid.trim();

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('Unauthorized access attempt.');
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    // Retrieve user from the database
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { token },
      include: { orders: { include: { esims: true } } },
    });
    if (!user) {
      logger.warn('User not found.');
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    // Check if user owns the ICCID
    const ownsIccid = user.orders.some((order) =>
      order.esims.some((esim) => esim.iccid === trimmedIccid)
    );
    if (!ownsIccid) {
      logger.warn('User does not own the ICCID.');
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    // Check API configuration
    const { API_URL, ESIM_API_KEY } = process.env;
    if (!API_URL || !ESIM_API_KEY) {
      logger.error('API configuration missing.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    // Call external API to refresh eSIM
    const response = await fetch(
      `${API_URL}/esims/${encodeURIComponent(trimmedIccid)}/refresh`,
      {
        headers: { 'X-API-Key': ESIM_API_KEY },
      }
    );

    // Handle external API response
    if (!response.ok) {
      let errorMessage = 'Failed to refresh eSIM.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        logger.error('Failed to refresh eSIM.', {
          status: response.status,
          message: errorMessage,
        });
      } catch (error) {
        logger.error('Failed to refresh eSIM. Unable to parse error response.', {
          status: response.status,
          message: 'Unknown error',
        });
      }
      return NextResponse.json({ success: false, message: errorMessage }, { status: response.status });
    }

    // Parse the external API's successful response
    // Regardless of external response, set message to "Successfully refreshed SIM"
    const successMessage = 'Successfully refreshed SIM';
    try {
      const externalData = await response.json();
      logger.info('eSIM refreshed successfully.', {
        status: response.status,
        originalMessage: externalData.status || externalData.message || 'No message provided',
        message: successMessage,
      });
    } catch (error) {
      logger.warn('External API returned a non-JSON response. Using default success message.', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Controlled success response with only the first message
    const successResponse = { success: true, message: successMessage };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    logger.error('Error refreshing eSIM.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, message: 'Failed to refresh eSIM.' },
      { status: 500 }
    );
  }
}
