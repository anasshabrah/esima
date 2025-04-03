// src/lib/countryCurrencyMap.ts

/**
 * A mapping of ISO 3166-1 alpha-2 country codes to their corresponding
 * ISO 4217 currency codes. This mapping is used to determine the currency
 * based on the user's country.
 *
 * @remarks
 * - Ensure that this mapping includes all the countries your application supports.
 * - Some countries share the same currency (e.g., EUR is used by multiple EU countries).
 * - Territories and regions are included where applicable.
 */

export const countryCurrencyMap: Record<string, string> = {
  // Afghanistan
  AF: 'AFN',

  // Albania
  AL: 'ALL',

  // Algeria
  DZ: 'DZD',

  // Andorra
  AD: 'EUR',

  // Angola
  AO: 'AOA',

  // Antigua and Barbuda
  AG: 'XCD',

  // Argentina
  AR: 'ARS',

  // Armenia
  AM: 'AMD',

  // Australia
  AU: 'AUD',

  // Austria
  AT: 'EUR',

  // Azerbaijan
  AZ: 'AZN',

  // Bahamas
  BS: 'BSD',

  // Bahrain
  BH: 'BHD',

  // Bangladesh
  BD: 'BDT',

  // Barbados
  BB: 'BBD',

  // Belarus
  BY: 'BYN',

  // Belgium
  BE: 'EUR',

  // Belize
  BZ: 'BZD',

  // Benin
  BJ: 'XOF',

  // Bhutan
  BT: 'BTN',

  // Bolivia
  BO: 'BOB',

  // Bosnia and Herzegovina
  BA: 'BAM',

  // Botswana
  BW: 'BWP',

  // Brazil
  BR: 'BRL',

  // Brunei
  BN: 'BND',

  // Bulgaria
  BG: 'BGN',

  // Burkina Faso
  BF: 'XOF',

  // Burundi
  BI: 'BIF',

  // Cambodia
  KH: 'KHR',

  // Cameroon
  CM: 'XAF',

  // Canada
  CA: 'CAD',

  // Cape Verde
  CV: 'CVE',

  // Central African Republic
  CF: 'XAF',

  // Chad
  TD: 'XAF',

  // Chile
  CL: 'CLP',

  // China
  CN: 'CNY',

  // Colombia
  CO: 'COP',

  // Comoros
  KM: 'KMF',

  // Congo (Democratic Republic)
  CD: 'CDF',

  // Congo (Republic)
  CG: 'XAF',

  // Costa Rica
  CR: 'CRC',

  // Croatia
  HR: 'HRK',

  // Cuba
  CU: 'CUP',

  // Cyprus
  CY: 'EUR',

  // Czech Republic
  CZ: 'CZK',

  // Denmark
  DK: 'DKK',

  // Djibouti
  DJ: 'DJF',

  // Dominica
  DM: 'XCD',

  // Dominican Republic
  DO: 'DOP',

  // East Timor (Timor-Leste)
  TL: 'USD',

  // Ecuador
  EC: 'USD',

  // Egypt
  EG: 'EGP',

  // El Salvador
  SV: 'USD',

  // Equatorial Guinea
  GQ: 'XAF',

  // Eritrea
  ER: 'ERN',

  // Estonia
  EE: 'EUR',

  // Eswatini (Swaziland)
  SZ: 'SZL',

  // Ethiopia
  ET: 'ETB',

  // Fiji
  FJ: 'FJD',

  // Finland
  FI: 'EUR',

  // France
  FR: 'EUR',

  // Gabon
  GA: 'XAF',

  // Gambia
  GM: 'GMD',

  // Georgia
  GE: 'GEL',

  // Germany
  DE: 'EUR',

  // Ghana
  GH: 'GHS',

  // Greece
  GR: 'EUR',

  // Grenada
  GD: 'XCD',

  // Guatemala
  GT: 'GTQ',

  // Guinea
  GN: 'GNF',

  // Guinea-Bissau
  GW: 'XOF',

  // Guyana
  GY: 'GYD',

  // Haiti
  HT: 'HTG',

  // Honduras
  HN: 'HNL',

  // Hungary
  HU: 'HUF',

  // Iceland
  IS: 'ISK',

  // India
  IN: 'INR',

  // Indonesia
  ID: 'IDR',

  // Iran
  IR: 'IRR',

  // Iraq
  IQ: 'IQD',

  // Ireland
  IE: 'EUR',

  // Israel
  IL: 'ILS',

  // Italy
  IT: 'EUR',

  // Jamaica
  JM: 'JMD',

  // Japan
  JP: 'JPY',

  // Jordan
  JO: 'JOD',

  // Kazakhstan
  KZ: 'KZT',

  // Kenya
  KE: 'KES',

  // Kiribati
  KI: 'AUD',

  // Korea, North
  KP: 'KPW',

  // Korea, South
  KR: 'KRW',

  // Kuwait
  KW: 'KWD',

  // Kyrgyzstan
  KG: 'KGS',

  // Laos
  LA: 'LAK',

  // Latvia
  LV: 'EUR',

  // Lebanon
  LB: 'LBP',

  // Lesotho
  LS: 'LSL',

  // Liberia
  LR: 'LRD',

  // Libya
  LY: 'LYD',

  // Liechtenstein
  LI: 'CHF',

  // Lithuania
  LT: 'EUR',

  // Luxembourg
  LU: 'EUR',

  // Madagascar
  MG: 'MGA',

  // Malawi
  MW: 'MWK',

  // Malaysia
  MY: 'MYR',

  // Maldives
  MV: 'MVR',

  // Mali
  ML: 'XOF',

  // Malta
  MT: 'EUR',

  // Marshall Islands
  MH: 'USD',

  // Mauritania
  MR: 'MRU',

  // Mauritius
  MU: 'MUR',

  // Mexico
  MX: 'MXN',

  // Micronesia
  FM: 'USD',

  // Moldova
  MD: 'MDL',

  // Monaco
  MC: 'EUR',

  // Mongolia
  MN: 'MNT',

  // Montenegro
  ME: 'EUR',

  // Morocco
  MA: 'MAD',

  // Mozambique
  MZ: 'MZN',

  // Myanmar (Burma)
  MM: 'MMK',

  // Namibia
  NA: 'NAD',

  // Nauru
  NR: 'AUD',

  // Nepal
  NP: 'NPR',

  // Netherlands
  NL: 'EUR',

  // New Zealand
  NZ: 'NZD',

  // Nicaragua
  NI: 'NIO',

  // Niger
  NE: 'XOF',

  // Nigeria
  NG: 'NGN',

  // North Macedonia
  MK: 'MKD',

  // Norway
  NO: 'NOK',

  // Oman
  OM: 'OMR',

  // Pakistan
  PK: 'PKR',

  // Palau
  PW: 'USD',

  // Panama
  PA: 'PAB',

  // Papua New Guinea
  PG: 'PGK',

  // Paraguay
  PY: 'PYG',

  // Peru
  PE: 'PEN',

  // Philippines
  PH: 'PHP',

  // Poland
  PL: 'PLN',

  // Portugal
  PT: 'EUR',

  // Qatar
  QA: 'QAR',

  // Romania
  RO: 'RON',

  // Russia
  RU: 'RUB',

  // Rwanda
  RW: 'RWF',

  // Saint Kitts and Nevis
  KN: 'XCD',

  // Saint Lucia
  LC: 'XCD',

  // Saint Vincent and the Grenadines
  VC: 'XCD',

  // Samoa
  WS: 'WST',

  // San Marino
  SM: 'EUR',

  // Sao Tome and Principe
  ST: 'STN',

  // Saudi Arabia
  SA: 'SAR',

  // Senegal
  SN: 'XOF',

  // Serbia
  RS: 'RSD',

  // Seychelles
  SC: 'SCR',

  // Sierra Leone
  SL: 'SLL',

  // Singapore
  SG: 'SGD',

  // Slovakia
  SK: 'EUR',

  // Slovenia
  SI: 'EUR',

  // Solomon Islands
  SB: 'SBD',

  // Somalia
  SO: 'SOS',

  // South Africa
  ZA: 'ZAR',

  // South Sudan
  SS: 'SSP',

  // Spain
  ES: 'EUR',

  // Sri Lanka
  LK: 'LKR',

  // Sudan
  SD: 'SDG',

  // Suriname
  SR: 'SRD',

  // Sweden
  SE: 'SEK',

  // Switzerland
  CH: 'CHF',

  // Syria
  SY: 'SYP',

  // Taiwan
  TW: 'TWD',

  // Tajikistan
  TJ: 'TJS',

  // Tanzania
  TZ: 'TZS',

  // Thailand
  TH: 'THB',

  // Togo
  TG: 'XOF',

  // Tonga
  TO: 'TOP',

  // Trinidad and Tobago
  TT: 'TTD',

  // Tunisia
  TN: 'TND',

  // Turkey
  TR: 'TRY',

  // Turkmenistan
  TM: 'TMT',

  // Tuvalu
  TV: 'AUD',

  // Uganda
  UG: 'UGX',

  // Ukraine
  UA: 'UAH',

  // United Arab Emirates
  AE: 'AED',

  // United Kingdom
  GB: 'GBP',

  // United States
  US: 'USD',

  // Uruguay
  UY: 'UYU',

  // Uzbekistan
  UZ: 'UZS',

  // Vanuatu
  VU: 'VUV',

  // Vatican City
  VA: 'EUR',

  // Venezuela
  VE: 'VES',

  // Vietnam
  VN: 'VND',

  // Yemen
  YE: 'YER',

  // Zambia
  ZM: 'ZMW',

  // Zimbabwe
  ZW: 'ZWL',
};

/**
 * @example
 * import { countryCurrencyMap } from '@/lib/countryCurrencyMap';
 * const currency = countryCurrencyMap['US']; // 'USD'
 */
