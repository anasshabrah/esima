// src/components/TranslationsClientProvider.tsx

'use client';

import React, { ReactNode } from 'react';
import { TranslationsProvider } from '@/context/TranslationsContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { Language } from '@/translations/supportedLanguages';

interface TranslationsClientProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
  initialCurrency?: string;
  initialExchangeRate?: number;
  initialCountryIso?: string;
  initialCurrencySymbol?: string;
}

const TranslationsClientProvider: React.FC<TranslationsClientProviderProps> = ({
  children,
  initialLanguage,
  initialCurrency = 'USD',
  initialExchangeRate = 1,
  initialCountryIso = 'US',
  initialCurrencySymbol = '$',
}) => {
  return (
    <CurrencyProvider
      initialCurrency={initialCurrency}
      initialExchangeRate={initialExchangeRate}
      initialCountryIso={initialCountryIso}
      initialCurrencySymbol={initialCurrencySymbol}
    >
      <TranslationsProvider initialLanguage={initialLanguage}>
        {children}
      </TranslationsProvider>
    </CurrencyProvider>
  );
};

export default TranslationsClientProvider;
