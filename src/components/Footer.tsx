// src/components/Footer.tsx

'use client';

import React from 'react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsConditionsModal from './TermsConditionsModal';
import {
  FaMapMarkerAlt,
  FaGooglePay,
  FaCcApplePay,
  FaCcVisa,
  FaCcMastercard,
} from 'react-icons/fa';
import { PaymentMethod } from '@/types/types';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const [isPrivacyOpen, setPrivacyOpen] = React.useState<boolean>(false);
  const [isTermsOpen, setTermsOpen] = React.useState<boolean>(false);
  const currentYear = new Date().getFullYear();
  const { t, direction } = useTranslations();
  const pathname = usePathname();

  const paymentMethods: PaymentMethod[] = [
    {
      icon: FaGooglePay,
      label: 'Google Pay',
    },
    {
      icon: FaCcApplePay,
      label: 'Apple Pay',
    },
    {
      icon: FaCcVisa,
      label: 'Visa',
    },
    {
      icon: FaCcMastercard,
      label: 'Mastercard',
    },
  ];

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  // Define pages where the LanguageSwitcher should be hidden
  const pagesToHideLanguageSwitcher = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/referral-dashboard',
  ];

  // Remove locale prefix from pathname (e.g., '/en/signin' -> '/signin')
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');

  // Check if the current path matches any of the pages
  const hideLanguageSwitcher = pagesToHideLanguageSwitcher.includes(normalizedPathname);

  return (
    <footer
      style={{ backgroundColor: '#1F3B4D' }}
      className="text-white py-6 mx-2 sm:mx-4 rounded-lg px-2 sm:px-4"
    >
      <div className="container mx-auto flex flex-col items-center space-y-4">
        {/* Language Switcher */}
        {!hideLanguageSwitcher && <LanguageSwitcher />}

        {/* Payment Logos */}
        <div className="flex justify-center items-center flex-wrap gap-4">
          {paymentMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                title={method.label}
                aria-label={method.label}
              >
                <IconComponent
                  style={{ fontSize: '40px' }}
                  className="text-white"
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>

        {/* Partners Login and New Partner Links */}
        <div
          className={classNames(
            'flex justify-center items-center mt-4',
            {
              'flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6': !isRTL,
              'flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-6': isRTL,
            }
          )}
        >
          <a
            href="/signin"
            className="text-sm sm:text-base text-blue-100 hover:text-white focus:text-white focus:outline-none"
            aria-label="Partner Login"
          >
            Partner Login
          </a>
          <a
            href="/signup"
            className="text-sm sm:text-base text-blue-100 hover:text-white focus:text-white focus:outline-none"
            aria-label="New Partner"
          >
            New Partner
          </a>
        </div>

        {/* Company Name and Address */}
        <div
          className={classNames('flex justify-center items-center space-x-2 mt-4', {
            'rtl:space-x-reverse': isRTL,
          })}
        >
          <FaMapMarkerAlt style={{ fontSize: '16px' }} aria-hidden="true" />
          <span className="text-sm sm:text-base text-gray-200">{t('footer.address')}</span>
        </div>

        {/* Privacy Policy and Terms of Service */}
        <div
          className={classNames('flex justify-center space-x-6 mt-2', {
            'rtl:space-x-reverse': isRTL,
          })}
        >
          <button
            onClick={() => setPrivacyOpen(true)}
            className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label={t('footer.privacyPolicy')}
          >
            {t('footer.privacyPolicy')}
          </button>
          <button
            onClick={() => setTermsOpen(true)}
            className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label={t('footer.terms')}
          >
            {t('footer.terms')}
          </button>
        </div>

        {/* Customer Support Button */}
        <div className="mt-4">
          <a
            href="mailto:esim@alodata.net"
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
            aria-label="Customer Support"
          >
            Customer Support
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm sm:text-base mt-4 text-gray-400">
          &copy; {currentYear} {t('footer.copyright')}
        </p>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setPrivacyOpen(false)} />

      {/* Terms & Conditions Modal */}
      <TermsConditionsModal isOpen={isTermsOpen} onClose={() => setTermsOpen(false)} />
    </footer>
  );
};

export default Footer;
