// src/app/layout.tsx

import React from 'react';
import '@/app/globals.css';
import { Readex_Pro } from 'next/font/google';
import Script from 'next/script';
import TranslationsClientProvider from '@/components/TranslationsClientProvider';
import { defaultLanguage } from '@/translations/supportedLanguages';
import {
  GoogleTagManagerScript,
  GoogleTagManagerNoScript,
} from '@/components/GoogleTagManager';
import { AuthProvider } from '@/context/AuthContext';
import CloudflareInsights from '@/components/CloudflareInsights';

const readexPro = Readex_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={defaultLanguage.code} className={readexPro.className}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/images/heroimage.avif" as="image" type="image/avif" />
        <Script
          type="application/ld+json"
          id="organization-schema"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'alodata eSIM',
              url: 'https://alodata.net',
              logo: 'https://alodata.net/images/large-logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@alodata.net',
                contactType: 'customer support',
                availableLanguage: [
                  'Arabic',
                  'English',
                  'French',
                  'Portuguese',
                  'Spanish',
                  'Chinese',
                  'German',
                  'Turkish',
                  'Italian',
                  'Japanese',
                  'Korean',
                  'Russian',
                  'Dutch',
                  'Norwegian',
                  'Swedish',
                  'Ukrainian',
                  'Czech',
                  'Greek',
                  'Finnish',
                  'Danish',
                ],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Habrah LLC',
                addressLocality: 'Sheridan',
                addressRegion: 'WY',
                postalCode: '82801',
                addressCountry: 'US',
              },
            }),
          }}
        />
        <Script
          type="application/ld+json"
          id="website-schema"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://alodata.net',
              name: 'alodata eSIM',
            }),
          }}
        />
        <GoogleTagManagerScript />
        <CloudflareInsights />
      </head>
      <body>
        <GoogleTagManagerNoScript />
        <AuthProvider>
          <TranslationsClientProvider initialLanguage={defaultLanguage.code}>
            {children}
          </TranslationsClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
