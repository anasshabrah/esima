// src/utils/translateServer.ts

import enTranslations from '@/translations/translations_en.json';
import arTranslations from '@/translations/translations_ar.json';
import frTranslations from '@/translations/translations_fr.json';
import ptTranslations from '@/translations/translations_pt.json';
import esTranslations from '@/translations/translations_es.json';
import zhTranslations from '@/translations/translations_zh.json';
import deTranslations from '@/translations/translations_de.json';
import trTranslations from '@/translations/translations_tr.json';
import itTranslations from '@/translations/translations_it.json';
import jaTranslations from '@/translations/translations_ja.json';
import koTranslations from '@/translations/translations_ko.json';
import ruTranslations from '@/translations/translations_ru.json';
import nlTranslations from '@/translations/translations_nl.json';
import noTranslations from '@/translations/translations_no.json';
import svTranslations from '@/translations/translations_sv.json';
import ukTranslations from '@/translations/translations_uk.json';
import csTranslations from '@/translations/translations_cs.json';
import elTranslations from '@/translations/translations_el.json';
import fiTranslations from '@/translations/translations_fi.json';
import daTranslations from '@/translations/translations_da.json';

import { Language } from '@/types/types';

// Define the translations object
const translations: Partial<Record<Language, Record<string, string>>> = {
  en: enTranslations,
  ar: arTranslations,
  fr: frTranslations,
  pt: ptTranslations,
  es: esTranslations,
  zh: zhTranslations,
  de: deTranslations,
  tr: trTranslations,
  it: itTranslations,
  ja: jaTranslations,
  ko: koTranslations,
  ru: ruTranslations,
  nl: nlTranslations,
  no: noTranslations,
  sv: svTranslations,
  uk: ukTranslations,
  cs: csTranslations,
  el: elTranslations,
  fi: fiTranslations,
  da: daTranslations,
};

export default translations;

/**
 * Server-side translation function with fallback.
 * @param lang - Language code.
 * @param key - Translation key.
 * @param params - Optional parameters for interpolation.
 * @returns Translated string.
 */
export const translateServer = (
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string => {
  const translationSet = translations[lang] || translations.en;
  let translation = translationSet?.[key] || key;

  if (params) {
    Object.keys(params).forEach((paramKey) => {
      translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
    });
  }

  return translation;
};

/**
 * Server-side function to get translated country name.
 * @param iso - Country ISO code.
 * @param lang - Language code.
 * @returns Translated country name.
 */
export const translateCountryNameServer = (
  iso: string,
  lang: Language
): string => {
  // Import getCountryName dynamically to avoid circular dependencies
  const { getCountryName } = require('@/lib/countryTranslations');
  return getCountryName(iso, lang);
};
