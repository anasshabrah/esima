// src/components/ClientWrapper.tsx

'use client';

import React from 'react';
import TranslationsClientProvider from '@/components/TranslationsClientProvider';
import { Language } from '@/translations/supportedLanguages';

interface ClientWrapperProps {
  children: React.ReactNode;
  initialLanguage: Language;
  currency?: string;
  exchangeRate?: number;
  countryCode?: string;
  currencySymbol?: string;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({
  children,
  initialLanguage,
  currency = 'USD',
  exchangeRate = 1,
  countryCode = 'US',
  currencySymbol = '$',
}) => {
  return (
    <TranslationsClientProvider
      initialLanguage={initialLanguage}
      initialCurrency={currency}
      initialExchangeRate={exchangeRate}
      initialCountryIso={countryCode}
      initialCurrencySymbol={currencySymbol}
    >
      {children}
    </TranslationsClientProvider>
  );
};

export default ClientWrapper;
