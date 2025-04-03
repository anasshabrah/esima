// src/app/page.tsx 

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import HomeContent from '@/components/HomeContent';
import { Country, Language } from '@/types/types';
import { generateAlternatesLanguages } from '@/utils/generateAlternatesLanguages';
import { translateServer } from '@/utils/translateServer';
import { defaultLanguage, supportedLanguages } from '@/translations/supportedLanguages';
import TranslationsClientProvider from '@/components/TranslationsClientProvider';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Helper function to parse the Accept-Language header.
 * It extracts primary language codes in order of preference.
 *
 * @param acceptLanguage - The value of the Accept-Language header.
 * @returns An array of language codes sorted by preference.
 */
function parseAcceptLanguage(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map((lang) => {
      const parts = lang.split(';q=');
      return {
        lang: parts[0].split('-')[0].trim().toLowerCase(),
        q: parts[1] ? parseFloat(parts[1]) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q)
    .map((item) => item.lang)
    .filter((lang) => lang.length > 0);
}

export const dynamic = 'force-dynamic';

/**
 * Generates metadata for the default page.
 */
export async function generateMetadata() {
  const language: Language = defaultLanguage.code;
  const metadataBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://alodata.net';

  // Fetch translations asynchronously
  const title = await translateServer(language, 'meta.title');
  const description = await translateServer(language, 'meta.description');
  const openGraphTitle = await translateServer(
    language,
    'meta.openGraph.title'
  );
  const openGraphDescription = await translateServer(
    language,
    'meta.openGraph.description'
  );
  const twitterTitle = await translateServer(language, 'meta.twitter.title');
  const twitterDescription = await translateServer(
    language,
    'meta.twitter.description'
  );
  const openGraphImageAlt = await translateServer(
    language,
    'metadata.openGraph.images.largeLogoAlt'
  );
  const twitterImageAlt = await translateServer(
    language,
    'metadata.twitter.images.largeLogoAlt'
  );

  const currentPath = '/';
  const alternates = generateAlternatesLanguages(
    metadataBaseUrl,
    currentPath,
    language
  );

  return {
    metadataBase: new URL(metadataBaseUrl),
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      type: 'website',
      title: openGraphTitle,
      description: openGraphDescription,
      url: `${metadataBaseUrl}`,
      images: [
        {
          url: `${metadataBaseUrl}/images/large-banner.png`,
          width: 1200,
          height: 630,
          alt: openGraphImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: [
        {
          url: `${metadataBaseUrl}/images/large-banner.png`,
          alt: twitterImageAlt,
        },
      ],
    },
    alternates: {
      canonical: `${metadataBaseUrl}`,
      languages: alternates, // Now includes self-referencing hreflang
    },
    other: {
      'og:logo': `${metadataBaseUrl}/images/large-logo.png`,
    },
  };
}

/**
 * The default HomePage component with language detection and redirection.
 */
export default async function HomePage() {
  // Access the request headers asynchronously
  const reqHeaders = await headers();
  const acceptLanguage = reqHeaders.get('accept-language');

  if (acceptLanguage) {
    const languages = parseAcceptLanguage(acceptLanguage);

    if (languages.length > 0) {
      const primaryLanguage = languages[0];

      // Only redirect if the primary language is supported and not the default ('en')
      if (
        primaryLanguage !== defaultLanguage.code &&
        supportedLanguages.some((supported) => supported.code === primaryLanguage)
      ) {
        // Perform a server-side redirect to the matched language page
        redirect(`/${primaryLanguage}`);
      }
    }
  }

  // If no matching language is found or the primary language is English, continue rendering the default page

  // Fetch countries data from the database
  const rawCountries = await prisma.country.findMany({
    select: {
      id: true,
      name: true,
      iso: true,
      networkBrands: true,
      region: true,
    },
  });

  const countries: Country[] = rawCountries.map((country) => ({
    ...country,
    bundles: [],
  }));

  return (
    <TranslationsClientProvider initialLanguage={defaultLanguage.code}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
          <HomeContent countries={countries} />
        </main>
        <Footer />
      </div>
    </TranslationsClientProvider>
  );
}
