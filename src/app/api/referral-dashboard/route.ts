// src/app/api/referral-dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger.server';
import { Language, UserWithOrders, Order, ReferralData } from '@/types/types';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication: Extract and verify JWT token
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

    // 2. Fetch ReferralUser based on decoded token
    const referralUser = await prisma.referralUser.findUnique({
      where: { id: decoded.referralUserId },
    });

    if (!referralUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Fetch Orders associated with the ReferralUser's coupon code
    const orders = await prisma.order.findMany({
      where: { couponCode: referralUser.couponCode },
      include: {
        user: true,
        bundle: {
          include: {
            countries: {
              include: { bundles: true },
            },
          },
        },
        country: true,
        esims: true,
      },
    });

    // 4. Extract referred users from orders
    const referredUsersMap: Record<number, UserWithOrders> = {};

    orders.forEach((order) => {
      const userId = order.user?.id;
      if (!userId) return;

      if (!referredUsersMap[userId]) {
        referredUsersMap[userId] = {
          id: userId,
          name: order.user.name ?? null,
          email: order.user.email,
          country: order.user.country,
          orders: [],
          createdAt: order.user.createdAt,
          language: order.user.language as Language,
        };
      }

      referredUsersMap[userId].orders.push(order as Order);
    });

    const referredUsers: UserWithOrders[] = Object.values(referredUsersMap);

    const code = referralUser.couponCode;
    const couponCode = code;

    // 5. Calculate Total Sales in USD
    const totalSales = orders.reduce((sum, order) => {
      if (order.exchangeRate && order.exchangeRate > 0) {
        return sum + order.amount / order.exchangeRate;
      }
      return sum + order.amount; // Assuming amount is in USD if exchangeRate is not available or invalid
    }, 0);

    // 6. Calculate Total Profit (now 10% of total sales)
    const totalProfit = parseFloat((totalSales * 0.1).toFixed(2));

    // 7. Log successful data fetch
    logger.info('Referral dashboard data fetched successfully.', { referralUserId: referralUser.id });

    // 8. Prepare ReferralData response
    const referralData: ReferralData = {
      couponCode,
      referredUsers,
      totalSales,
      totalProfit,
    };

    // 9. Return the ReferralData as JSON
    return NextResponse.json(referralData, { status: 200 });
  } catch (error: any) {
    logger.error('Fetch referral dashboard error:', { error: error.message });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
