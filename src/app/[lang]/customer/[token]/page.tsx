// src/app/[lang]/customer/[token]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import {
  supportedLanguages,
  Language,
  SupportedLanguage,
} from '@/translations/supportedLanguages';
import CustomerContent from '@/components/CustomerContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TranslationsProvider } from '@/context/TranslationsContext';
import LangDirWrapper from '@/components/LangDirWrapper';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { User, Order } from '@/types/types';

/**
 * Exporting metadata to set noindex and nofollow for this page
 */
export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

/**
 * Fetch user data based on the provided token
 */
const getUserByToken = async (token: string): Promise<User | null> => {
  try {
    const userFromDb = await prisma.user.findUnique({
      where: { token },
      include: {
        orders: {
          include: {
            bundle: true,
            country: true,
            esims: true,
          },
        },
        otp: true,
      },
    });

    if (userFromDb) {
      const user: User = {
        id: userFromDb.id,
        email: userFromDb.email ?? null,
        createdAt: userFromDb.createdAt,
        token: userFromDb.token,
        ip: userFromDb.ip ?? null,
        currencyCode: userFromDb.currencyCode,
        currencySymbol: userFromDb.currencySymbol,
        exchangeRate: userFromDb.exchangeRate,
        language: userFromDb.language as Language,
        orders: userFromDb.orders as Order[] | undefined,
        otp: userFromDb.otp ?? undefined,
      };

      return user;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user by token:', error);
    return null;
  }
};

/**
 * The main CustomerPage component
 */
export default async function CustomerPage({ params }: { params: any }) {
  const { lang, token } = await params;

  // Validate the language parameter or default to 'en'
  const isValidLanguage = lang
    ? supportedLanguages.some((l: SupportedLanguage) => l.code === lang)
    : false;
  const language: Language = isValidLanguage ? (lang as Language) : 'en';

  if (!token) {
    notFound();
    return null;
  }

  const user = await getUserByToken(token);

  if (!user) {
    notFound();
    return null;
  }

  return (
    <>
      <Header />
      <TranslationsProvider initialLanguage={language}>
        <LangDirWrapper>
          <CustomerContent user={user} />
        </LangDirWrapper>
      </TranslationsProvider>
      <Footer />
    </>
  );
}
