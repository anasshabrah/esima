// src/app/components/CountryPageClient.tsx

'use client';

import React, { useState, useMemo } from 'react';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { BundleWithCountries, CountryWithBundles } from '@/types/types';
import { useCurrency } from '@/context/CurrencyContext';
import { convertPrice } from '@/utils/currencyUtils';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import { formatBundleName } from '@/utils/bundleUtils';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import { getCountryName } from '@/lib/countryTranslations';
import CountryContent from '@/components/CountryContent';

interface CountryPageClientProps {
  country: CountryWithBundles;
  bundles: BundleWithCountries[];
  allCountries: { iso: string; name: string }[];
}

const CountryPageClient: React.FC<CountryPageClientProps> = ({
  country,
  bundles,
  allCountries,
}) => {
  const { currency, exchangeRate } = useCurrency();
  const { t, language, direction } = useTranslations();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleWithCountries | null>(null);

  const handleBuyThisBundle = (bundle: BundleWithCountries) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const isoToNameMap: Record<string, string> = useMemo(
    () =>
      allCountries.reduce((acc, curr) => {
        acc[curr.iso] = curr.name;
        return acc;
      }, {} as Record<string, string>),
    [allCountries]
  );

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  // Extract network brands from the country data
  const networks = country.networkBrands;

  // Get the translated country name
  const translatedCountryName = getCountryName(country.iso, language) || country.name;

  return (
    <>
      {/* Bundles Section */}
      <section className="mt-16 px-4 md:px-8">
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {bundles.map((bundle) => {
              // Use the utility function to format the bundle name
              const bundleName = formatBundleName(bundle, language);

              const roamingCountryNames = bundle.roamingEnabled
                .map((iso) => isoToNameMap[iso])
                .filter(Boolean);

              // Calculate and format the price
              const convertedPrice = convertPrice(bundle.price ?? 0, exchangeRate);
              const currencySymbol = getCurrencySymbol(currency); // Get the currency symbol
              const formattedPrice = `${currencySymbol}${Math.ceil(convertedPrice)}`;

              // Translate the country name, including special names
              const translatedCountryNameWithTranslation = t(
                `country.${country.iso}`,
                {},
                translatedCountryName
              );

              return (
                <div
                  key={bundle.id}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="relative h-48 sm:h-56 lg:h-64 bg-gray-200">
                    <Image
                      src={bundle.imageUrl}
                      alt={bundleName}
                      layout="fill"
                      objectFit="cover"
                      priority
                      className="transform hover:scale-105 transition-transform duration-300 rounded-t-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/default-background.jpg';
                      }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Overlay with Country Name and Flag */}
                    <div className="absolute inset-0 flex items-start justify-between p-4">
                      <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-md flex items-center space-x-2 rtl:space-x-reverse">
                        <Image
                          src={`/flags/${country.iso.toUpperCase()}.svg`}
                          alt={`${translatedCountryNameWithTranslation} ${t('countryPageClient.flagAlt')}`}
                          width={20} // Adjust width as needed
                          height={20} // Adjust height as needed
                          className="w-5 h-5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/flags/default.svg';
                            target.alt = t('countryPageClient.defaultFlagAlt');
                          }}
                        />
                        <span className="text-sm font-semibold">{translatedCountryNameWithTranslation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">{bundleName}</h3>
                    <p className="text-lg md:text-xl text-green-600 font-bold mb-4">{formattedPrice}</p>

                    {/* Network Brands Section */}
                    {networks.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-md md:text-lg font-semibold mb-2">
                          {t('countryPageClient.networkBrands')}
                        </h4>
                        <ul className="flex flex-wrap gap-2">
                          {networks.map((brand, index) => (
                            <li
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs md:text-sm"
                              aria-label={t('countryPageClient.networkBrandAriaLabel', { brand })}
                            >
                              {brand}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Roaming Coverage Section */}
                    {roamingCountryNames.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-md md:text-lg font-semibold mb-2">
                          {t('countryPageClient.roamingCoverage')}
                        </h4>
                        <ul className="flex flex-wrap gap-2">
                          {roamingCountryNames.map((name, index) => (
                            <li
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs md:text-sm"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4">
                      <button
                        onClick={() => handleBuyThisBundle(bundle)}
                        className="w-full px-4 py-2 bg-primary text-white text-lg md:text-xl font-semibold rounded-full hover:bg-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={t('countryPageClient.buyButtonAriaLabel', { bundleName })}
                      >
                        {t('countryPageClient.buyNow')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg md:text-xl">{t('countryPageClient.noBundles')}</p>
        )}
      </section>

      {/* New CountryContent Component Below Bundles */}
      <CountryContent
        countryName={translatedCountryName}
        networks={networks}
        countryIso={country.iso}
      />

      {/* Modal for Buying Bundles */}
      {isModalOpen && selectedBundle && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          country={country}
          initialBundle={selectedBundle}
        />
      )}
    </>
  );
};

export default CountryPageClient;
