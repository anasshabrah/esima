// src/app/api/get-geolocation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getGeolocationData, GeolocationData } from '@/lib/geolocation';
import logger from '@/utils/logger.server';

/**
 * API Route Handler for retrieving geolocation data.
 *
 * @param req - The incoming NextRequest.
 * @returns NextResponse containing GeolocationData or an error message.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'get-geolocation';
  const timestamp = new Date().toISOString();

  // Define default geolocation data with the required 'ip' property
  const defaultGeoData: GeolocationData = {
    countryCode: 'US',
    currencyCode: 'USD',
    exchangeRate: 1,
    language: 'en',
    currencySymbol: '$',
    ip: '127.0.0.1', // Added ip property
  };

  try {
    // Retrieve the User-Agent header (optional: can be used for logging or other purposes)
    const userAgent = req.headers.get('user-agent') || '';

    // Extract all headers as a Record<string, string | string[] | undefined>
    const headers: Record<string, string | string[] | undefined> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Log all incoming headers
    logger.info('Incoming headers received in get-geolocation API.', { service: serviceName, timestamp, headers });

    // Specifically log the presence of 'cf-ipcountry' and 'cf-connecting-ip' headers
    const cfIpCountry = headers['cf-ipcountry'];
    const cfConnectingIp = headers['cf-connecting-ip'];

    logger.info('Header Check: cf-ipcountry', { service: serviceName, timestamp, cfIpCountry });
    logger.info('Header Check: cf-connecting-ip', { service: serviceName, timestamp, cfConnectingIp });

    const geoData = await getGeolocationData(headers);

    if (!geoData) {
      logger.warn('Failed to fetch geolocation data.', { service: serviceName, timestamp });
      return NextResponse.json(
        { error: 'Failed to fetch geolocation data.' },
        { status: 500 }
      );
    }

    // Optionally log the geolocation data being returned
    logger.info('Geolocation data successfully retrieved.', { service: serviceName, timestamp, geoData });

    return NextResponse.json(geoData, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in get-geolocation API.', { service: serviceName, timestamp, error: errorMessage });
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
