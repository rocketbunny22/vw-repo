import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'vwrepo.com',
          },
        ],
        destination: 'https://www.vwrepo.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.vercel\\.app',
          },
        ],
        destination: 'https://www.vwrepo.com/:path*',
        permanent: true,
      },
    ];
  },
  serverExternalPackages: ['@napi-rs/canvas'],
  outputFileTracingIncludes: {
    '/api/pdfs': ['node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
    '/api/admin': ['node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
    '/api/search': ['node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
