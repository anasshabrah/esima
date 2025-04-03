// src/components/ImpactSection.tsx

'use client';

import React from 'react';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';

const ImpactSection: React.FC = () => {
  const { t, direction } = useTranslations();

  const stats = [
    { value: '+515', labelKey: 'impactSection.stats.reliableNetworksWorldwide' },
    { value: '+420', labelKey: 'impactSection.stats.trustedTravelIndustryPartners' },
    { value: '+8500', labelKey: 'impactSection.stats.satisfiedGlobalTravelers' },
    { value: '+205', labelKey: 'impactSection.stats.countriesCoveredWorldwide' },
  ];

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  return (
    <section
      className={classNames(
        "bg-gray-50 pt-8", // Changed from "py-8 px-2 sm:px-4 lg:px-6" to "pt-8"
        {
          // Additional conditional classes can be added here if needed
        }
      )}
    >
      <div className="w-full text-center"> {/* Replaced 'container mx-auto px-2 sm:px-4 lg:px-6' with 'w-full' */}
        <h2 className="text-2xl sm:text-3xl font-bold text-primary my-6">
          {t('impactSection.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 flex flex-col items-center"
              style={{
                backgroundColor:
                  index % 2 === 0 ? 'var(--accent)' : 'var(--highlight)',
              }}
            >
              <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
              <p className="mt-2 text-lg text-white text-center">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
