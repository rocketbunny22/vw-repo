import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Proxy now covers API routes as an additional framework-level ceiling.
    // Individual routes retain stricter limits where appropriate.
    proxyClientMaxBodySize: '12mb',
  },
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.vercel-insights.com https://*.vercel-analytics.com",
      "frame-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
    ].join('; ');
    const pdfContentSecurityPolicy = contentSecurityPolicy.replace(
      "frame-ancestors 'none'",
      "frame-ancestors 'self'",
    );

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
        ],
      },
      {
        source: '/api/pdfs/:filename',
        headers: [
          { key: 'Content-Security-Policy', value: pdfContentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/gen/:gen/system/:sys',
        destination: '/systems/:sys?gen=:gen',
        permanent: true,
      },
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
