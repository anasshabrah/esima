// src/utils/currencyUtils.ts

import { getCurrencySymbol, DEFAULT_CURRENCY_SYMBOL } from './getCurrencySymbol';

/**
 * Converts a price using the provided exchange rate.
 *
 * @param price - The original price.
 * @param exchangeRate - The exchange rate to apply.
 * @returns The converted price.
 */
export const convertPrice = (price: number, exchangeRate: number): number => {
  return price * exchangeRate;
};

/**
 * Formats the currency value by appending the currency symbol.
 *
 * @param amount - The amount to format.
 * @param currencyCode - The currency code (e.g., 'USD', 'TRY').
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const roundedAmount = Math.ceil(amount);
  const currencySymbol = getCurrencySymbol(currencyCode) || DEFAULT_CURRENCY_SYMBOL;
  return `${currencySymbol}${roundedAmount}`;
};
