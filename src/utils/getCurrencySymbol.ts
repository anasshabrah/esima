// src/utils/getCurrencySymbol.ts

import { currencySymbols, DEFAULT_CURRENCY_SYMBOL } from './currencySymbols';

/**
 * Retrieves the symbol for a given currency code.
 *
 * @param currencyCode - The ISO 4217 currency code.
 * @returns The corresponding currency symbol, or the default symbol if not found.
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return currencySymbols[currencyCode.toUpperCase()] || DEFAULT_CURRENCY_SYMBOL;
};

// Export DEFAULT_CURRENCY_SYMBOL to make it available for other modules
export { DEFAULT_CURRENCY_SYMBOL };
