// src/components/Header.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import LocalizedLink from './LocalizedLink';
import { useCurrency } from '@/context/CurrencyContext';
import { GeolocationData } from '@/types/types';
import logger from '@/utils/logger.client';

const LoginModal = dynamic(() => import('./LoginModal'), { loading: () => null });

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const { t, direction } = useTranslations();
  const { setCurrency, setExchangeRate, setCountryIso, setCurrencySymbol } = useCurrency();
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  const isRTL = direction === 'rtl';

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  useEffect(() => {
    const fetchGeolocationAndCreateUser = async () => {
      try {
        const geoResponse = await fetch('/api/get-geolocation', {
          method: 'GET',
          credentials: 'include',
        });

        if (!geoResponse.ok) {
          throw new Error('Failed to fetch geolocation data.');
        }

        const geoData: GeolocationData = await geoResponse.json();
        setGeoData(geoData);
        setCurrency(geoData.currencyCode || 'USD');
        setExchangeRate(geoData.exchangeRate || 1);
        setCountryIso(geoData.countryCode || 'US');
        setCurrencySymbol(geoData.currencySymbol || '$');

        const tempUserResponse = await fetch('/api/temporary-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ geoData }),
        });

        if (!tempUserResponse.ok) {
          const errorData = await tempUserResponse.json();
          throw new Error(errorData.error || 'Failed to create temporary user.');
        }

        await tempUserResponse.json();
      } catch (error: any) {
        setGeoError(error.message || 'An unknown error occurred.');
        logger.error('Error in Header geolocation and temporary user creation:', {
          error: error.message || 'Unknown error',
        });
      } finally {
        setGeoLoading(false);
      }
    };

    fetchGeolocationAndCreateUser();
  }, [setCurrency, setExchangeRate, setCountryIso, setCurrencySymbol]);

  return (
    <header
      className={classNames(
        'shadow-md p-2 sm:p-4 flex items-center mt-2 mb-2 sm:mb-4 mx-2 sm:mx-4 rounded-lg',
        {
          'bg-primary flex-row justify-between': !isRTL,
          'bg-primary flex-row-reverse justify-between': isRTL,
        }
      )}
    >
      <div className="flex-shrink-0">
        <LocalizedLink href="/" aria-label={t('header.home')} className="block">
          <Image
            src="/images/large-logo-w.png"
            alt={t('header.logoAlt')}
            width={200}
            height={50}
            priority={true}
            className="w-32 sm:w-40"
          />
        </LocalizedLink>
      </div>

      <div className="flex-1 hidden sm:block"></div>

      <button
        onClick={openLoginModal}
        className="px-3 py-1.5 bg-white text-primary font-semibold rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base whitespace-nowrap"
        aria-label={t('header.login')}
      >
        {t('header.login')}
      </button>

      {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
    </header>
  );
};

export default React.memo(Header);
