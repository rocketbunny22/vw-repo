import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
