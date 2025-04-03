// src/app/api/stripe-webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import logger from '@/utils/logger.server';
import { prisma } from '@/lib/prisma';

// Disable built-in body parsing so we can access the raw request body.
export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read the raw request body as text.
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret!);
  } catch (err: any) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Process the payment_intent.succeeded event.
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await handlePaymentIntentSucceeded(paymentIntent);
  } else {
    logger.info(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Extract metadata that was set during PaymentIntent creation.
  const { bundleName, email, quantity, originalAmount, orderId: metaOrderId } = paymentIntent.metadata;
  if (!email || !bundleName || !quantity || !originalAmount) {
    logger.warn('Missing required metadata on PaymentIntent', {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return;
  }

  try {
    // Look up the user by email.
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('User not found for webhook', { email });
      return;
    }

    // Look up the bundle using bundleName.
    const bundle = await prisma.bundle.findUnique({ where: { name: bundleName } });
    if (!bundle) {
      logger.warn('Bundle not found in webhook', { bundleName });
      return;
    }

    // Use the user's stored country (ISO code) to look up the Country record.
    const normalizedCountryIso = user.country ? user.country.toUpperCase() : 'US';
    const countryRecord = await prisma.country.findUnique({ where: { iso: normalizedCountryIso } });
    if (!countryRecord) {
      logger.warn('Country record not found for user', { email, country: user.country });
      return;
    }

    // Check if metadata.orderId is provided.
    const trimmedOrderId = metaOrderId?.trim();
    if (trimmedOrderId) {
      // If orderId exists, update that order's status (e.g. mark as succeeded).
      const existingOrder = await prisma.order.findUnique({
        where: { id: Number(trimmedOrderId) },
      });
      if (existingOrder) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { /* Optionally update a status field if available */ },
        });
        logger.info('Order updated to succeeded via webhook', { orderId: existingOrder.id });
        return;
      } else {
        logger.warn('Order not found for provided orderId', { orderId: trimmedOrderId });
      }
    }

    // If no orderId was provided (or the order was not found), create a new order record.
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        amount: parseFloat(originalAmount),
        currency: user.currencyCode, // Use user's stored currency.
        paymentIntentId: paymentIntent.id,
        quantity: parseInt(quantity, 10),
        remainingQuantity: parseInt(quantity, 10),
        bundleId: bundle.id,
        countryId: countryRecord.id,
        exchangeRate: user.exchangeRate, // Use user's stored exchange rate.
      },
    });

    logger.info('Order recorded via webhook', { orderId: newOrder.id });
  } catch (error: any) {
    logger.error('Error recording order in webhook', { error: error.message });
  }
}
