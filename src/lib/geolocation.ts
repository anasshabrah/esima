// src/lib/geolocation.ts

import { GeolocationData, Language, ExchangeRateApiResponse } from '@/types/types';
import logger from '@/utils/logger.server';
import countryLanguageMap from './countryLanguageMap';
import { countryCurrencyMap } from './countryCurrencyMap';
import { getCurrencySymbol, DEFAULT_CURRENCY_SYMBOL } from '@/utils/getCurrencySymbol';
import fetch from 'node-fetch';

/**
 * Defines the structure of geolocation data.
 */
export type { GeolocationData };

/**
 * Default geolocation data used as a fallback.
 */
export const defaultGeoData: GeolocationData = {
  countryCode: 'US',
  currencyCode: 'USD',
  exchangeRate: 1,
  language: 'en',
  currencySymbol: '$',
  ip: '127.0.0.1',
};

/**
 * Determines if the current environment is local/development.
 *
 * @param ip - The IP address to check.
 * @returns True if it's a local environment; otherwise, false.
 */
function isLocalEnvironment(ip: string): boolean {
  const localhostIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  return (
    process.env.NODE_ENV === 'development' ||
    localhostIPs.includes(ip) ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('::ffff:192.168.') ||
    ip.startsWith('::ffff:10.')
  );
}

/**
 * Fetches the exchange rate between USD and the target currency.
 *
 * @param currencyCode - The target currency code.
 * @returns The exchange rate, or 1 if fetching fails or currency is USD.
 */
export async function fetchExchangeRate(currencyCode: string): Promise<number> {
  if (currencyCode.toUpperCase() === 'USD') {
    return 1;
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      logger.error('Exchange rate API key is not set.');
      return 1;
    }

    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    if (!response.ok) {
      throw new Error(`Exchange rate API response not ok: ${response.statusText}`);
    }

    // Use generic to specify the expected type (Requires TypeScript 4.9+)
    const data: ExchangeRateApiResponse = (await response.json()) as ExchangeRateApiResponse;

    if (data.result !== 'success') {
      throw new Error(`Exchange rate API error: ${data['error-type']}`);
    }

    const rates = data.conversion_rates;
    const rate = rates[currencyCode.toUpperCase()];
    if (!rate) {
      throw new Error(`Exchange rate for ${currencyCode} not found.`);
    }

    return rate;
  } catch (error) {
    logger.error('Error fetching exchange rate:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return 1;
  }
}

/**
 * Retrieves geolocation data based on the provided headers or IP address.
 *
 * @param headersOrIp - The request headers or IP address.
 * @returns A Promise that resolves to GeolocationData.
 */
export async function getGeolocationData(
  headersOrIp?: Record<string, string | string[] | undefined> | string
): Promise<GeolocationData> {
  try {
    let cfIpCountryHeader: string | undefined;
    let cfConnectingIp: string = '127.0.0.1'; // Default IP

    if (typeof headersOrIp === 'string') {
      // If input is IP string
      cfConnectingIp = headersOrIp;
      cfIpCountryHeader = 'US'; // Default country if IP is not mapped
      logger.info('getGeolocationData called with IP string.', { cfConnectingIp, cfIpCountryHeader });
    } else if (headersOrIp) {
      // If input is headers
      const headers = headersOrIp;
      const cfIpCountryHeaderRaw = headers['cf-ipcountry'];
      const cfConnectingIpHeaderRaw = headers['cf-connecting-ip'];

      cfIpCountryHeader = Array.isArray(cfIpCountryHeaderRaw) ? cfIpCountryHeaderRaw[0] : cfIpCountryHeaderRaw;
      cfConnectingIp = Array.isArray(cfConnectingIpHeaderRaw)
        ? cfConnectingIpHeaderRaw[0]
        : (cfConnectingIpHeaderRaw || '127.0.0.1');

      logger.info('getGeolocationData called with headers.', {
        cfIpCountryHeader,
        cfConnectingIp,
      });
    }

    const isLocal = isLocalEnvironment(cfConnectingIp);

    // Determine the country code
    const countryCode = isLocal ? 'US' : (cfIpCountryHeader || 'US').toUpperCase();

    // Determine the currency code based on the country code
    const currencyCode = countryCurrencyMap[countryCode] || 'USD';

    // Get the currency symbol; fallback to default if not found
    const currencySymbol = getCurrencySymbol(currencyCode) || DEFAULT_CURRENCY_SYMBOL;

    // Determine the language based on the country code
    const language: Language = countryLanguageMap[countryCode] || 'en';

    // Fetch exchange rate
    const exchangeRate = await fetchExchangeRate(currencyCode);

    const geoData: GeolocationData = {
      countryCode,
      currencyCode,
      exchangeRate,
      language,
      currencySymbol,
      ip: cfConnectingIp,
    };

    logger.info('Geolocation data constructed.', { geoData });

    return geoData;
  } catch (error) {
    logger.error('Error fetching geolocation data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return defaultGeoData;
  }
}
