// src/utils/getDirection.ts

import { Language } from '@/types/types';

export function getDirection(language: Language): 'ltr' | 'rtl' {
  const rtlLanguages: Language[] = ['ar']; // Add other RTL languages if needed
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
}
