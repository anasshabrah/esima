// src/app/api/apply-bundle/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import logger from '@/utils/logger.server';
import { ApplyBundleRequest, ESIMDetailWithQRCode } from '@/types/types';

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

const bundleObjectSchema = z.object({
  name: z.string(),
  iccid: z.string().optional(),
  startTime: z.string().optional(),
  repeat: z.number().optional(),
  allowReassign: z.boolean().optional(),
});

const applyBundleSchema = z.object({
  bundles: z.array(bundleObjectSchema),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    const parsedBody = applyBundleSchema.safeParse(body);
    if (!parsedBody.success) {
      logger.error('Validation Error', { errors: parsedBody.error.errors });
      return NextResponse.json(
        { error: 'Invalid input data.', details: parsedBody.error.errors },
        { status: 400 }
      );
    }

    const { bundles } = parsedBody.data;

    const sanitizedBundles = bundles.map((bundle) => ({
      ...bundle,
      iccid: bundle.iccid ? '****' : '',
    }));

    const applyBundleData: ApplyBundleRequest = {
      bundles: bundles.map((bundle) => ({
        name: bundle.name,
        iccid: bundle.iccid || '',
      })),
    };

    const startTime = Date.now();
    const response = await fetch(`${API_URL}/esims/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ESIM_API_KEY,
      },
      body: JSON.stringify(applyBundleData),
    });
    const duration = Date.now() - startTime;

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.message || 'Unknown error from eSIM API';
      logger.error('Failed to apply bundle', { errorMessage });
      return NextResponse.json(
        { error: `Failed to apply bundle: ${errorMessage}` },
        { status: response.status }
      );
    }

    const esims: ESIMDetailWithQRCode[] = responseData.esims || [];
    const successStatuses = ['Success', 'Successfully Applied Bundle'];
    const failedEsims = esims.filter(
      (esim) => !successStatuses.includes(esim.status ?? '')
    );

    if (failedEsims.length > 0) {
      const errorMessages = failedEsims
        .map((esim) => esim.status ?? 'Unknown error')
        .join('; ');
      logger.error('Failed to apply bundle', { errorMessages });
      return NextResponse.json(
        { error: `Failed to apply bundle: ${errorMessages}` },
        { status: 400 }
      );
    }

    const esimsWithDetails = await Promise.all(
      esims.map(async (esim) => {
        const iccid = esim.iccid;
        const esimResponse = await fetch(
          `${API_URL}/esims/${encodeURIComponent(iccid)}?additionalFields=smdpAddress,matchingId,profileStatus`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': ESIM_API_KEY,
            },
          }
        );

        if (!esimResponse.ok) {
          logger.error('Failed to retrieve eSIM details', { iccid });
          throw new Error(`Failed to retrieve eSIM details for ICCID ${iccid}`);
        }

        const esimData = await esimResponse.json();

        const activationCode = `LPA:1$${esimData.smdpAddress}$${esimData.matchingId}`;

        return {
          iccid: esimData.iccid,
          smdpAddress: esimData.smdpAddress,
          matchingId: esimData.matchingId,
          activationCode,
          status: esimData.profileStatus || 'Unknown',
        } as ESIMDetailWithQRCode;
      })
    );

    const responseWithDetails = {
      ...responseData,
      esims: esimsWithDetails,
    };

    return NextResponse.json(responseWithDetails, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error applying bundle', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to apply bundle.', details: errorMessage },
      { status: 500 }
    );
  }
}
