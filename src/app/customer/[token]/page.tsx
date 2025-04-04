// src/app/customer/[token]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { defaultLanguage, Language } from '@/translations/supportedLanguages';
import CustomerContent from '@/components/CustomerContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TranslationsProvider } from '@/context/TranslationsContext';
import LangDirWrapper from '@/components/LangDirWrapper';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { User, Order } from '@/types/types';

/**
 * Define the metadata for the page to instruct search engines not to index or follow links
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
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
            // Include bundle with its nested countries relation
            bundle: {
              include: {
                countries: true,
              },
            },
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
  const { token } = await params;
  const language: Language = defaultLanguage.code;

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
