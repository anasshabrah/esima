// src/utils/fetchNetworks.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import logger from './logger.server';
import { sendEmail } from './email';
import Bottleneck from 'bottleneck';
import pRetry, { AbortError } from 'p-retry';

const prisma = new PrismaClient();
const speedOrder: string[] = ['2G', '3G', '4G', '5G'];
const limiter = new Bottleneck({ minTime: 500, maxConcurrent: 2 });

interface NetworkAPIResponse {
  countryNetworks: CountryNetworkAPI[];
}

interface CountryNetworkAPI {
  networks: NetworkAPI[];
}

interface NetworkAPI {
  name: string;
  brandName: string;
  speed: string[];
  mcc: string;
  mnc: string;
}

function normalizeIso(iso: string): string {
  return iso.replace(/\s/g, '-').replace(/\+$/, '').toUpperCase();
}

function getHighestSpeed(speeds: string[]): string {
  if (speeds.length === 0) {
    return '4G';
  }

  let highestSpeed = '4G';
  for (const speed of speeds) {
    if (speedOrder.includes(speed) && speedOrder.indexOf(speed) > speedOrder.indexOf(highestSpeed)) {
      highestSpeed = speed;
    }
  }

  return highestSpeed;
}

async function fetchNetworksForCountry(iso: string): Promise<NetworkAPI[]> {
  const { API_URL, ESIM_API_KEY } = process.env;
  if (!API_URL || !ESIM_API_KEY) {
    throw new Error('API_URL or ESIM_API_KEY is missing.');
  }

  const url = `${API_URL}/networks?isos=${encodeURIComponent(iso)}`;
  const options = {
    method: 'GET',
    headers: {
      'X-API-Key': ESIM_API_KEY,
      'Content-Type': 'application/json',
    },
  };

  const fetchOperation = async (): Promise<NetworkAPI[]> => {
    const response = await fetch(url, options);

    if (response.status === 429) {
      throw new AbortError(`Rate limit exceeded for ${iso}`);
    }
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as NetworkAPIResponse;
    return Array.isArray(data.countryNetworks)
      ? data.countryNetworks.flatMap(cn => cn.networks)
      : [];
  };

  try {
    return await pRetry(fetchOperation, {
      retries: 5,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 16000,
      onFailedAttempt: (error: unknown) => {
        if (error instanceof AbortError) {
          logger.warn(`Rate limit exceeded for ${iso}, setting default network.`);
        } else if (error instanceof Error) {
          const attemptNumber = (error as any).attemptNumber || 'Unknown';
          const message = error.message || 'No message available';
          logger.warn(`Attempt ${attemptNumber} failed for ${iso}: ${message}`);
        } else {
          logger.warn(`An unexpected error occurred for ${iso}: ${String(error)}`);
        }
      },
    });
  } catch (error) {
    const errorInfo: Record<string, unknown> = {
      message: error instanceof Error ? error.message : 'Unknown error fetching networks',
      stack: error instanceof Error ? error.stack : undefined,
    };
    logger.error(`Failed to fetch networks for ${iso}:`, errorInfo);
    return [];
  }
}

export async function processNetworks() {
  try {
    const countries = await prisma.country.findMany({
      select: { id: true, iso: true },
    });

    const normalizedCountries = countries.map(country => ({
      id: country.id,
      iso: normalizeIso(country.iso),
    }));

    const countryNetworkBrandsMap: Map<number, string[]> = new Map();
    const countriesNeedingDefault: number[] = [];

    const networkFetchPromises = normalizedCountries.map(({ id, iso }) =>
      limiter.schedule(async () => {
        const countryNetworks = await fetchNetworksForCountry(iso);

        if (countryNetworks.length === 0) {
          countriesNeedingDefault.push(id);
          return;
        }

        const brandNames: string[] = [];

        for (const network of countryNetworks) {
          const speeds = network.speed || [];
          const validSpeeds: string[] = speeds.filter((speed: string) => speedOrder.includes(speed));

          const highestSpeed = getHighestSpeed(validSpeeds);

          if (network.brandName) {
            brandNames.push(network.brandName);
          }
        }

        const uniqueBrandNames = Array.from(new Set(brandNames));

        countryNetworkBrandsMap.set(id, uniqueBrandNames);
      })
    );

    await Promise.all(networkFetchPromises);

    const networkBrandsUpsertPromises = Array.from(countryNetworkBrandsMap.entries()).map(([countryId, networkBrands]) =>
      prisma.country.update({
        where: { id: countryId },
        data: { networkBrands },
      })
    );

    await Promise.all(networkBrandsUpsertPromises);

    if (countriesNeedingDefault.length > 0) {
      const defaultNetworkBrand = 'All Networks';

      const defaultNetworkUpsertPromises = countriesNeedingDefault.map(countryId =>
        prisma.country.update({
          where: { id: countryId },
          data: {
            networkBrands: {
              set: [defaultNetworkBrand],
            },
          },
        })
      );

      await Promise.all(defaultNetworkUpsertPromises);
    }

    const successEmailOptions = {
      to: 'esim@alodata.net',
      subject: 'Network Synchronization Completed',
      html: `<p>Network synchronization completed successfully on ${new Date().toLocaleString()}.</p>`,
    };

    await sendEmail(successEmailOptions);
  } catch (error) {
    const errorInfo: Record<string, unknown> = {
      message: error instanceof Error ? error.message : 'Unknown error during network synchronization',
      stack: error instanceof Error ? error.stack : undefined,
    };
    logger.error('Error during network synchronization:', errorInfo);

    const errorMessage = `
      <p>Error Message: ${error instanceof Error ? error.message : String(error)}</p>
      <p>Stack Trace:</p>
      <pre>${error instanceof Error ? error.stack : 'No stack trace available.'}</pre>
    `;

    const failureEmailOptions = {
      to: 'esim@alodata.net',
      subject: 'Network Synchronization Failed',
      html: `
        <p>The network synchronization script encountered an error on ${new Date().toLocaleString()}.</p>
        <p>Error Details:</p>
        ${errorMessage}
      `,
    };

    try {
      await sendEmail(failureEmailOptions);
    } catch (emailError) {
      const emailErrorInfo: Record<string, unknown> = {
        message: emailError instanceof Error ? emailError.message : 'Unknown error sending failure email',
        stack: emailError instanceof Error ? emailError.stack : undefined,
      };
      logger.error('Error sending failure notification email for networks:', emailErrorInfo);
    }

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
