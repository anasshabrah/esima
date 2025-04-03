// src/context/CurrencyContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from 'react';
import Cookies from 'js-cookie';
import logger from '@/utils/logger.client';
import {
  getCurrencySymbol,
  DEFAULT_CURRENCY_SYMBOL,
} from '@/utils/getCurrencySymbol';

interface CurrencyContextProps {
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  countryIso: string;
  setCurrency: (currency: string) => void;
  setCurrencySymbol: (symbol: string) => void;
  setExchangeRate: (rate: number) => void;
  setCountryIso: (iso: string) => void;
}

const CurrencyContext = createContext<CurrencyContextProps | null>(null);

export const CurrencyProvider: FC<{
  children: ReactNode;
  initialCurrency?: string;
  initialExchangeRate?: number;
  initialCountryIso?: string;
  initialCurrencySymbol?: string;
}> = ({
  children,
  initialCurrency,
  initialExchangeRate,
  initialCountryIso,
  initialCurrencySymbol,
}) => {
  const getInitialValue = (key: string, initial: any) => {
    if (initial !== undefined && initial !== null) {
      return initial;
    }
    try {
      const cookie = Cookies.get(key);
      if (cookie) {
        if (key === 'exchangeRate') {
          const rate = parseFloat(cookie);
          return !isNaN(rate) && rate > 0 ? rate : undefined;
        }
        return cookie;
      }
    } catch {
      logger.error(`Error reading ${key} from cookies`, {});
    }
    return undefined;
  };

  const [currency, setCurrencyState] = useState<string>(
    getInitialValue('currency', initialCurrency) || 'USD'
  );
  const [currencySymbol, setCurrencySymbolState] = useState<string>(
    getInitialValue('currencySymbol', initialCurrencySymbol) || '$'
  );
  const [exchangeRate, setExchangeRateState] = useState<number>(
    getInitialValue('exchangeRate', initialExchangeRate) || 1
  );
  const [countryIso, setCountryIsoState] = useState<string>(
    getInitialValue('countryIso', initialCountryIso) || 'US'
  );

  useEffect(() => {
    try {
      Cookies.set('currency', currency, { expires: 365 });
      Cookies.set('exchangeRate', exchangeRate.toString(), { expires: 365 });
      Cookies.set('countryIso', countryIso, { expires: 365 });
      Cookies.set('currencySymbol', currencySymbol, { expires: 365 });
    } catch {
      logger.error('Error storing currency data in cookies', {});
    }
  }, [currency, exchangeRate, countryIso, currencySymbol]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    try {
      const symbol = getCurrencySymbol(newCurrency) || DEFAULT_CURRENCY_SYMBOL;
      setCurrencySymbolState(symbol);
      Cookies.set('currency', newCurrency, { expires: 365 });
      Cookies.set('currencySymbol', symbol, { expires: 365 });
    } catch {
      logger.error('Error updating currency and symbol in cookies', {});
    }
  };

  const setCurrencySymbol = (symbol: string) => {
    setCurrencySymbolState(symbol);
    try {
      Cookies.set('currencySymbol', symbol, { expires: 365 });
    } catch {
      logger.error('Error updating currency symbol in cookies', {});
    }
  };

  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate);
    try {
      Cookies.set('exchangeRate', rate.toString(), { expires: 365 });
    } catch {
      logger.error('Error updating exchange rate in cookies', {});
    }
  };

  const setCountryIso = (iso: string) => {
    setCountryIsoState(iso);
    try {
      Cookies.set('countryIso', iso, { expires: 365 });
    } catch {
      logger.error('Error updating country ISO in cookies', {});
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        exchangeRate,
        countryIso,
        setCurrency,
        setCurrencySymbol,
        setExchangeRate,
        setCountryIso,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
