// src/translations/supportedLanguages.ts

const supportedLanguages = [
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'de', name: 'Deutsch' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ru', name: 'Русский' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'no', name: 'Norsk' },
  { code: 'sv', name: 'Svenska' },
  { code: 'uk', name: 'Українська' },
  { code: 'cs', name: 'Čeština' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'fi', name: 'Suomi' },
  { code: 'da', name: 'Dansk' },
] as const;

// Define the SupportedLanguage type based on supportedLanguages
export type SupportedLanguage = typeof supportedLanguages[number];
export type SupportedLanguageCode = SupportedLanguage['code'];

// 'Language' includes 'en' and all supported languages
export type Language = SupportedLanguageCode | 'en';

// Interface for language options
export interface LanguageOption {
  code: Language;
  name: string;
}

// Default language is English
export const defaultLanguage: LanguageOption = { code: 'en', name: 'English' };

// Export supportedLanguages as a named export
export { supportedLanguages };
