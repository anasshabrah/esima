// src/app/api/purchase-bundles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { ESIMDetail } from '@/types/types';

export async function POST(req: NextRequest) {
  const serviceName = 'purchase-bundles';
  const timestamp = new Date().toISOString();

  try {
    const body = await req.json();
    const {
      bundleName,
      quantity,
      assign = true,
      autoApplyBundles = true,
    } = body;

    // Input Validation
    if (
      typeof bundleName !== 'string' ||
      typeof quantity !== 'number' ||
      quantity < 1
    ) {
      logger.error('Invalid input data.', { body });
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    const orderPayload = {
      type: 'transaction',
      assign,
      autoApplyBundles,
      order: [
        {
          type: 'bundle',
          quantity,
          item: bundleName,
        },
      ],
    };

    const { API_URL, ESIM_API_KEY } = process.env;
    if (!API_URL || !ESIM_API_KEY) {
      logger.error('API_URL or ESIM_API_KEY is missing.');
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }

    // Send order to eSIM API
    const orderResponse = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      logger.error('Failed to purchase bundles.', { orderData });
      return NextResponse.json(
        { error: 'Failed to purchase bundles.' },
        { status: orderResponse.status }
      );
    }

    const { orderReference } = orderData;

    if (!orderReference) {
      logger.error('Order reference not found.');
      return NextResponse.json(
        { error: 'Order reference not found.' },
        { status: 500 }
      );
    }

    // Fetch eSIM assignments
    const assignmentsUrl = `${API_URL}/esims/assignments?reference=${encodeURIComponent(
      orderReference
    )}&additionalFields=smdpAddress,matchingId,profileStatus`;

    const assignmentsResponse = await fetch(assignmentsUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
    });

    const assignmentsData = await assignmentsResponse.json();

    if (!assignmentsResponse.ok) {
      logger.error('Failed to retrieve eSIM assignments.', { assignmentsData });
      return NextResponse.json(
        { error: 'Failed to retrieve eSIM assignments.' },
        { status: assignmentsResponse.status }
      );
    }

    let esimsList: ESIMDetail[] = [];

    if (Array.isArray(assignmentsData)) {
      esimsList = assignmentsData;
    } else if (assignmentsData.esims) {
      esimsList = assignmentsData.esims;
    } else {
      logger.error('Invalid assignments data format.');
      return NextResponse.json(
        { error: 'Invalid assignments data format.' },
        { status: 500 }
      );
    }

    // Fetch detailed eSIM data
    const esimsWithDetails = await Promise.all(
      esimsList.map(async (esim) => {
        const esimDetailsResponse = await fetch(
          `${API_URL}/esims/${encodeURIComponent(
            esim.iccid
          )}?additionalFields=smdpAddress,matchingId,profileStatus`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'X-API-Key': ESIM_API_KEY,
            },
          }
        );
        const esimDetails = await esimDetailsResponse.json();
        if (!esimDetailsResponse.ok) {
          logger.error('Failed to fetch eSIM details.', { iccid: esim.iccid });
          return null;
        }
        const activationCode = `LPA:1$${esimDetails.smdpAddress}$${esimDetails.matchingId}`;
        return {
          iccid: esimDetails.iccid,
          smdpAddress: esimDetails.smdpAddress,
          matchingId: esimDetails.matchingId,
          activationCode,
          status: esimDetails.profileStatus || 'Unknown',
        };
      })
    );

    const esimsWithDetailsFiltered = esimsWithDetails.filter(
      (esim) => esim !== null
    ) as ESIMDetail[];

    return NextResponse.json(
      {
        orderData,
        esims: esimsWithDetailsFiltered,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in purchase-bundles.', {
      error: error instanceof Error ? error.message : 'Unknown error',
      service: serviceName,
      timestamp,
    });
    return NextResponse.json(
      { error: 'Failed to purchase bundles.' },
      { status: 500 }
    );
  }
}
