// src/app/components/CountryContent.tsx

'use client';

import React from 'react';
import { useTranslations } from '@/context/TranslationsContext';
import DynamicFAQ from '@/components/DynamicFAQ';
import classNames from 'classnames';
import Image from 'next/image';

// Import React Icons
import {
  FaBolt,
  FaArrowsAlt,
  FaPlaneDeparture,
  FaLaptop,
  FaHome,
  FaStar,
} from 'react-icons/fa';
import { MdSpeed, MdSimCard } from 'react-icons/md';

// Reusable Components

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-visible">
    <div className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mb-4">
      {icon}
    </div>
    <h4 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800 leading-snug">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface DataPlanProps {
  title: string;
  description: string;
}

const DataPlanCard: React.FC<DataPlanProps> = ({ title, description }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 overflow-visible">
    <h4 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 leading-snug">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const StepItem: React.FC<StepProps> = ({ number, title, description }) => (
  <li className="flex flex-col items-center text-center overflow-visible">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg font-bold mb-4">
      {number}
    </div>
    <h5 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 leading-snug">{title}</h5>
    <p className="text-gray-700">{description}</p>
  </li>
);

interface ComparisonRowProps {
  feature: string;
  traditionalSim: string;
  alodataEsim: string;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ feature, traditionalSim, alodataEsim }) => (
  <tr className="hover:bg-gray-50">
    <td className="py-4 px-6 border-b text-sm md:text-base text-gray-700">{feature}</td>
    <td className="py-4 px-6 border-b text-sm md:text-base text-gray-700">{traditionalSim}</td>
    <td className="py-4 px-6 border-b text-sm md:text-base text-gray-700">{alodataEsim}</td>
  </tr>
);

interface RightForYouProps {
  icon: React.ReactNode;
  description: string;
}

const RightForYouItem: React.FC<RightForYouProps> = ({ icon, description }) => (
  <li className="flex flex-col items-center text-center bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 overflow-visible">
    <div className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 rounded-full p-4 mb-4">
      {icon}
    </div>
    <p className="text-lg md:text-xl text-gray-700 leading-snug">{description}</p>
  </li>
);

// Main Component

interface CountryContentProps {
  countryName: string;
  networks: string[];
  countryIso: string;
}

