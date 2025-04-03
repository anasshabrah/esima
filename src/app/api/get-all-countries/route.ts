// src/app/api/get-all-countries/route.ts

import { NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const serviceName = 'get-all-countries';
  const timestamp = new Date().toISOString();

  try {
    // Fetch countries from the database with necessary fields only
    const countriesFromDB = await prisma.country.findMany({
      select: {
        id: true,
        iso: true,
        name: true,
        region: true,
        networkBrands: true,
      },
    });

    // Filter out any countries without essential fields (e.g., ISO and name)
    const filteredCountries = countriesFromDB.filter(country => country.iso && country.name);

    return NextResponse.json(filteredCountries, { status: 200 });
  } catch (error) {
    logger.error('Error in get-all-countries API.', {
      service: serviceName,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
