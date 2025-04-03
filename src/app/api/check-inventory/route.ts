// src/app/api/check-inventory/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { InventoryBundle } from '@/types/types';

export const runtime = 'nodejs';

const { API_URL, ESIM_API_KEY } = (() => {
  const API_URL = process.env.API_URL;
  const ESIM_API_KEY = process.env.ESIM_API_KEY;

  if (!API_URL || !ESIM_API_KEY) {
    const errorMsg = 'API_URL or ESIM_API_KEY is missing in environment variables.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  return { API_URL, ESIM_API_KEY };
})();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bundleName } = body;

    if (!bundleName || typeof bundleName !== 'string' || bundleName.trim() === '') {
      logger.error('Invalid input data', { body });
      return NextResponse.json(
        { error: 'Invalid input data. "bundleName" must be a non-empty string.' },
        { status: 400 }
      );
    }

    const trimmedBundleName = bundleName.trim();

    const response = await fetch(`${API_URL}/inventory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
    });

    if (!response.ok) {
      logger.error('Failed to fetch inventory', {
        status: response.status,
        statusText: response.statusText,
        bundleName: trimmedBundleName,
      });
      return NextResponse.json({ error: 'Failed to fetch inventory.' }, { status: 500 });
    }

    const data = await response.json();
    const bundles: InventoryBundle[] = data.bundles.map((bundle: any) => ({
      name: bundle.name,
      available: bundle.available.map((a: any) => ({ remaining: a.remaining })),
    }));

    const bundle = bundles.find((b) => b.name === trimmedBundleName);
    let availableQuantity = 0;

    if (bundle) {
      availableQuantity = bundle.available.reduce(
        (sum, avail) => sum + avail.remaining,
        0
      );
    }

    return NextResponse.json({ availableQuantity }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error in check-inventory', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to check inventory.', details: errorMessage },
      { status: 500 }
    );
  }
}
