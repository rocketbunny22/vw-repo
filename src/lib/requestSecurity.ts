import { NextResponse } from 'next/server';

function normalizedOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

export function isTrustedMutationRequest(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;

  const origin = request.headers.get('origin');
  if (!origin) return false;

  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? normalizedOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : null;

  // In production, the canonical configured origin is the only authority. Do
  // not derive an allowed origin from request.url: upstream Host handling can
  // otherwise make an attacker-controlled host appear trustworthy.
  if (process.env.NODE_ENV === 'production') {
    return configuredOrigin !== null && normalizedOrigin(origin) === configuredOrigin;
  }

  const allowedOrigins = new Set<string>();
  const requestOrigin = normalizedOrigin(request.url);

  if (requestOrigin) allowedOrigins.add(requestOrigin);
  if (configuredOrigin) allowedOrigins.add(configuredOrigin);

  const submittedOrigin = normalizedOrigin(origin);
  return submittedOrigin !== null && allowedOrigins.has(submittedOrigin);
}

export function rejectUntrustedMutation(request: Request): NextResponse | null {
  return isTrustedMutationRequest(request)
    ? null
    : NextResponse.json(
        { error: 'Invalid request origin', code: 'INVALID_ORIGIN' },
        { status: 403 },
      );
}
