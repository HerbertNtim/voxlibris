import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'wghepn2rcg1ivn7v.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
