// src/components/CloudflareInsights.tsx

'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * CloudflareInsights Component
 * Loads the Cloudflare Insights script and initializes it after loading.
 */
const CloudflareInsights = () => {
  useEffect(() => {
    // Initialize Cloudflare Insights after the script has loaded
    if (typeof window !== 'undefined' && window._cf?.insights) {
      window._cf.insights.init();
      console.log('Cloudflare Insights initialized.');
    }
  }, []);

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="lazyOnload" // Defers loading until after main content
      onLoad={() => {
        // Additional initialization can be performed here if needed
        console.log('Cloudflare Insights script loaded.');
      }}
      onError={(e) => {
        console.error('Error loading Cloudflare Insights script:', e);
      }}
    />
  );
};

export default CloudflareInsights;
