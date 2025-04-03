// src/components/PromoSection.tsx

'use client';

import React from 'react';
import {
  FaDollarSign,
  FaTachometerAlt,
  FaMobileAlt,
  FaBolt,
  FaGlobe,
  FaLayerGroup,
  FaChartLine,
  FaHeadset,
  FaLaptop,
} from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationsContext';

interface Benefit {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface PromoSectionProps {
  onGetStartedClick: () => void;
}

const PromoSection: React.FC<PromoSectionProps> = ({ onGetStartedClick }) => {
  const { t, direction } = useTranslations();

  const benefits: Benefit[] = [
    {
      icon: <FaDollarSign className="text-yellow-600" size={48} />,
      title: t('promoSection.benefits.affordableRates'),
      description: t('promoSection.benefits.affordableRatesDesc'),
    },
    {
      icon: <FaTachometerAlt className="text-pink-600" size={48} />,
      title: t('promoSection.benefits.lightningSpeeds'),
      description: t('promoSection.benefits.lightningSpeedsDesc'),
    },
    {
      icon: <FaMobileAlt className="text-stone-600" size={48} />,
      title: t('promoSection.benefits.noAppNeeded'),
      description: t('promoSection.benefits.noAppNeededDesc'),
    },
    {
      icon: <FaBolt className="text-blue-600" size={48} />,
      title: t('promoSection.benefits.instantEsimActivation'),
      description: t('promoSection.benefits.instantEsimActivationDesc'),
    },
    {
      icon: <FaGlobe className="text-green-600" size={48} />,
      title: t('promoSection.benefits.globalConnectivity'),
      description: t('promoSection.benefits.globalConnectivityDesc'),
    },
    {
      icon: <FaLayerGroup className="text-purple-600" size={48} />,
      title: t('promoSection.benefits.flexibleBundles'),
      description: t('promoSection.benefits.flexibleBundlesDesc'),
    },
    {
      icon: <FaChartLine className="text-red-600" size={48} />,
      title: t('promoSection.benefits.realTimeControl'),
      description: t('promoSection.benefits.realTimeControlDesc'),
    },
    {
      icon: <FaHeadset className="text-orange-600" size={48} />,
      title: t('promoSection.benefits.customerSupport'),
      description: t('promoSection.benefits.customerSupportDesc'),
    },
    {
      icon: <FaLaptop className="text-indigo-600" size={48} />,
      title: t('promoSection.benefits.idealForDigitalNomads'),
      description: t('promoSection.benefits.idealForDigitalNomadsDesc'),
    },
  ];

  // Determine if the current layout is RTL
  const isRTL = direction === 'rtl';

  return (
    <section className="bg-gray-50 pt-12">
      <div className="w-full px-0 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          {t('promoSection.sectionTitle')}
        </h2>
        <p className="text-lg text-gray-700 text-center mb-8">
          {t('promoSection.introText')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-3">{benefit.icon}</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mt-1">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;