interface DataPlan {
  title: string;
  description: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ComparisonRowData {
  feature: string;
  traditionalSim: string;
  alodataEsim: string;
}

interface RightForYouData {
  icon: React.ReactNode;
  description: string;
}

const CountryContent: React.FC<CountryContentProps> = ({
  countryName,
  networks,
  countryIso,
}) => {
  const { t, direction } = useTranslations();
  const isRTL = direction === 'rtl';

  // Join networks with commas
  const networksList = networks.join(', ');

  // Data Plans
  const dataPlans: DataPlan[] = [
    {
      title: t('countryPage.dataPlans.plan1Title'), // e.g., "1 GB for 7 Days"
      description: t('countryPage.dataPlans.plan1Description'), // e.g., "Perfect for light browsing and messaging."
    },
    {
      title: t('countryPage.dataPlans.plan2Title'),
      description: t('countryPage.dataPlans.plan2Description'),
    },
    {
      title: t('countryPage.dataPlans.plan3Title'),
      description: t('countryPage.dataPlans.plan3Description'),
    },
  ];

  // Features for "Why Choose"
  const features: Feature[] = [
    {
      icon: <FaBolt className="h-8 w-8 text-white" />,
      title: t('countryPage.whyChoose.instantActivationHeading', { country: countryName }),
      description: t('countryPage.whyChoose.instantActivationDetail'),
    },
    {
      icon: <FaArrowsAlt className="h-8 w-8 text-white" />,
      title: t('countryPage.whyChoose.flexiblePlansHeading'),
      description: t('countryPage.whyChoose.flexiblePlansDetail'),
    },
    {
      icon: <MdSpeed className="h-8 w-8 text-white" />,
      title: t('countryPage.whyChoose.noThrottlingHeading'),
      description: t('countryPage.whyChoose.noThrottlingDetail'),
    },
  ];

  // How to Get Connected Steps
  const steps: Step[] = [
    {
      number: 1,
      title: t('countryPage.howToGetConnected.step1Title'), // e.g., "Pick a Plan"
      description: t('countryPage.howToGetConnected.step1Description', { country: countryName }), // "Browse our data packages for Faroe Islands and select the one that suits your needs."
    },
    {
      number: 2,
      title: t('countryPage.howToGetConnected.step2Title'), // e.g., "Activate"
      description: t('countryPage.howToGetConnected.step2Description'), // "After purchase, you’ll receive an email with a QR code. Simply scan it with your eSIM-compatible device to activate your plan."
    },
    {
      number: 3,
      title: t('countryPage.howToGetConnected.step3Title'), // e.g., "Connect"
      description: t('countryPage.howToGetConnected.step3Description', { country: countryName }), // "Start enjoying high-speed data in Faroe Islands immediately – no delays, no complicated setup."
    },
  ];

  // Comparison Table Rows
  const comparisonRows: ComparisonRowData[] = [
    {
      feature: t('countryPage.comparison.physicalSim'),
      traditionalSim: t('countryPage.comparison.traditionalSimYes'),
      alodataEsim: t('countryPage.comparison.alodataEsimNo'),
    },
    {
      feature: t('countryPage.comparison.activationTime'),
      traditionalSim: t('countryPage.comparison.traditionalSimHours'),
      alodataEsim: t('countryPage.comparison.alodataEsimInstant'),
    },
    {
      feature: t('countryPage.comparison.networksInCountry', { country: countryName }),
      traditionalSim: t('countryPage.comparison.traditionalSimLimited'),
      alodataEsim: t('countryPage.comparison.alodataEsimNetworks', { networks: networksList }),
    },
    {
      feature: t('countryPage.comparison.flexibility'),
      traditionalSim: t('countryPage.comparison.traditionalSimLow'),
      alodataEsim: t('countryPage.comparison.alodataEsimHigh'),
    },
    {
      feature: t('countryPage.comparison.cost'),
      traditionalSim: t('countryPage.comparison.traditionalSimHigh'),
      alodataEsim: t('countryPage.comparison.alodataEsimAffordable'),
    },
  ];

  // Is alodata eSIM Right for You
  const rightsForYou: RightForYouData[] = [
    {
      icon: <FaPlaneDeparture className="h-8 w-8 text-white" />,
      description: t('countryPage.isRightForYou.travelers', { country: countryName }),
    },
    {
      icon: <FaLaptop className="h-8 w-8 text-white" />,
      description: t('countryPage.isRightForYou.remoteWorkers', { country: countryName }),
    },
    {
      icon: <FaHome className="h-8 w-8 text-white" />,
      description: t('countryPage.isRightForYou.locals', { country: countryName }),
    },
  ];

  return (
    <section
      className="mt-16 bg-gray-50 py-12 md:py-16 lg:py-20 overflow-visible"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        {/* Stay Connected Section */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-snug py-2">
            {t('countryPage.stayConnected', { country: countryName })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('countryPage.intro', { country: countryName })}
          </p>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* What’s an eSIM Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-center overflow-visible">
            <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
              <div className="flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-500 rounded-full p-8">
                <MdSimCard className="w-32 h-32 md:w-40 md:h-40 text-white" />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h3 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800 leading-snug py-2">
                {t('countryPage.whatIsEsim')}
              </h3>
              <p className="text-lg md:text-xl text-gray-700">
                {t('countryPage.whatIsEsimDescription', { country: countryName })}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* Why Choose Section */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent text-center leading-snug py-2">
            {t('countryPage.whyChoose', { country: countryName })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* How to Get Connected Section */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent text-center leading-snug py-2">
            {t('countryPage.howToGetConnected', { country: countryName })}
          </h3>
          <ol className="space-y-8">
            {steps.map((step) => (
              <StepItem
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </ol>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* Data Plans Section */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-center leading-snug py-2">
            {t('countryPage.dataPlans', { country: countryName })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataPlans.map((plan, index) => (
              <DataPlanCard key={index} title={plan.title} description={plan.description} />
            ))}
          </div>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-center leading-snug py-2">
            {t('countryPage.comparison.title', { country: countryName })}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse rounded-lg overflow-visible shadow-lg">
              <thead>
                <tr>
                  <th className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    {t('countryPage.comparison.feature')}
                  </th>
                  <th className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    {t('countryPage.comparison.traditionalSim')}
                  </th>
                  <th className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    {t('countryPage.comparison.alodataEsim')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <ComparisonRow
                    key={index}
                    feature={row.feature}
                    traditionalSim={row.traditionalSim}
                    alodataEsim={row.alodataEsim}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* Is alodata eSIM Right for You Section */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent text-center leading-snug py-2">
            {t('countryPage.isRightForYou', { country: countryName })}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rightsForYou.map((item, index) => (
              <RightForYouItem key={index} icon={item.icon} description={item.description} />
            ))}
          </ul>
        </div>

        <div className="border-b border-gray-200 mb-16"></div>

        {/* Trusted by Millions Section */}
        <div className="mb-16 text-center">
          <h3 className="text-3xl md:text-4xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-snug py-2">
            {t('countryPage.trustedByMillions')}
          </h3>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            {t('countryPage.trustedByMillionsDescription', { country: countryName })}
          </p>
          <div className="mt-8 flex justify-center space-x-4 md:space-x-8">
            {/* Trustpilot Image with Clickable Link using Next.js Image Component */}
            <a
              href="https://www.trustpilot.com/review/alodata.net"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Trustpilot Reviews"
            >
              <Image
                src="/images/trustpilot.png"
                alt="Trustpilot"
                width={192} // Adjust width as needed
                height={48} // Adjust height as needed
                className="h-12 md:h-16 mx-auto"
                priority
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountryContent;
