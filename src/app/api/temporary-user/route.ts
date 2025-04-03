// src/app/api/temporary-user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GeolocationData } from '@/types/types';
import crypto from 'crypto';
import logger from '@/utils/logger.server';
import { getCurrencySymbol, DEFAULT_CURRENCY_SYMBOL } from '@/utils/getCurrencySymbol';

interface TemporaryUserResponse {
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
  countryCode: string;
  language: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'create-temporary-user';
  const timestamp = new Date().toISOString();

  try {
    const { geoData } = await req.json();

    if (!geoData || typeof geoData !== 'object') {
      logger.warn('Invalid or missing geolocation data in request body.', { service: serviceName, timestamp });
      return NextResponse.json(
        { error: 'Invalid or missing geolocation data.' },
        { status: 400 }
      );
    }

    const {
      countryCode = 'US',
      currencyCode = 'USD',
      exchangeRate = 1,
      language = 'en',
      currencySymbol = getCurrencySymbol(currencyCode) || DEFAULT_CURRENCY_SYMBOL,
      ip = '127.0.0.1',
    }: GeolocationData = geoData;

    logger.info('Creating temporary user with provided geolocation details.', {
      service: serviceName,
      timestamp,
      currencyCode,
      currencySymbol,
      exchangeRate,
      countryCode,
      language,
      ip,
    });

    const token = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        token,
        ip,
        currencyCode,
        currencySymbol,
        exchangeRate,
        language,
        country: countryCode,
        password: '',
      },
    });

    logger.info('Temporary user created successfully.', {
      service: serviceName,
      timestamp,
      userId: user.id,
      token,
      ip,
      currencyCode,
      currencySymbol,
      countryCode,
      language,
    });

    const responseData: TemporaryUserResponse = {
      currencyCode,
      currencySymbol,
      exchangeRate,
      countryCode,
      language,
    };

    const response = NextResponse.json(responseData, { status: 200 });

    response.cookies.set('userToken', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1, // 1 day
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in temporary-user API.', { service: serviceName, timestamp, error: errorMessage });
    return NextResponse.json(
      { error: 'Failed to create temporary user.' },
      { status: 500 }
    );
  }
}
