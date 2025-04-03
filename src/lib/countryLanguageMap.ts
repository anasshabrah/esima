// src/lib/countryLanguageMap.ts

import { Language } from '@/translations/supportedLanguages';

/**
 * A mapping of ISO 3166-1 alpha-2 country codes to their primary language codes.
 * Defaults to 'en' if the primary language is not supported.
 */
const countryLanguageMap: { [key: string]: Language } = {
  // Africa
  DZ: 'ar', // Algeria - Arabic
  BW: 'en', // Botswana - English
  CV: 'pt', // Cape Verde - Portuguese
  EG: 'ar', // Egypt - Arabic
  GA: 'fr', // Gabon - French
  MU: 'en', // Mauritius - English
  MA: 'ar', // Morocco - Arabic
  NA: 'en', // Namibia - English
  NG: 'en', // Nigeria - English
  ZA: 'en', // South Africa - English

  // Americas
  AR: 'es', // Argentina - Spanish
  BS: 'en', // Bahamas - English
  BB: 'en', // Barbados - English
  BZ: 'en', // Belize - English
  BR: 'pt', // Brazil - Portuguese
  CA: 'en', // Canada - English
  CL: 'es', // Chile - Spanish
  CO: 'es', // Colombia - Spanish
  CR: 'es', // Costa Rica - Spanish
  DO: 'es', // Dominican Republic - Spanish
  EC: 'es', // Ecuador - Spanish
  SV: 'es', // El Salvador - Spanish
  JM: 'en', // Jamaica - English
  MX: 'es', // Mexico - Spanish
  PA: 'es', // Panama - Spanish
  TT: 'en', // Trinidad and Tobago - English
  US: 'en', // United States - English
  UY: 'es', // Uruguay - Spanish

  // Asia
  AZ: 'en', // Azerbaijan - Default to English
  CN: 'zh', // China - Chinese
  AM: 'en', // Armenia - Default to English
  IN: 'en', // India - Default to English
  ID: 'en', // Indonesia - Default to English
  IL: 'en', // Israel - Default to English
  JP: 'ja', // Japan - Japanese
  KE: 'en', // Kenya - English
  KG: 'en', // Kyrgyzstan - Default to English
  LA: 'en', // Laos - Default to English
  LB: 'ar', // Lebanon - Arabic
  LS: 'en', // Lesotho - English
  LR: 'en', // Liberia - English
  MO: 'zh', // Macau - Chinese
  MG: 'fr', // Madagascar - French
  MW: 'en', // Malawi - English
  MY: 'en', // Malaysia - Default to English
  MV: 'en', // Maldives - Default to English
  MZ: 'pt', // Mozambique - Portuguese
  MM: 'en', // Myanmar - Default to English
  NP: 'en', // Nepal - Default to English
  PK: 'en', // Pakistan - Default to English
  PH: 'en', // Philippines - English
  RU: 'ru', // Russia - Russian
  SA: 'ar', // Saudi Arabia - Arabic
  SG: 'en', // Singapore - English
  SK: 'en', // Slovakia - Default to English
  SI: 'en', // Slovenia - Default to English
  TJ: 'en', // Tajikistan - Default to English
  TM: 'en', // Turkmenistan - Default to English
  TR: 'tr', // Turkey - Turkish
  AE: 'ar', // United Arab Emirates - Arabic
  UZ: 'en', // Uzbekistan - Default to English
  VN: 'en', // Vietnam - Default to English
  YE: 'ar', // Yemen - Arabic
  KZ: 'ru', // Kazakhstan - Russian
  TW: 'zh', // Taiwan - Chinese
  KR: 'ko', // South Korea - Korean

  // Europe
  AT: 'de', // Austria - German
  BE: 'nl', // Belgium - Dutch
  BG: 'en', // Bulgaria - Default to English
  CY: 'en', // Cyprus - Default to English
  CZ: 'en', // Czechia - Default to English
  DK: 'da', // Denmark - Danish
  EE: 'en', // Estonia - Default to English
  FI: 'fi', // Finland - Finnish
  FR: 'fr', // France - French
  DE: 'de', // Germany - German
  GR: 'en', // Greece - Default to English
  HU: 'en', // Hungary - Default to English
  IE: 'en', // Ireland - English
  IT: 'it', // Italy - Italian
  LV: 'en', // Latvia - Default to English
  LT: 'en', // Lithuania - Default to English
  LU: 'fr', // Luxembourg - French
  MC: 'fr', // Monaco - French
  NL: 'nl', // Netherlands - Dutch
  MK: 'en', // North Macedonia - Default to English
  NO: 'no', // Norway - Norwegian
  PL: 'en', // Poland - Default to English
  PT: 'pt', // Portugal - Portuguese
  RO: 'en', // Romania - Default to English
  ES: 'es', // Spain - Spanish
  SE: 'sv', // Sweden - Swedish
  CH: 'de', // Switzerland - German
  UA: 'uk', // Ukraine - Ukrainian
  GB: 'en', // United Kingdom - English
  RS: 'en', // Serbia - Default to English

  // Oceania
  AU: 'en', // Australia - English
  NZ: 'en', // New Zealand - English
  KI: 'en', // Kiribati - English
  NR: 'en', // Nauru - English
  TV: 'en', // Tuvalu - English
};

export default countryLanguageMap;
