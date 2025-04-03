// src/app/api/referral-dashboard/payment-settings/route.ts

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

    // Fetch ReferralUser
    const referralUser = await prisma.referralUser.findUnique({
      where: { id: decoded.referralUserId },
    });

    if (!referralUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return payment settings
    const paymentSettings = {
      paypalEmail: referralUser.paypalEmail,
      bankName: referralUser.bankName,
      swiftCode: referralUser.swiftCode,
      accountNumber: referralUser.accountNumber,
      iban: referralUser.iban,
      abaRoutingNumber: referralUser.abaRoutingNumber,
      transferCountry: referralUser.transferCountry,
      transferCity: referralUser.transferCity,
      transferPhone: referralUser.transferPhone,
      recipientName: referralUser.recipientName,
    };

    return NextResponse.json(paymentSettings, { status: 200 });
  } catch (error: any) {
    logger.error('Fetch payment settings error:', { error: error.message });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

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

    // Validate input data here (omitted for brevity)

    // Update ReferralUser with payment settings
    const updatedReferralUser = await prisma.referralUser.update({
      where: { id: decoded.referralUserId },
      data: {
        paypalEmail: data.paypalEmail,
        bankName: data.bankName,
        swiftCode: data.swiftCode,
        accountNumber: data.accountNumber,
        iban: data.iban,
        abaRoutingNumber: data.abaRoutingNumber,
        transferCountry: data.transferCountry,
        transferCity: data.transferCity,
        transferPhone: data.transferPhone,
        recipientName: data.recipientName,
      },
    });

    return NextResponse.json({ message: 'Payment settings updated successfully.' }, { status: 200 });
  } catch (error: any) {
    logger.error('Update payment settings error:', { error: error.message });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
