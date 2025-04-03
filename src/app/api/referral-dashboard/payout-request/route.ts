// src/app/api/referral-dashboard/payout-request/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger.server';

export async function POST(request: NextRequest) {
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

    const data = await request.json();
    const { amount, paymentMethod } = data;

    // Validate amount and paymentMethod
    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is $50.' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required.' }, { status: 400 });
    }

    // Fetch ReferralUser
    const referralUser = await prisma.referralUser.findUnique({
      where: { id: decoded.referralUserId },
      include: {
        withdrawals: true,
      },
    });

    if (!referralUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate available balance (totalProfit - totalWithdrawn)
    const totalSales = await prisma.order.aggregate({
      where: { couponCode: referralUser.couponCode },
      _sum: { amount: true },
    });
    const totalProfit = (totalSales._sum.amount || 0) * 0.2;
    const totalWithdrawn = referralUser.withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalProfit - totalWithdrawn;

    if (amount > availableBalance) {
      return NextResponse.json({ error: 'Insufficient balance.' }, { status: 400 });
    }

    // Create Withdrawal Request
    await prisma.withdrawal.create({
      data: {
        referralUserId: referralUser.id,
        amount,
        paymentMethod,
        status: 'Pending',
      },
    });

    return NextResponse.json({ message: 'Payout request submitted successfully.' }, { status: 200 });
  } catch (error: any) {
    logger.error('Payout request error:', { error: error.message });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
