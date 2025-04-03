// src/app/country/[countryIso]/page.tsx

import React from 'react';
import BackgroundImage from '@/components/BackgroundImage';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SellingPoints from '@/components/SellingPoints';
import FAQSection from '@/components/FAQSection';
import { getGeolocationData } from '@/lib/geolocation';
import {
  BundleWithCountries,
  CountryWithBundles,
  BreadcrumbItem,
  Language,
} from '@/types/types';
import CountryPageClient from '@/components/CountryPageClient';
import { translateServer } from '@/utils/translateServer';
import TranslationsClientProvider from '@/components/TranslationsClientProvider';
import { getCountryName } from '@/lib/countryTranslations';
import classNames from 'classnames';
import {
  supportedLanguages,
  defaultLanguage,
} from '@/translations/supportedLanguages';
import { generateAlternatesLanguages } from '@/utils/generateAlternatesLanguages';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import FlagImage from '@/components/FlagImage';
import Script from 'next/script';
import { headers } from 'next/headers';

async function getTranslatedCountryName(
  isoCode: string,
  language: Language,
  defaultName: string
): Promise<string> {
  const translationKey = `country.${isoCode}`;
  const translatedName = await translateServer(language, translationKey);

  if (translatedName === translationKey) {
    const countryName = getCountryName(isoCode, language);
    return countryName || defaultName;
  }

  return translatedName;
}

interface CountryPageProps {
  params: Promise<{ countryIso: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryIso: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { countryIso } = resolvedParams;
    const upperCountryIso = countryIso.toUpperCase();

    const lang = defaultLanguage.code as Language;

    const metadataBaseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://alodata.net';
    const currentPath = `country/${upperCountryIso}`;

    const alternatesRecord = generateAlternatesLanguages(
      metadataBaseUrl,
      currentPath,
      lang
    );

    const country = await prisma.country.findUnique({
      where: { iso: upperCountryIso },
      select: {
        name: true,
        iso: true,
        bundles: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    const backgroundImageUrl =
      country?.bundles?.[0]?.imageUrl || `${metadataBaseUrl}/default-background.jpg`;

    if (!country) {
      return {
        metadataBase: new URL(metadataBaseUrl),
        title: await translateServer(
          lang,
          'countryPage.metadata.titleNotFound'
        ),
        description: await translateServer(
          lang,
          'countryPage.metadata.descriptionNotFound'
        ),
        openGraph: {
          title: await translateServer(
            lang,
            'countryPage.metadata.titleNotFound'
          ),
          description: await translateServer(
            lang,
            'countryPage.metadata.descriptionNotFound'
          ),
          url: `${metadataBaseUrl}/country/${upperCountryIso}`,
          images: [
            {
              url: `${metadataBaseUrl}/flags/default.svg`,
              alt: 'Default flag',
            },
          ],
        },
        alternates: {
          canonical: `${metadataBaseUrl}/country/${upperCountryIso}`,
          languages:
            Object.keys(alternatesRecord).length > 0
              ? alternatesRecord
              : undefined,
        },
      };
    }

    const translatedCountryName = await getTranslatedCountryName(
      country.iso,
      lang,
      country.name
    );

    const title = await translateServer(
      lang,
      'countryPage.metadata.title',
      { countryName: translatedCountryName }
    );
    const description = await translateServer(
      lang,
      'countryPage.metadata.description',
      { countryName: translatedCountryName }
    );

    return {
      metadataBase: new URL(metadataBaseUrl),
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${metadataBaseUrl}/country/${upperCountryIso}`,
        images: [
          {
            url: `${metadataBaseUrl}/flags/${upperCountryIso}.svg`,
            alt: `${translatedCountryName} flag`,
          },
        ],
      },
      alternates: {
        canonical: `${metadataBaseUrl}/country/${upperCountryIso}`,
        languages:
          Object.keys(alternatesRecord).length > 0
            ? alternatesRecord
            : undefined,
      },
    };
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    return {
      metadataBase: new URL('https://alodata.net'),
      title: 'Error - alodata eSIM',
      description: 'An error occurred while generating metadata.',
      openGraph: {
        title: 'Error - alodata eSIM',
        description: 'An error occurred while generating metadata.',
        url: 'https://alodata.net',
        images: [
          {
            url: `https://alodata.net/flags/default.svg`,
            alt: 'Default flag',
          },
        ],
      },
      alternates: {
        canonical: 'https://alodata.net',
        languages: undefined,
      },
    };
  }
}

