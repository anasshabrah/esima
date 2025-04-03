// src/app/[lang]/page.tsx

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import HomeContent from '@/components/HomeContent';
import { Country, Language } from '@/types/types';
import { translateServer } from '@/utils/translateServer';
import { generateAlternatesLanguages } from '@/utils/generateAlternatesLanguages';
import { supportedLanguages, SupportedLanguage } from '@/translations/supportedLanguages';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: { lang: string };
}

export async function generateMetadata(props: HomePageProps) {
  const { params } = props;
  
  // Await params if required by Next.js
  const resolvedParams = await Promise.resolve(params);
  const { lang } = resolvedParams;
  
  const language: Language = lang as Language;

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
      url: `${metadataBaseUrl}/${lang}`,
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
      canonical: `${metadataBaseUrl}/${lang}`,
      languages: alternates, // Now includes self-referencing hreflang
    },
    other: {
      'og:logo': `${metadataBaseUrl}/images/large-logo.png`,
    },
  };
}

export default async function HomePage(props: HomePageProps) {
  const { params } = props;

  // Await params if required by Next.js
  const resolvedParams = await Promise.resolve(params);
  const { lang } = resolvedParams;

  const isValidLang = supportedLanguages.some((l: SupportedLanguage) => l.code === lang);

  if (!isValidLang) {
    notFound();
  }

  const language: Language = lang as Language;

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

  // Transform raw country data into your Country type
  const countries: Country[] = rawCountries.map((country) => ({
    ...country,
    bundles: [], // Initialize bundles or populate as needed
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        <HomeContent countries={countries} />
      </main>
      <Footer />
    </div>
  );
}
