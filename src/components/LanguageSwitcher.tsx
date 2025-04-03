// src/components/LanguageSwitcher.tsx

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supportedLanguages, defaultLanguage, Language, SupportedLanguage } from '@/translations/supportedLanguages';
import { useTranslations } from '@/context/TranslationsContext';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setLanguage } = useTranslations();

  const pathSegments = pathname.split('/').filter(Boolean);

  // Check if the first segment is a supported language
  const isSupportedLang = supportedLanguages.some(
    (langObj: SupportedLanguage) => langObj.code === pathSegments[0]
  );
  const currentLang: Language = isSupportedLang ? (pathSegments[0] as Language) : defaultLanguage.code;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value as Language;

    let newPathSegments = [...pathSegments];

    if (selectedLang === defaultLanguage.code) {
      if (isSupportedLang) {
        newPathSegments.shift();
      }
    } else {
      if (isSupportedLang) {
        newPathSegments[0] = selectedLang;
      } else {
        newPathSegments.unshift(selectedLang);
      }
    }

    const newPath = `/${newPathSegments.join('/')}`;
    setLanguage(selectedLang);
    router.push(newPath);
  };

  return (
    <div className="relative inline-block text-left">
      <select
        onChange={handleChange}
        value={currentLang}
        className="px-2 py-1 border rounded bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary 
                   sm:px-3 sm:py-1.5 sm:text-base"
        aria-label="Select Language"
      >
        <option value={defaultLanguage.code}>{defaultLanguage.name}</option>
        {supportedLanguages.map((lang: SupportedLanguage) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
