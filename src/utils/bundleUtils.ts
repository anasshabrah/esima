// src/utils/bundleUtils.ts

import { Bundle, Language } from '@/types/types';
import { translateServer } from '@/utils/translateServer';

/**
 * Formats the bundle name based on its properties and the current language.
 *
 * @param bundle - The bundle object.
 * @param language - The current language code.
 * @param appendPrice - Whether to append the price to the bundle name.
 * @param formattedPrice - The formatted price string to append (if appendPrice is true).
 * @returns The formatted and translated bundle name.
 */
export const formatBundleName = (
  bundle: Bundle,
  language: Language,
  appendPrice: boolean = false,
  formattedPrice?: string
): string => {
  const { dataAmount, duration, unlimited, friendlyName } = bundle;

  // Determine the appropriate translation key based on whether the bundle is unlimited
  const nameKey = unlimited ? 'bundle_name_unlimited' : 'bundle_name_data';

  // Convert data amount to GB if it is in MB (assuming dataAmount is in MB if it's more than 0 and less than 1000 GB)
  const data = unlimited
    ? translateServer(language, 'bundle_unlimited')
    : dataAmount >= 1000
    ? dataAmount / 1000 // Convert MB to GB
    : dataAmount;

  // Prepare the parameters for translation
  const params: Record<string, string | number> = {
    data,
    days: duration,
  };

  // Get the translated bundle name using the utility function
  let bundleName = translateServer(language, nameKey, params);

  // Append the price if required
  if (appendPrice && formattedPrice) {
    bundleName += ` - ${formattedPrice}`;
  }

  return bundleName;
};
