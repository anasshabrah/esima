// src/utils/fetchCatalogue.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fetch, { RequestInit, Response as FetchResponse } from 'node-fetch';
import https from 'https';
import logger from './logger.server';
import { sendEmail } from './email';

const prisma = new PrismaClient();
const speedOrder: string[] = ['2G', '3G', '4G', '5G'];
const agent = new https.Agent({
  rejectUnauthorized: false,
});

function normalizeIso(iso: any): string {
  if (typeof iso === 'string') {
    return iso.replace(/\s/g, '-').replace(/\+$/, '').toUpperCase();
  } else if (typeof iso === 'object' && iso !== null) {
    if ('code' in iso && typeof iso.code === 'string') {
      return normalizeIso(iso.code);
    } else if ('isoCode' in iso && typeof iso.isoCode === 'string') {
      return normalizeIso(iso.isoCode);
    } else {
      logger.warn(`Unable to extract ISO code from object: ${JSON.stringify(iso)}`);
      return '';
    }
  } else {
    logger.warn(`Expected iso to be a string or object, but received type ${typeof iso}: ${iso}`);
    return '';
  }
}

function stripParentheses(text: string): string {
  return text.replace(/\s*\(.*?\)\s*/g, '').trim();
}

function cleanCountryName(country: string): string {
  const patternsToRemove: RegExp[] = [/ -the former/i, / of the/i, / of/i];
  let cleanedCountry = country;
  patternsToRemove.forEach(pattern => {
    cleanedCountry = cleanedCountry.replace(pattern, '');
  });
  return cleanedCountry.trim();
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

function reformatDescription(description: string): string {
  const parts = description.split(',').map(part => part.trim());
  if (parts.length < 4) {
    return description;
  }
  const [eSIM, dataAmount, duration, country] = parts;
  let formattedDataAmount: string;
  const dataAmountMatch = dataAmount.match(/^(\d+)\s*GB$/i);
  if (dataAmountMatch) {
    formattedDataAmount = `${dataAmountMatch[1]} GB Data Plan`;
  } else if (dataAmount.toLowerCase() === 'unlimited essential') {
    formattedDataAmount = 'Unlimited Data Plan';
  } else {
    formattedDataAmount = `${dataAmount} Data Plan`;
  }
  const cleanedCountry = cleanCountryName(stripParentheses(country));
  return `${eSIM} ${formattedDataAmount} for ${duration} in ${cleanedCountry}`;
}

function formatBundleNameProp(rawName: string): string {
  const parts = rawName.split('_');
  let dataAmount = '';
  let duration = '';
  if (parts.includes('ULP')) {
    dataAmount = 'Unlimited Data';
  } else {
    const dataPart = parts.find(part => part.endsWith('GB') || part.endsWith('MB'));
    if (dataPart) {
      dataAmount = dataPart.replace('GB', ' GB Data').replace('MB', ' MB Data');
    }
  }
  const durationPart = parts.find(part => part.endsWith('D'));
  if (durationPart) {
    const days = durationPart.replace('D', '');
    duration = `${parseInt(days, 10)} ${parseInt(days, 10) === 1 ? 'Day' : 'Days'}`;
  }
  return `${dataAmount} for ${duration}`.trim() || 'Unnamed Bundle';
}

interface Bundle {
  name: string;
  friendlyName?: string;
  description: string;
  dataAmount?: string;
  duration?: string;
  price?: number;
  autostart?: boolean;
  unlimited?: boolean;
  imageUrl: string;
  speed?: string[];
  groups?: string[];
  countries?: Country[];
  roamingEnabled?: any[];
}

interface Country {
  iso: any;
  name?: string;
  region?: string | null;
}

async function fetchCatalogue(): Promise<Bundle[]> {
  const { API_URL, ESIM_API_KEY } = process.env;
  if (!API_URL || !ESIM_API_KEY) {
    logger.error('API_URL or ESIM_API_KEY is missing. Please check your environment variables.');
    throw new Error('API_URL or ESIM_API_KEY is missing. Please check your environment variables.');
  }
  let page = 1;
  let totalPages = 1;
  const allBundles: Bundle[] = [];
  while (page <= totalPages) {
    const url = `${API_URL}/catalogue?pageSize=50&page=${page}`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'X-API-Key': ESIM_API_KEY,
        'Content-Type': 'application/json',
      },
      agent: agent,
    };
    try {
      const response: FetchResponse = await fetch(url, options);
      const responseBody = await response.text();
      if (!response.ok) {
        logger.error(`Failed to fetch catalogue: ${response.status} ${response.statusText} - ${responseBody}`);
        throw new Error(`Failed to fetch catalogue: ${response.status} ${response.statusText} - ${responseBody}`);
      }
      let data: any;
      try {
        data = JSON.parse(responseBody);
      } catch (parseError: any) {
        const errorInfo: Record<string, unknown> = {
          message: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          stack: parseError instanceof Error ? parseError.stack : undefined,
        };
        logger.error('Failed to parse catalogue API response:', errorInfo);
        throw new Error(`Failed to parse catalogue API response: ${parseError}`);
      }
      if (!data || !Array.isArray(data.bundles)) {
        logger.error(`Invalid API response on page ${page}: ${JSON.stringify(data)}`);
        throw new Error(`Invalid API response on page ${page}: missing 'bundles' array.`);
      }
      const validBundles = data.bundles.filter((bundle: any) => {
        return !(bundle.countries || []).some((country: any) => normalizeIso(country.iso) === 'IL');
      });
      allBundles.push(...validBundles);
      if (page === 1) {
        totalPages = data.pageCount || 1;
      }
      page += 1;
    } catch (error: any) {
      logger.error(`Error fetching page ${page}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  return allBundles;
}

export async function processCatalogue() {
  try {
    const bundles = await fetchCatalogue();
    if (!bundles || !Array.isArray(bundles)) {
      logger.error('Failed to fetch bundles or invalid bundles data.');
      throw new Error('Failed to fetch bundles or invalid bundles data.');
    }
    const filteredBundles = bundles.filter((bundle: Bundle) => {
      const hasValidName = !bundle.name.includes('_1D_') && !bundle.name.includes('_UL_') && !bundle.name.includes('_ULP_');
      const hasImageUrl = typeof bundle.imageUrl === 'string' && bundle.imageUrl.trim() !== '';
      return hasValidName && hasImageUrl;
    });
    const countriesFromBundles = filteredBundles.flatMap((bundle: Bundle) => bundle.countries || []).filter((country: Country) => normalizeIso(country.iso) !== 'IL');
    const allCountriesMap = new Map<string, any>();
    countriesFromBundles.forEach((country: Country) => {
      const normalizedIso = normalizeIso(country.iso);
      if (!normalizedIso) {
        logger.warn(`Skipping country with invalid ISO: ${JSON.stringify(country.iso)}`);
        return;
      }
      if (!allCountriesMap.has(normalizedIso)) {
        const cleanedName = country.name ? cleanCountryName(stripParentheses(country.name)) : 'Unknown';
        allCountriesMap.set(normalizedIso, {
          ...country,
          iso: normalizedIso,
          name: cleanedName,
        });
      }
    });
    const allCountries = Array.from(allCountriesMap.values());
    const countryUpsertPromises = allCountries.map((country: any) => {
      return prisma.country.upsert({
        where: { iso: country.iso },
        update: {
          name: country.name || '',
          region: country.region || null,
        },
        create: {
          iso: country.iso,
          name: country.name || '',
          region: country.region || null,
        },
      });
    });
    await Promise.all(countryUpsertPromises);
    const bundleUpsertPromises = filteredBundles.map(async (bundle: Bundle) => {
      const speeds: string[] = bundle.speed || [];
      const highestSpeed = getHighestSpeed(speeds);
      const originalPrice = bundle.price || 0;
      const adjustedPrice = Math.ceil(originalPrice * 1.7);
      const reformattedDescription = reformatDescription(bundle.description || '');
      const friendlyName = formatBundleNameProp(bundle.name);
      const countryIsos = (bundle.countries || [])
        .map((country: any) => normalizeIso(country.iso))
        .filter(iso => iso !== 'IL' && iso !== '');
      const countries = await prisma.country.findMany({
        where: { iso: { in: countryIsos } },
        select: { id: true, iso: true },
      });
      const countryConnections = countries.map((country: any) => ({ id: country.id }));
      const roamingEnabledIsos: string[] = (bundle.roamingEnabled || [])
        .map((roaming: any) => {
          if (typeof roaming === 'string') {
            return normalizeIso(roaming);
          } else if (typeof roaming === 'object' && roaming !== null) {
            return normalizeIso(roaming.iso);
          } else {
            logger.warn(`Unexpected roaming format: ${JSON.stringify(roaming)}`);
            return '';
          }
        })
        .filter(iso => iso !== 'IL' && iso !== '');
      await prisma.bundle.upsert({
        where: { name: bundle.name },
        update: {
          description: reformattedDescription,
          friendlyName: friendlyName || 'Unnamed Bundle',
          dataAmount: bundle.dataAmount ? Number(bundle.dataAmount) : 0,
          duration: bundle.duration ? Number(bundle.duration) : 0,
          price: adjustedPrice,
          autostart: bundle.autostart || false,
          unlimited: bundle.unlimited || false,
          imageUrl: bundle.imageUrl,
          speed: highestSpeed,
          groups: bundle.groups || [],
          countries: {
            set: countryConnections,
          },
          roamingEnabled: roamingEnabledIsos,
        },
        create: {
          name: bundle.name,
          friendlyName: friendlyName || 'Unnamed Bundle',
          description: reformattedDescription,
          dataAmount: bundle.dataAmount ? Number(bundle.dataAmount) : 0,
          duration: bundle.duration ? Number(bundle.duration) : 0,
          price: adjustedPrice,
          autostart: bundle.autostart || false,
          unlimited: bundle.unlimited || false,
          imageUrl: bundle.imageUrl,
          speed: highestSpeed,
          groups: bundle.groups || [],
          countries: {
            connect: countryConnections,
          },
          roamingEnabled: roamingEnabledIsos,
        },
      });
    });
    await Promise.all(bundleUpsertPromises);
    const sourceBundleNames = filteredBundles.map(bundle => bundle.name);
    await prisma.bundle.deleteMany({
      where: {
        name: {
          notIn: sourceBundleNames
        }
      }
    });
    const successEmailOptions = {
      to: 'esim@alodata.net',
      subject: 'Catalogue Synchronization Completed Successfully',
      html: `
        <p>The catalogue synchronization script has completed successfully on ${new Date().toLocaleString()}.</p>
        <p>All bundles and countries have been upserted and obsolete bundles have been deleted accordingly.</p>
      `,
    };
    await sendEmail(successEmailOptions);
  } catch (error: any) {
    const errorInfo: Record<string, unknown> = {
      message: error instanceof Error ? error.message : 'Unknown error during catalogue processing',
      stack: error instanceof Error ? error.stack : undefined,
    };
    logger.error('Error during catalogue processing:', errorInfo);
    const errorMessage = `
      <p>Error Message: ${error instanceof Error ? error.message : String(error)}</p>
      <p>Stack Trace:</p>
      <pre>${error instanceof Error ? error.stack : 'No stack trace available.'}</pre>
    `;
    const failureEmailOptions = {
      to: 'esim@alodata.net',
      subject: 'Catalogue Synchronization Failed',
      html: `
        <p>The catalogue synchronization script encountered an error on ${new Date().toLocaleString()}.</p>
        <p>Error Details:</p>
        ${errorMessage}
      `,
    };
    try {
      await sendEmail(failureEmailOptions);
    } catch (emailError: any) {
      const emailErrorInfo: Record<string, unknown> = {
        message: emailError instanceof Error ? emailError.message : 'Unknown error sending failure email',
        stack: emailError instanceof Error ? emailError.stack : undefined,
      };
      logger.error('Error sending failure notification email for catalogue:', emailErrorInfo);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
