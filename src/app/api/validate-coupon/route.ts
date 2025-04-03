// src/app/api/validate-coupon/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/utils/logger.server';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { couponCode } = await req.json();

    if (!couponCode || typeof couponCode !== 'string') {
      logger.warn('Coupon code is missing or invalid.');
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const cleanedCouponCode = couponCode.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanedCouponCode },
    });

    if (!coupon) {
      logger.warn('Invalid coupon code entered.', { couponCode: cleanedCouponCode });
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    const now = new Date();
    if (
      (coupon.validFrom && coupon.validFrom > now) ||
      (coupon.validUntil && coupon.validUntil < now)
    ) {
      logger.warn('Coupon code is not valid at this time.', { couponCode: cleanedCouponCode });
      return NextResponse.json({ error: 'Coupon code is not valid at this time.' }, { status: 400 });
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    logger.error('Error validating coupon.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to validate coupon.' }, { status: 500 });
  }
}
