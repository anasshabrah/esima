// src/components/SuccessView.tsx

'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  FaCheckCircle,
  FaApple,
  FaArrowLeft,
  FaArrowRight,
  FaVideo,
} from 'react-icons/fa';
import VideoModal from './VideoModal';
import {
  ESIMDetailWithQRCode,
  SuccessDetails,
  SuccessViewProps,
} from '@/types/types';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import { useCurrency } from '@/context/CurrencyContext';

const SuccessView: React.FC<SuccessViewProps> = ({
  successDetails,
  onClose,
}) => {
  const { bundleDetails, esimDetails, countryName, orderId } = successDetails;
  const { currency, currencySymbol, exchangeRate } = useCurrency();

  const [currentEsimIndex, setCurrentEsimIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const { t, direction } = useTranslations();

  const isRTL = direction === 'rtl';

  const currentEsim: ESIMDetailWithQRCode | undefined = esimDetails[currentEsimIndex];
  const activationCode: string = currentEsim?.activationCode || '';
  const appleQuickInstallLink: string = activationCode
    ? `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${activationCode}`
    : '';

  const dataAmount: string =
    (bundleDetails.dataAmount || 0) <= 0
      ? t('successView.unlimited')
      : `${(bundleDetails.dataAmount || 0) / 1000} GB`;

  const countryDisplay: string = countryName || t('successView.notAvailable');

  const handlePrevEsim = () => {
    if (currentEsimIndex > 0) {
      setCurrentEsimIndex((prev) => prev - 1);
    }
  };

  const handleNextEsim = () => {
    if (currentEsimIndex < esimDetails.length - 1) {
      setCurrentEsimIndex((prev) => prev + 1);
    }
  };

  /**
   * Function to trigger Google Ads Conversion via GTM
   */
  const triggerGoogleAdsConversion = () => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      const items = [
        {
          item_id: bundleDetails.id.toString(), // Use bundle ID
          item_name: bundleDetails.name, // Use bundle name
          price: bundleDetails.price * exchangeRate, // Convert price based on exchange rate
          quantity: esimDetails.length, // Number of eSIMs purchased
          currency: currency, // Use currency from context
        },
      ];

      (window as any).dataLayer.push({
        event: 'purchase', // Changed event name to 'purchase'
        ecommerce: {
          transaction_id: orderId.toString(), // Include order ID
          value: bundleDetails.price * exchangeRate, // Total transaction value
          currency: currency, // Dynamic currency from context
          items: items, // List of items purchased
        },
      });
      console.log('Google Ads Conversion Event Triggered via GTM');
    } else {
      console.warn('dataLayer not initialized.');
    }
  };

  // Trigger conversion when the component mounts
  useEffect(() => {
    triggerGoogleAdsConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classNames(
        'flex flex-col items-center space-y-4 p-2 sm:p-4 max-w-md mx-auto w-full overflow-x-hidden',
        {
          'text-right': isRTL,
          'text-left': !isRTL,
        }
      )}
    >
      <div className="flex flex-col items-center">
        <FaCheckCircle
          className="text-green-500 text-2xl sm:text-3xl mb-1 sm:mb-2"
          aria-hidden="true"
        />
        <h2 className="text-lg sm:text-xl font-semibold text-primary text-center">
          {t('successView.purchaseSuccessful')}
        </h2>
      </div>
      <p className="text-center text-gray-700 max-w-xs sm:max-w-md text-xs sm:text-sm break-words">
        {t('successView.screenshotMessage')}
      </p>
      <div className="flex flex-col items-center space-y-1 sm:space-y-2">
        {activationCode && (
          <>
            <QRCode
              value={activationCode}
              size={100}
              aria-label={t('successView.scanQRCode')}
              className="w-24 h-24 sm:w-32 sm:h-32"
            />
            <span className="text-xs sm:text-sm text-gray-700 text-center break-words">
              {t('successView.scanQRCode')} {currentEsimIndex + 1} {t('successView.esimIndex')}
            </span>
          </>
        )}
        {activationCode && (
          <a
            href={appleQuickInstallLink}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
              'mt-2 sm:mt-3 bg-blue-600 text-white py-1 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center text-xs sm:text-sm w-full sm:w-auto',
              {
                'flex-row-reverse': isRTL,
                'flex-row': !isRTL,
              }
            )}
            aria-label={t('successView.quickInstall')}
          >
            <FaApple
              className={classNames('w-3 h-3 sm:w-4 sm:h-4', {
                'ml-2 sm:ml-3': isRTL,
                'mr-1 sm:mr-2': !isRTL,
              })}
              aria-hidden="true"
            />
            {t('successView.quickInstall')}
          </a>
        )}
      </div>

      {activationCode && (
        <button
          onClick={() => setIsVideoModalOpen(true)}
          className={classNames(
            'mt-2 sm:mt-3 bg-green-600 text-white py-1 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-green-700 transition-colors flex items-center text-xs sm:text-sm w-full sm:w-auto',
            {
              'flex-row-reverse': isRTL,
              'flex-row': !isRTL,
            }
          )}
          aria-label={t('successView.howToActivate')}
        >
          <FaVideo
            className={classNames('w-3 h-3 sm:w-4 sm:h-4', {
              'ml-2 sm:ml-3': isRTL,
              'mr-1 sm:mr-2': !isRTL,
            })}
            aria-hidden="true"
          />
          {t('successView.howToActivate')}
        </button>
      )}

      <div className="flex items-center justify-between w-full max-w-xs sm:max-w-md mt-2 sm:mt-3">
        <button
          onClick={handlePrevEsim}
          disabled={currentEsimIndex === 0}
          className={classNames(
            `p-1 sm:p-2 rounded-full ${
              currentEsimIndex === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-primary`,
            {
              'ml-0': isRTL,
              'mr-0': !isRTL,
            }
          )}
          aria-label={t('successView.previousEsim')}
        >
          {isRTL ? (
            <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
        <span className="text-gray-700 font-medium text-xs sm:text-sm">
          {currentEsimIndex + 1} {t('successView.of')} {esimDetails.length}
        </span>
        <button
          onClick={handleNextEsim}
          disabled={currentEsimIndex === esimDetails.length - 1}
          className={classNames(
            `p-1 sm:p-2 rounded-full ${
              currentEsimIndex === esimDetails.length - 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-primary`,
            {
              'mr-0': isRTL,
              'ml-0': !isRTL,
            }
          )}
          aria-label={t('successView.nextEsim')}
        >
          {isRTL ? (
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      <div className="w-full bg-gray-100 p-2 sm:p-4 rounded-lg shadow-inner mt-3 sm:mt-4">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 text-xs sm:text-sm">
              {t('successView.dataAmount')}
            </span>
            <span className="text-gray-900 text-xs sm:text-sm break-words">
              {dataAmount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 text-xs sm:text-sm">
              {t('successView.duration')}
            </span>
            <span className="text-gray-900 text-xs sm:text-sm">
              {bundleDetails.duration}{' '}
              {bundleDetails.duration === 1
                ? t('successView.day')
                : t('successView.days')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 text-xs sm:text-sm">
              {t('successView.country')}
            </span>
            <span className="text-gray-900 text-xs sm:text-sm break-words">
              {countryDisplay}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-3 sm:mt-4 bg-primary text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full hover:bg-highlight transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm w-full sm:w-auto"
        aria-label={t('successView.close')}
      >
        {t('successView.close')}
      </button>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/video/android.mp4"
        title={t('successView.howToActivate')}
      />
    </div>
  );
};

export default SuccessView;