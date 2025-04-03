// src/components/GoogleTagManager.tsx

import React from 'react';
import Script from 'next/script';

const GTM_ID = 'GTM-NRQCJX9P';

/**
 * GoogleTagManagerScript Component
 * Loads the GTM script lazily after the main content has loaded.
 */
export const GoogleTagManagerScript = () => (
  <Script
    id="gtm-script"
    strategy="beforeInteractive"
    src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
  />
);

/**
 * GoogleTagManagerNoScript Component
 * Provides a fallback for browsers with JavaScript disabled.
 */
export const GoogleTagManagerNoScript = () => (
  <noscript>
    <iframe
      src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
      height="0"
      width="0"
      style={{ display: 'none', visibility: 'hidden' }}
      title="GTM NoScript"
    ></iframe>
  </noscript>
);
