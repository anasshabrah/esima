// next.config.mjs

import path from 'path';
import { fileURLToPath } from 'url';

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'esimgo-cms-images-prod.s3.eu-west-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
};

export default nextConfig;
