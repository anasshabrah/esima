// src/app/api/referral-dashboard/withdrawal-history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger.server';

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      logger.error('JWT verification failed:', { error: err });
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    // Fetch Withdrawal History
    const withdrawals = await prisma.withdrawal.findMany({
      where: { referralUserId: decoded.referralUserId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(withdrawals, { status: 200 });
  } catch (error: any) {
    logger.error('Fetch withdrawal history error:', { error: error.message });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
