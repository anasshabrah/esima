// src/components/CountriesSection.tsx

'use client';

import React, { useState, useMemo } from 'react';
import LocalizedLink from '@/components/LocalizedLink';
import { Country } from '@/types/types';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import { getCountryName } from '@/lib/countryTranslations';
import FlagImage from '@/components/FlagImage';

interface CountriesSectionProps {
  countries: Country[];
}

interface RegionGroups {
  [region: string]: Country[];
}

const CountriesSection: React.FC<CountriesSectionProps> = ({ countries }) => {
  const { t, language, direction } = useTranslations();

  // Define the desired order of regions
  const regionOrder: string[] = [
    'Europe',
    'Asia',
    'North America',
    'Caribbean',
    'South America',
    'Oceania',
    'Middle East',
    'Africa',
    'Global',
  ];

  // Group countries by region and sort them
  const groupedCountries: RegionGroups = useMemo(() => {
    const groups: RegionGroups = countries.reduce((acc, country) => {
      const region = country.region || t('countriesSection.otherRegion');
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(country);
      return acc;
    }, {} as RegionGroups);

    // Sort countries within each region
    Object.keys(groups).forEach((region) => {
      groups[region].sort((a, b) => {
        const nameA =
          t(`country.${a.iso}`, {}, getCountryName(a.iso, language) || a.name);
        const nameB =
          t(`country.${b.iso}`, {}, getCountryName(b.iso, language) || b.name);
        return nameA.localeCompare(nameB, language, { sensitivity: 'base' });
      });
    });

    return groups;
  }, [countries, t, language]);

  // Sort regions based on the defined order
  const regions = useMemo(() => {
    return Object.keys(groupedCountries).sort((a, b) => {
      const indexA = regionOrder.indexOf(a);
      const indexB = regionOrder.indexOf(b);

      if (indexA === -1 && indexB === -1) {
        // Both regions are not in the regionOrder array, sort alphabetically
        return a.localeCompare(b);
      }
      if (indexA === -1) {
        // a is not in the regionOrder array, place it after b
        return 1;
      }
      if (indexB === -1) {
        // b is not in the regionOrder array, place it after a
        return -1;
      }
      // Both regions are in the regionOrder array, sort by their order
      return indexA - indexB;
    });
  }, [groupedCountries]);

  // Initialize active region to the first region in the sorted list
  const [activeRegion, setActiveRegion] = useState<string>(regions[0] || '');

  // Determine if the current layout is RTL
  const isRTL = direction === 'rtl';

  return (
    <section className="mt-8">
      {/* Section Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-primary my-6 text-center">
        {t('countriesSection.title')}
      </h2>

      {/* Region Tabs */}
      <div
        className="flex flex-wrap justify-center mb-4"
        role="tablist"
        aria-label={t('countriesSection.regionsAriaLabel')}
      >
        {regions.map((region, index) => {
          // Normalize the region key
          const formattedRegionKey = region
            .toLowerCase()
            .replace(/[\s-]+/g, '_');

          return (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              role="tab"
              aria-selected={activeRegion === region}
              aria-controls={`panel-${index}`}
              id={`tab-${index}`}
              className={classNames(
                'm-1 px-3 py-1 rounded-full border transition-colors duration-300 focus:outline-none',
                {
                  'bg-primary text-white border-primary': activeRegion === region,
                  'bg-white text-primary border-primary hover:bg-primary hover:text-white':
                    activeRegion !== region,
                }
              )}
            >
              {/* Translate region name with fallback */}
              {t(
                `regions.${formattedRegionKey}`,
                {},
                region // Pass defaultValue as third parameter
              )}
            </button>
          );
        })}
      </div>

      {/* Countries Grid */}
      {regions.map((region, index) => (
        <div
          key={region}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeRegion !== region}
        >
          {activeRegion === region && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {groupedCountries[region].map((country) => {
                const isoCode = country.iso.toUpperCase();
                const translatedCountryName = t(
                  `country.${country.iso}`,
                  {},
                  getCountryName(country.iso, language) || country.name
                );

                return (
                  <LocalizedLink
                    key={country.iso}
                    href={`/country/${country.iso}`}
                    className={classNames(
                      'group block p-2 sm:p-4 bg-white text-black rounded-md shadow-md hover:shadow-inner hover:bg-gray-100 transition flex items-center justify-between'
                    )}
                  >
                    {/* Country Information */}
                    <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
                      {/* Option 1: Using <img> Tag */}
                      <img
                        src={`/flags/${isoCode}.svg`}
                        alt={
                          translatedCountryName
                            ? `${translatedCountryName} ${t(
                                'countriesSection.flagAlt'
                              )}`
                            : t('countriesSection.defaultFlagAlt')
                        }
                        width={32} // Natural size: 32x32
                        height={32}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/flags/default.svg';
                          target.alt = t('countriesSection.defaultFlagAlt');
                        }}
                      />

                      {/* Option 2: Using Inline SVGs */}
                      {/* <FlagImage isoCode={country.iso} alt={`${translatedCountryName} Flag`} /> */}

                      <h3 className="text-lg sm:text-xl font-bold">
                        {translatedCountryName}
                      </h3>
                    </div>

                    {/* Arrow Icon Based on Text Direction */}
                    <div className="flex items-center">
                      {isRTL ? (
                        <IoIosArrowBack
                          className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary transition-colors duration-300"
                          aria-hidden="true"
                        />
                      ) : (
                        <IoIosArrowForward
                          className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary transition-colors duration-300"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </LocalizedLink>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default CountriesSection;
