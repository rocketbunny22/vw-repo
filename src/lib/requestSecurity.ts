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

  const allowedOrigins = new Set<string>();
  const requestOrigin = normalizedOrigin(request.url);
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? normalizedOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : null;

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
