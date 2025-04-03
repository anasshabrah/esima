// src/context/TranslationsContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import logger from '@/utils/logger.client';
import { defaultLanguage, Language } from '@/translations/supportedLanguages';

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

interface TranslationsContextType {
  t: (
    key: string,
    params?: Record<string, string | number>,
    defaultValue?: string
  ) => string;
  setLanguage: (lang: Language) => void;
  language: Language;
  direction: 'ltr' | 'rtl';
}

const TranslationsContext = createContext<TranslationsContextType | null>(null);

interface TranslationsProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export const TranslationsProvider: React.FC<TranslationsProviderProps> = ({
  children,
  initialLanguage,
}) => {
  // Function to get the initial language, prioritizing initialLanguage over cookies
  const getInitialLanguage = (): Language => {
    if (initialLanguage) {
      return initialLanguage;
    }
    try {
      const cookieLanguage = Cookies.get('language') as Language | undefined;
      return cookieLanguage || defaultLanguage.code;
    } catch (error) {
      logger.error('Error reading language from cookies', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return defaultLanguage.code;
    }
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
      try {
        Cookies.set('language', initialLanguage, { expires: 365 }); // Expires in 1 year
      } catch (error) {
        logger.error('Error setting language cookie', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }, [initialLanguage, language]);

  // Update language and set cookie with error handling
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      Cookies.set('language', lang, { expires: 365 }); // Expires in 1 year
    } catch (error) {
      logger.error('Error setting language cookie', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Define RTL languages
  const rtlLanguages: Language[] = ['ar'];
  const direction: 'ltr' | 'rtl' = rtlLanguages.includes(language)
    ? 'rtl'
    : 'ltr';

  const t = (
    key: string,
    params?: Record<string, string | number>,
    defaultValue?: string
  ): string => {
    const translationSet = translations[language] || translations.en;
    let translation = translationSet?.[key];

    if (!translation) {
      translation = defaultValue || key;
    }

    // Substitute params into translation string
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g');
        translation = translation!.replace(regex, String(params[paramKey]));
      });
    }

    return translation;
  };

  return (
    <TranslationsContext.Provider
      value={{ t, setLanguage, language, direction }}
    >
      {children}
    </TranslationsContext.Provider>
  );
};

export const useTranslations = (): TranslationsContextType => {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error(
      'useTranslations must be used within a TranslationsProvider'
    );
  }
  return context;
};
