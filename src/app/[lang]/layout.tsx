// src/app/[lang]/layout.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { supportedLanguages, Language, SupportedLanguage } from '@/translations/supportedLanguages';
import ClientWrapper from '@/components/ClientWrapper';
import classNames from 'classnames';
import { Metadata } from 'next';
import { TranslationsProvider } from '@/context/TranslationsContext';
import { LanguageProvider } from '@/context/LanguageContext';

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

interface GenerateMetadataProps {
  params: Promise<{ lang: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  const isValidLang = supportedLanguages.some(
    (langObj: SupportedLanguage) => langObj.code === lang
  );

  if (!isValidLang) {
    notFound();
  }

  return {
    title: `Welcome to ${lang.toUpperCase()} Version`,
    description: `This is the ${lang.toUpperCase()} version of the site.`,
    openGraph: {
      title: `Welcome to ${lang.toUpperCase()} Version`,
      description: `This is the ${lang.toUpperCase()} version of the site.`,
      url: `https://alodata.net/${lang}`,
      images: [
        {
          url: `https://alodata.net/images/og-${lang}.png`,
          alt: `Open Graph Image for ${lang.toUpperCase()}`,
        },
      ],
    },
    alternates: {
      canonical: `https://alodata.net/${lang}`,
      languages: supportedLanguages.reduce<Record<string, string>>((acc, language) => {
        acc[language.code] = `https://alodata.net/${language.code}`;
        return acc;
      }, {}),
    },
  };
}

const rtlLanguages: Language[] = ['ar'];

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  const isValidLang = supportedLanguages.some(
    (langObj: SupportedLanguage) => langObj.code === lang
  );

  if (!isValidLang) {
    notFound();
  }

  const language: Language = lang as Language;
  const isRTL = rtlLanguages.includes(language);

  return (
    <LanguageProvider lang={language}>
      <TranslationsProvider initialLanguage={language}>
        <ClientWrapper initialLanguage={language}>
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className={classNames('min-h-screen', {
              'bg-gray-50': !isRTL,
              'bg-gray-100': isRTL,
            })}
          >
            {children}
          </div>
        </ClientWrapper>
      </TranslationsProvider>
    </LanguageProvider>
  );
}
