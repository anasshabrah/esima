// src/components/GlobalEsimPackage.tsx

'use client';

import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationsContext';

const GlobalEsimPackage = () => {
  const { t } = useTranslations();

  const packages = [
    {
      name: 'Lite',
      price: '$49.99',
      durationKey: 'globalEsimPackage.lite.duration',
      dataKey: 'globalEsimPackage.lite.data',
      features: ['globalCoverage', 'noContracts', 'instantActivation'],
      bgColor: 'bg-accent',
      iconColor: 'text-primary',
      buttonHoverBg: 'hover:bg-primary',
      ariaLabelKey: 'globalEsimPackage.button.ariaLabelLite',
    },
    {
      name: 'Plus',
      price: '$99.99',
      durationKey: 'globalEsimPackage.plus.duration',
      dataKey: 'globalEsimPackage.plus.data',
      features: ['globalCoverage', 'noContracts', 'instantActivation'],
      bgColor: 'bg-primary',
      nameTextColor: 'text-accent',
      buttonHoverBg: 'hover:bg-primary',
      ariaLabelKey: 'globalEsimPackage.button.ariaLabelPlus',
    },
    {
      name: 'Ultimate',
      price: '$149.99',
      durationKey: 'globalEsimPackage.ultimate.duration',
      dataKey: 'globalEsimPackage.ultimate.data',
      features: ['globalCoverage', 'noContracts', 'instantActivation'],
      bgColor: 'bg-accent',
      iconColor: 'text-primary',
      buttonHoverBg: 'hover:bg-primary',
      ariaLabelKey: 'globalEsimPackage.button.ariaLabelUltimate',
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-primary mb-8">
          {t('globalEsimPackage.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`${pkg.bgColor} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300`}
            >
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  pkg.nameTextColor ? pkg.nameTextColor : ''
                }`}
              >
                {pkg.name}
              </h3>
              <p className="text-lg mb-1">{t(pkg.durationKey)}</p>
              <p className="text-4xl font-bold mb-4">{pkg.price}</p>
              <p className="text-lg mb-4">{t(pkg.dataKey)}</p>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <FaCheckCircle
                      className={`mr-2 text-2xl ${
                        pkg.iconColor ? pkg.iconColor : 'text-green-500'
                      }`}
                    />
                    <span>{t(`globalEsimPackage.features.${feature}`)}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 bg-white text-accent font-bold rounded-md transition duration-300 ${
                  pkg.buttonHoverBg || 'hover:bg-accent hover:text-white'
                }`}
                aria-label={t(pkg.ariaLabelKey)}
              >
                {t('globalEsimPackage.selectBundle')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalEsimPackage;
