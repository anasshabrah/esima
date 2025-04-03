// tailwind.config.ts

import type { Config } from 'tailwindcss';
import flip from 'tailwindcss-flip';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/schemas/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
    './src/types/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background-light)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        highlight: 'var(--highlight)',
        accent: 'var(--accent)',
        warning: 'var(--warning)',
        neutral: 'var(--neutral)',
        white: 'var(--white)',
        customBlue: '#CBCFEC',
        green: {
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
      container: {
        center: true,
        padding: '2rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [flip],
};

export default config;
