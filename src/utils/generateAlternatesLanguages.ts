// src/utils/generateAlternatesLanguages.ts

import { supportedLanguages, SupportedLanguage, Language } from '@/translations/supportedLanguages';

/**
 * Generates a record of hreflang to href for alternates, including self-referencing hreflang and x-default.
 *
 * @param baseUrl - The base URL of your website (e.g., 'https://alodata.net').
 * @param currentPath - The current path of the page (e.g., 'country/US' or '').
 * @param currentLang - The current language code (e.g., 'en', 'fr').
 * @returns A Record<string, string> where keys are hreflang codes and values are URLs, including x-default.
 */
export const generateAlternatesLanguages = (
  baseUrl: string,
  currentPath: string,
  currentLang: Language
): Record<string, string> => {
  // Normalize baseUrl by removing trailing slashes
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  // Normalize currentPath by removing leading and trailing slashes
  const normalizedPath = currentPath.replace(/^\/+|\/+$/g, '');

  const alternates: Record<string, string> = {};

  // English as default (served at root without /en/)
  alternates['en'] = normalizedPath
    ? `${normalizedBaseUrl}/${normalizedPath}`
    : `${normalizedBaseUrl}`;

  // Other supported languages with language code in URL
  supportedLanguages.forEach((language: SupportedLanguage) => {
    alternates[language.code] = normalizedPath
      ? `${normalizedBaseUrl}/${language.code}/${normalizedPath}`
      : `${normalizedBaseUrl}/${language.code}`;
  });

  // x-default pointing to the English version at root
  alternates['x-default'] = normalizedPath
    ? `${normalizedBaseUrl}/${normalizedPath}`
    : `${normalizedBaseUrl}`;

  return alternates;
};
