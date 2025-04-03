// src/lib/countryTranslations.ts

import countries from 'i18n-iso-countries';
import { Language } from '@/types/types';

// Import locale data for all supported languages
import enLocale from 'i18n-iso-countries/langs/en.json';
import arLocale from 'i18n-iso-countries/langs/ar.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import deLocale from 'i18n-iso-countries/langs/de.json';
import ptLocale from 'i18n-iso-countries/langs/pt.json';
import esLocale from 'i18n-iso-countries/langs/es.json';
import zhLocale from 'i18n-iso-countries/langs/zh.json';
import trLocale from 'i18n-iso-countries/langs/tr.json';
import itLocale from 'i18n-iso-countries/langs/it.json';
import jaLocale from 'i18n-iso-countries/langs/ja.json';
import koLocale from 'i18n-iso-countries/langs/ko.json';
import ruLocale from 'i18n-iso-countries/langs/ru.json';
import nlLocale from 'i18n-iso-countries/langs/nl.json';
import noLocale from 'i18n-iso-countries/langs/no.json';
import svLocale from 'i18n-iso-countries/langs/sv.json';
import ukLocale from 'i18n-iso-countries/langs/uk.json';
import csLocale from 'i18n-iso-countries/langs/cs.json';
import elLocale from 'i18n-iso-countries/langs/el.json';
import fiLocale from 'i18n-iso-countries/langs/fi.json';
import daLocale from 'i18n-iso-countries/langs/da.json';

// Register each locale with the library
countries.registerLocale(enLocale);
countries.registerLocale(arLocale);
countries.registerLocale(frLocale);
countries.registerLocale(deLocale);
countries.registerLocale(ptLocale);
countries.registerLocale(esLocale);
countries.registerLocale(zhLocale);
countries.registerLocale(trLocale);
countries.registerLocale(itLocale);
countries.registerLocale(jaLocale);
countries.registerLocale(koLocale);
countries.registerLocale(ruLocale);
countries.registerLocale(nlLocale);
countries.registerLocale(noLocale);
countries.registerLocale(svLocale);
countries.registerLocale(ukLocale);
countries.registerLocale(csLocale);
countries.registerLocale(elLocale);
countries.registerLocale(fiLocale);
countries.registerLocale(daLocale);

/**
 * Retrieves the translated country name based on ISO code and language.
 * Falls back to the English name if translation is unavailable.
 *
 * @param iso - The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB').
 * @param lang - The language code (e.g., 'en', 'ar').
 * @returns The translated country name or the English name if translation is missing.
 */
export const getCountryName = (iso: string, lang: Language): string => {
  const upperIso = iso.toUpperCase();
  const name = countries.getName(upperIso, lang) || countries.getName(upperIso, 'en') || iso;

  return name;
};
