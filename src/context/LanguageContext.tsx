// src/context/LanguageContext.tsx

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Language } from '@/translations/supportedLanguages';

interface LanguageContextType {
  lang: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{
  lang: Language;
  children: ReactNode;
}> = ({ lang, children }) => {
  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
