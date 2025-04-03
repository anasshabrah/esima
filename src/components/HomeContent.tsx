// src/components/HomeContent.tsx

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from './HeroSection';
import PromoSection from './PromoSection';
import ImpactSection from './ImpactSection';
import CountriesSection from './CountriesSection';
import FAQSection from './FAQSection';
import { Country, HeroSectionRef } from '@/types/types';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';

// Dynamically import Modal to split into a separate chunk
const Modal = dynamic(() => import('./Modal'), { loading: () => null });

interface HomeContentProps {
  countries: Country[];
}

const HomeContent: React.FC<HomeContentProps> = ({ countries }) => {
  const heroRef = useRef<HeroSectionRef>(null);
  const { direction, t } = useTranslations();

  // State to manage Modal visibility
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State to store the referral code extracted from URL
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);

  // Handler to focus the search input and open the Modal
  const handleGetStartedClick = useCallback(() => {
    heroRef.current?.focusSearchInput();
    setIsModalOpen(true); // Open the Modal when "Get Started" is clicked
  }, []);

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  // Extract referralCode from URL query parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('referral');
    if (code) {
      setReferralCode(code);
    }
  }, []);

  return (
    <div
      className={classNames('flex flex-col px-2 sm:px-4 lg:px-6', {
        'text-right': isRTL,
        'text-left': !isRTL,
      })}
    >
      <HeroSection ref={heroRef} />
      <PromoSection onGetStartedClick={handleGetStartedClick} />
      <ImpactSection />
      <CountriesSection countries={countries} />
      <FAQSection />

      {/* Render the Modal and pass the referralCode */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          country={countries[0]} // You may want to adjust this based on user selection
          referralCode={referralCode} // Pass the referral code as a prop
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(HomeContent);