const CountryPage = async (props: CountryPageProps) => {
  try {
    const resolvedParams = await props.params;
    const { countryIso } = resolvedParams;
    const upperCountryIso = countryIso.toUpperCase();

    const lang: Language = defaultLanguage.code as Language;

    const reqHeaders = await headers();
    const cfIpCountryHeader = reqHeaders.get('cf-ipcountry') || 'US';
    const cfConnectingIp = reqHeaders.get('cf-connecting-ip') || '127.0.0.1';

    const geoData = await getGeolocationData({
      'cf-ipcountry': cfIpCountryHeader,
      'cf-connecting-ip': cfConnectingIp,
    });

    const currency = geoData ? geoData.currencyCode : 'USD';
    const exchangeRate = geoData ? geoData.exchangeRate : 1;
    const countryCode = geoData ? geoData.countryCode : 'US';
    const currencySymbol =
      geoData?.currencySymbol || getCurrencySymbol(currency);

    const countryData = await prisma.country.findUnique({
      where: { iso: upperCountryIso },
      include: {
        bundles: {
          include: {
            countries: {
              select: {
                id: true,
                iso: true,
                name: true,
                region: true,
                networkBrands: true,
              },
            },
          },
        },
      },
    });

    if (!countryData) {
      notFound();
      return null;
    }

    const translatedCountryName = await getTranslatedCountryName(
      countryData.iso,
      lang,
      countryData.name
    );

    const processedCountry: CountryWithBundles = {
      ...countryData,
      bundles: countryData.bundles.map((bundle) => ({
        ...bundle,
        countries: bundle.countries.map((countryItem) => ({
          ...countryItem,
          bundles: [],
        })),
      })),
    };

    const sortedBundles = processedCountry.bundles.sort((a, b) => {
      const priceA = a.price ?? Infinity;
      const priceB = b.price ?? Infinity;
      return priceA - priceB;
    });

    const backgroundImageUrl =
      sortedBundles[0]?.imageUrl || '/default-background.jpg';

    const processedBundles: BundleWithCountries[] = sortedBundles.map(
      (bundle) => ({
        ...bundle,
      })
    );

    const roamingEnabledIsos = new Set<string>();
    sortedBundles.forEach((bundle) => {
      bundle.roamingEnabled.forEach((iso) => roamingEnabledIsos.add(iso));
    });

    const allCountries = await prisma.country.findMany({
      where: {
        iso: { in: Array.from(roamingEnabledIsos) },
      },
      select: {
        iso: true,
        name: true,
      },
    });

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        name: await translateServer(lang, 'breadcrumbs.home'),
        href: '/',
      },
      { name: translatedCountryName, href: `/country/${countryIso}` },
    ];

    const metadataBaseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://alodata.net';

    const productStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `eSIM Data Plan in ${translatedCountryName}`,
      description: `Choose from a variety of eSIM data plans tailored for your stay in ${translatedCountryName}.`,
      image: `${metadataBaseUrl}/esimgo-cms-images-prod.s3.eu-west-1.amazonaws.com/${upperCountryIso}.jpg`,
      brand: {
        '@type': 'Organization',
        name: 'alodata eSIM',
        url: 'https://alodata.net',
        logo: 'https://alodata.net/images/large-logo.png',
      },
      offers: processedBundles.map((bundle) => ({
        '@type': 'Offer',
        price: bundle.price?.toString() || '0.00',
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        url: `${metadataBaseUrl}/country/${upperCountryIso}`,
        eligibleRegion: {
          '@type': 'Country',
          name: translatedCountryName,
        },
        sku: bundle.id.toString(),
        name: bundle.name,
        description: bundle.description,
      })),
    };

    return (
      <TranslationsClientProvider
        initialLanguage={lang}
        initialCurrency={currency}
        initialExchangeRate={exchangeRate}
        initialCountryIso={countryCode}
        initialCurrencySymbol={currencySymbol}
      >
        <div
          className={classNames('flex flex-col min-h-screen bg-gray-100', {
            'dir-rtl': lang === 'ar',
            'dir-ltr': lang !== 'ar',
          })}
        >
          <Header />
          <Breadcrumbs items={breadcrumbItems} />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="relative rounded-2xl overflow-hidden py-20 h-96 md:h-128">
              <BackgroundImage
                src={backgroundImageUrl}
                alt={`${translatedCountryName} Background`}
                fill
                style={{ objectFit: 'cover' }}
                priority
                className="rounded-2xl"
                fallbackSrc="/default-background.jpg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 text-white">
                <FlagImage
                  src={`/flags/${countryData.iso}.svg`}
                  alt={`${translatedCountryName} ${await translateServer(
                    lang,
                    'countryPage.flagAlt'
                  )}`}
                  className="w-24 h-24 mb-6 rounded-full"
                />
                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">
                  {await translateServer(
                    lang,
                    'countryPage.heroTitle',
                    {
                      countryName: translatedCountryName,
                    }
                  )}
                </h1>
                <SellingPoints />
              </div>
            </div>

            <CountryPageClient
              country={processedCountry}
              bundles={processedBundles}
              allCountries={allCountries}
            />
            <FAQSection />

            <Script
              type="application/ld+json"
              id="product-schema"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(productStructuredData),
              }}
            />
          </main>
          <Footer />
        </div>
      </TranslationsClientProvider>
    );
  } catch (error) {
    console.error('Error in CountryPage:', error);

    const lang: Language = defaultLanguage.code as Language;

    const metadataBaseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://alodata.net';

    const breadcrumbItems: BreadcrumbItem[] = [
      {
        name: await translateServer(lang, 'breadcrumbs.home'),
        href: '/',
      },
      {
        name: await translateServer(lang, 'breadcrumbs.error'),
        href: `/country`,
      },
    ];

    const errorStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Country Not Found - alodata eSIM',
      description: 'The requested country was not found on alodata eSIM.',
    };

    return (
      <TranslationsClientProvider initialLanguage={lang}>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header />
          <Breadcrumbs items={breadcrumbItems} />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 md:mb-6">
              {await translateServer(lang, 'countryPage.error.title')}
            </h1>
            <p className="text-center text-gray-500 text-lg md:text-xl">
              {await translateServer(lang, 'countryPage.error.message')}
            </p>
          </main>
          <Footer />

          <Script
            type="application/ld+json"
            id="error-schema"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(errorStructuredData),
            }}
          />
        </div>
      </TranslationsClientProvider>
    );
  }
};

export default CountryPage;
