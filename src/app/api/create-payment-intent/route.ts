// src/app/api/create-payment-intent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import logger from '@/utils/logger.server';
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from '@/types/types';

let stripeInstance: Stripe | null = null;

const zeroDecimalCurrencies = [
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW',
  'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF',
  'XOF', 'XPF',
];

const supportedCurrencies = [
  'USD', 'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG',
  'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP',
  'CRC', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ETB', 'EUR',
  'FJD', 'FKP', 'GBP', 'GEL', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD',
  'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JMD', 'JPY', 'KES',
  'KGS', 'KHR', 'KMF', 'KRW', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD',
  'LSL', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MUR', 'MVR',
  'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD',
  'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD',
  'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SEK', 'SGD', 'SHP', 'SLE', 'SOS',
  'SRD', 'STD', 'SZL', 'THB', 'TJS', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS',
  'UAH', 'UGX', 'UYU', 'UZS', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XOF',
  'XPF', 'YER', 'ZAR', 'ZMW',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Note: If you want to pre-create an order record on the client side,
    // include an optional "orderId" property in the request JSON.
    const body: CreatePaymentIntentRequest & { orderId?: number } = await request.json();
    const { amount, bundleName, email, quantity, currency, orderId } = body;

    const amt = Number(amount);
    const qty = Number(quantity);
    const curr = currency?.toUpperCase();

    if (!amt || amt <= 0 || !qty || qty < 1 || !bundleName || !email || !curr) {
      logger.warn('Invalid input data', { body });
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    if (!supportedCurrencies.includes(curr)) {
      logger.warn('Unsupported currency', { currency: curr });
      return NextResponse.json({ error: 'Unsupported currency.' }, { status: 400 });
    }

    if (!stripeInstance) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        logger.error('Stripe secret key is not defined.');
        return NextResponse.json(
          { error: 'Payment processing is currently unavailable.' },
          { status: 500 }
        );
      }
      stripeInstance = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' });
    }

    const isZeroDecimal = zeroDecimalCurrencies.includes(curr);
    const amountToCharge = isZeroDecimal ? Math.round(amt) : Math.round(amt * 100);

    // Embed essential data into metadata. If orderId is provided, include it.
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountToCharge,
      currency: curr,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bundleName,
        email,
        quantity: qty.toString(),
        originalAmount: amt.toString(),
        orderId: orderId ? orderId.toString() : '',
      },
      receipt_email: email,
    };

    const paymentIntent = await stripeInstance.paymentIntents.create(paymentIntentParams);

    if (!paymentIntent.client_secret) {
      logger.error('Payment intent client_secret is null');
      return NextResponse.json({ error: 'Payment processing failed.' }, { status: 500 });
    }

    const response: CreatePaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret,
      currency: curr,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    logger.error('Unexpected error in payment intent creation', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
