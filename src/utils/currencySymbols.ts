// src/utils/currencySymbols.ts

/**
 * A mapping of ISO 4217 currency codes to their corresponding symbols.
 * This is used to display currency values with the appropriate symbol.
 *
 * @remarks
 * - Ensure that all currencies used in the application are included.
 * - If a currency symbol is missing, it can be added here or a default symbol can be used.
 */

export const currencySymbols: Record<string, string> = {
  AFN: '؋',      // Afghanistan Afghani
  ALL: 'L',      // Albania Lek
  DZD: 'د.ج',    // Algeria Dinar
  ARS: '$',      // Argentina Peso
  AMD: '֏',      // Armenia Dram
  AUD: '$',      // Australia Dollar
  AZN: '₼',      // Azerbaijan Manat
  BSD: '$',      // Bahamas Dollar
  BDT: '৳',      // Bangladesh Taka
  BBD: '$',      // Barbados Dollar
  BYN: 'Br',     // Belarus Ruble
  BZD: '$',      // Belize Dollar
  XOF: 'CFA',    // Benin Franc
  BOB: 'Bs.',    // Bolivia Boliviano
  BAM: 'KM',     // Bosnia & Herzegovina Convertible Mark
  BWP: 'P',      // Botswana Pula
  BRL: 'R$',     // Brazil Real
  BND: '$',      // Brunei Dollar
  BGN: 'лв',     // Bulgaria Lev
  BIF: 'FBu',    // Burundi Franc
  KHR: '៛',      // Cambodia Riel
  CAD: '$',      // Canada Dollar
  CVE: '$',      // Cape Verde Escudo
  XAF: 'CFA',    // Central African Republic Franc
  CLP: '$',      // Chile Peso
  CNY: '¥',      // China Yuan
  COP: '$',      // Colombia Peso
  KMF: 'CF',     // Comoros Franc
  CDF: 'FC',     // Congo Franc
  CRC: '₡',      // Costa Rica Colon
  EUR: '€',      // Euro
  CZK: 'Kč',     // Czech Republic Koruna
  DKK: 'kr',     // Denmark Krone
  DJF: 'FDj',    // Djibouti Franc
  DOP: '$',      // Dominican Republic Peso
  USD: '$',      // United States Dollar
  EGP: 'ج.م',    // Egypt Pound
  SZL: 'L',      // Eswatini Lilangeni
  ETB: 'Br',     // Ethiopia Birr
  FJD: '$',      // Fiji Dollar
  GMD: 'D',      // Gambia Dalasi
  GEL: '₾',      // Georgia Lari
  GTQ: 'Q',      // Guatemala Quetzal
  GNF: 'FG',     // Guinea Franc
  GYD: '$',      // Guyana Dollar
  HTG: 'G',      // Haiti Gourde
  HNL: 'L',      // Honduras Lempira
  HKD: '$',      // Hong Kong Dollar
  HUF: 'Ft',     // Hungary Forint
  ISK: 'kr',     // Iceland Krona
  INR: '₹',      // India Rupee
  IDR: 'Rp',     // Indonesia Rupiah
  ILS: '₪',      // Israel Shekel
  JMD: '$',      // Jamaica Dollar
  JPY: '¥',      // Japan Yen
  KZT: '₸',      // Kazakhstan Tenge
  KES: 'KSh',    // Kenya Shilling
  KGS: 'с',      // Kyrgyzstan Som
  LAK: '₭',      // Laos Kip
  LBP: 'ل.ل',    // Lebanon Pound
  LSL: 'L',      // Lesotho Loti
  LRD: '$',      // Liberia Dollar
  MOP: 'MOP$',   // Macau Pataca
  MGA: 'Ar',     // Madagascar Ariary
  MWK: 'MK',     // Malawi Kwacha
  MYR: 'RM',     // Malaysia Ringgit
  MVR: 'ރ',      // Maldives Rufiyaa
  MUR: '₨',      // Mauritius Rupee
  MXN: '$',      // Mexico Peso
  MDL: 'L',      // Moldova Leu
  MNT: '₮',      // Mongolia Tugrik
  MAD: 'د.م',    // Morocco Dirham
  MZN: 'MT',     // Mozambique Metical
  MMK: 'K',      // Myanmar Kyat
  NAD: '$',      // Namibia Dollar
  NPR: 'रू',     // Nepal Rupee
  NZD: '$',      // New Zealand Dollar
  NIO: 'C$',     // Nicaragua Cordoba
  NGN: '₦',      // Nigeria Naira
  MKD: 'ден',    // North Macedonia Denar
  NOK: 'kr',     // Norway Krone
  PKR: '₨',      // Pakistan Rupee
  PAB: 'B/.',    // Panama Balboa
  PGK: 'K',      // Papua New Guinea Kina
  PYG: '₲',      // Paraguay Guarani
  PEN: 'S/',     // Peru Sol
  PHP: '₱',      // Philippines Peso
  PLN: 'zł',     // Poland Zloty
  QAR: '﷼',      // Qatar Riyal
  RON: 'lei',    // Romania Leu
  RUB: '₽',      // Russia Ruble
  RWF: 'RF',     // Rwanda Franc
  WST: 'WS$',    // Samoa Tala
  SAR: '﷼',      // Saudi Arabia Riyal
  RSD: 'дин',    // Serbia Dinar
  SCR: '₨',      // Seychelles Rupee
  SGD: '$',      // Singapore Dollar
  SBD: '$',      // Solomon Islands Dollar
  SOS: 'Sh',     // Somalia Shilling
  ZAR: 'R',      // South Africa Rand
  KRW: '₩',      // South Korea Won
  LKR: '₨',      // Sri Lanka Rupee
  SRD: '$',      // Suriname Dollar
  SEK: 'kr',     // Sweden Krona
  CHF: 'CHF',    // Switzerland Franc
  TWD: 'NT$',    // Taiwan Dollar
  TJS: 'SM',     // Tajikistan Somoni
  TZS: 'TSh',    // Tanzania Shilling
  THB: '฿',      // Thailand Baht
  TOP: 'T$',     // Tonga Paʻanga
  TTD: '$',      // Trinidad & Tobago Dollar
  TRY: '₺',      // Turkey Lira
  TMT: 'm',      // Turkmenistan Manat
  UGX: 'USh',    // Uganda Shilling
  UAH: '₴',      // Ukraine Hryvnia
  AED: 'د.إ',    // United Arab Emirates Dirham
  GBP: '£',      // United Kingdom Pound Sterling
  UYU: '$U',     // Uruguay Peso
  UZS: 'сўм',    // Uzbekistan Som
  VUV: 'Vt',     // Vanuatu Vatu
  VND: '₫',      // Vietnam Dong
  YER: '﷼',      // Yemen Rial
  ZMW: 'ZK',     // Zambia Kwacha
};

/**
 * Default currency symbol used when a currency code is not found in the mapping.
 */
export const DEFAULT_CURRENCY_SYMBOL = '$';
