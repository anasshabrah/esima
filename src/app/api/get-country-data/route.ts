// src/app/api/get-country-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { prisma } from '@/lib/prisma';
import { CountryWithBundles, Network } from '@/types/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'get-country-data';
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(req.url);
    const isoCode = searchParams.get('isoCode');

    if (!isoCode) {
      logger.warn('Missing isoCode parameter.', { service: serviceName, timestamp });
      return NextResponse.json({ error: 'Missing isoCode parameter.' }, { status: 400 });
    }

    const normalizedCountryIso = isoCode.trim().toUpperCase();

    const country: CountryWithBundles | null = await prisma.country.findUnique({
      where: { iso: normalizedCountryIso },
      include: {
        bundles: {
          include: {
            countries: true,
          },
        },
      },
    });

    if (!country) {
      logger.warn('Country not found.', {
        service: serviceName,
        countryIso: normalizedCountryIso,
        timestamp,
      });
      return NextResponse.json({ error: 'Country not found.' }, { status: 404 });
    }

    const networks: Network[] = (country.networkBrands || []).map((brandName: string) => ({
      name: brandName,
      brandName: brandName,
      speed: 'N/A',
    }));

    const bundles = country.bundles || [];

    const responseData = {
      bundles,
      networks,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in get-country-data API.', {
      service: serviceName,
      timestamp,
      error: errorMessage,
    });
    return NextResponse.json({ error: 'Failed to get country data.' }, { status: 500 });
  }
}
