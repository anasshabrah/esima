// src/types/global.d.ts

export {};

declare global {
  interface Window {
    dataLayer: Array<Record<string, any>>;
    _cf?: {
      insights?: {
        init: () => void;
        // Add other properties or methods if needed
      };
    };
  }
}
