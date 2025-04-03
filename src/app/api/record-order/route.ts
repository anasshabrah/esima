// src/app/api/record-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchExchangeRate } from '@/lib/geolocation';
import logger from '@/utils/logger.server';
import { getCurrencySymbol, DEFAULT_CURRENCY_SYMBOL } from '@/utils/getCurrencySymbol';
import { RecordOrderRequest, RecordOrderResponse } from '@/types/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const serviceName = 'record-order';

  try {
    // 1) Parse the request JSON
    // Note: The RecordOrderRequest interface should be updated to include an optional orderReference field.
    const body: RecordOrderRequest = await req.json();
    const {
      email,
      bundleName,
      amount,
      purchasePrice, // Optional field: purchase price (cost incurred)
      orderReference, // New field: external order reference to look up actual cost
      currency,
      paymentIntentId,
      country,
      quantity,
      couponCode,
      discountPercent,
      couponSponsor,
      esims,
      referralCode,
      name,
      phone,
    } = body;

    // 2) Basic Validation
    // Allow purchasePrice to be optional; if provided, it must be non-negative.
    if (
      !email ||
      !bundleName ||
      amount < 0 ||
      (purchasePrice !== undefined && purchasePrice !== null && purchasePrice < 0) ||
      !currency ||
      !paymentIntentId ||
      !country ||
      quantity < 1 ||
      !Array.isArray(esims) ||
      esims.some(
        (esim) =>
          !esim.iccid ||
          !esim.smdpAddress ||
          !esim.matchingId ||
          !esim.activationCode
      )
    ) {
      logger.error('Invalid input data.', { serviceName, body });
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    // Determine the final purchase price.
    // If purchasePrice is undefined or null and an orderReference is provided,
    // then call the external API to retrieve the actual cost.
    let finalPurchasePrice = purchasePrice === undefined ? null : purchasePrice;

    const API_URL = process.env.API_URL;
    const ESIM_API_KEY = process.env.ESIM_API_KEY;
    if (!API_URL || !ESIM_API_KEY) {
      logger.error('API_URL or ESIM_API_KEY is missing.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    if (finalPurchasePrice === null && orderReference) {
      const externalResponse = await fetch(`${API_URL}/orders/${orderReference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ESIM_API_KEY,
        },
      });
      if (externalResponse.ok) {
        const orderDetails = await externalResponse.json();
        // Assuming the external API returns a "total" field representing the actual cost.
        finalPurchasePrice = parseFloat(orderDetails.total);
        logger.info('Fetched purchasePrice from external API.', {
          orderReference,
          purchasePrice: finalPurchasePrice,
        });
      } else {
        logger.error('Failed to fetch order details from external API.', { orderReference });
      }
    }

    // 3) Check authentication (optional, if you allow a token)
    let user = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      user = await prisma.user.findUnique({ where: { token } });
      if (!user) {
        logger.warn('Invalid or expired token.', { serviceName, token });
      }
    }

    // 4) If no user was found via auth, handle referral code or create user if needed.
    if (!user) {
      const currencyCode = currency.toUpperCase();
      const exchangeRate = await fetchExchangeRate(currencyCode);
      const currencySymbol = getCurrencySymbol(currencyCode) || DEFAULT_CURRENCY_SYMBOL;

      let referrerId: number | null = null;
      if (referralCode) {
        if (!/^[A-Z0-9]{6}$/.test(referralCode)) {
          logger.warn('Invalid referral code format.', { serviceName, referralCode });
          return NextResponse.json({ error: 'Invalid referral code format.' }, { status: 400 });
        }
        const referrer = await prisma.referralUser.findUnique({
          where: { couponCode: referralCode },
        });
        if (!referrer) {
          logger.warn('Invalid referral code.', { serviceName, referralCode });
          return NextResponse.json({ error: 'Invalid referral code.' }, { status: 400 });
        }
        referrerId = referrer.id;
      }

      user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || null,
            phone: phone || null,
            country,
            referrerId,
            password: '',
            token: null,
            ip: null,
            currencyCode,
            currencySymbol,
            exchangeRate,
            language: 'en',
          },
        });
        logger.info('User created.', { serviceName, userId: user.id });
      } else {
        if (referrerId && user.referrerId !== referrerId) {
          logger.warn('User referrer mismatch. Existing referrerId will be retained.', {
            serviceName,
            userId: user.id,
            expectedReferrerId: referrerId,
            actualReferrerId: user.referrerId,
          });
        }
      }
    } else {
      if (user.email !== email) {
        logger.warn('Email mismatch with authenticated user.', {
          serviceName,
          userEmail: user.email,
          requestEmail: email,
        });
        return NextResponse.json(
          { error: 'Unauthorized: Email does not match authenticated user.' },
          { status: 401 }
        );
      }
    }

    // 5) Fetch country record
    const countryRecord = await prisma.country.findUnique({
      where: { iso: country.toUpperCase() },
    });
    if (!countryRecord) {
      logger.warn('Country not found.', { serviceName, country });
      return NextResponse.json({ error: 'Country not found.' }, { status: 400 });
    }

    // 6) Fetch bundle record
    const bundle = await prisma.bundle.findUnique({
      where: { name: bundleName },
    });
    if (!bundle) {
      logger.warn('Bundle not found.', { serviceName, bundleName });
      return NextResponse.json({ error: 'Bundle not found.' }, { status: 400 });
    }

    // 7) Get an updated exchange rate for the user’s currency
    const currencyCode = currency.toUpperCase();
    const exchangeRateUpdated = await fetchExchangeRate(currencyCode);

    // 8) Create the order with the final purchase price included (which may now have a value)
    // Also compute the sellPrice (the selling price in USD)
    const order = await prisma.order.create({
      data: {
        bundleId: bundle.id,
        countryId: countryRecord.id,
        amount,
        purchasePrice: finalPurchasePrice,
        sellPrice: amount / exchangeRateUpdated, // Compute selling price in USD
        currency,
        paymentIntentId,
        quantity,
        remainingQuantity: quantity,
        couponCode: couponCode || null,
        discountPercent: discountPercent || null,
        couponSponsor: couponSponsor || null,
        userId: user.id,
        exchangeRate: exchangeRateUpdated,
      },
    });
    logger.info('Order created successfully.', { serviceName, orderId: order.id });

    // 9) Create associated eSIMs in the database
    const createdEsims = [];
    for (const esim of esims) {
      const createdEsim = await prisma.eSIM.create({
        data: {
          iccid: esim.iccid,
          smdpAddress: esim.smdpAddress,
          matchingId: esim.matchingId,
          activationCode: esim.activationCode,
          status: esim.status || null,
          orderId: order.id,
        },
      });
      createdEsims.push(createdEsim);
    }
    logger.info('eSIMs created and associated with order.', {
      serviceName,
      orderId: order.id,
      esims: createdEsims.map((e) => e.iccid),
    });

    // 10) Trigger sending of order email (the server-side record-order endpoint handles sending email)
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const origin = `${protocol}://${host}`;

    const emailPayload = {
      email,
      bundleDetails: {
        name: bundle.name,
        dataAmount: bundle.dataAmount,
        duration: bundle.duration,
        price: bundle.price,
      },
      esimDetails: esims.map((e) => ({
        iccid: e.iccid,
        smdpAddress: e.smdpAddress,
        matchingId: e.matchingId,
        activationCode: e.activationCode,
      })),
    };

    const emailResponse = await fetch(`${origin}/api/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => null);
      logger.error('Error sending email.', {
        serviceName,
        status: emailResponse.status,
        errorData,
      });
    } else {
      logger.info('Email request sent successfully.', { serviceName, orderId: order.id });
    }

    // 11) Return success response to the client
    const responsePayload: RecordOrderResponse = {
      message: 'Order recorded successfully.',
      orderId: order.id,
    };
    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    logger.error('Error recording order.', {
      error: error.message,
      serviceName,
      stack: error.stack,
    });
    return NextResponse.json({ error: 'Failed to record order.' }, { status: 500 });
  }
}
