import { generations } from '@/data/generations';

export const INPUT_LIMITS = {
  title: 160,
  description: 2_000,
  guideContent: 40_000,
  comment: 2_000,
  feedback: 8_000,
  name: 80,
  email: 254,
  username: 30,
  arrayItems: 30,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const validGenerations = new Set(generations.map((generation) => generation.id));
const validSystems = new Set(generations.flatMap((generation) => generation.systems.map((system) => system.slug)));

export function normalizedEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= INPUT_LIMITS.email && EMAIL_PATTERN.test(email) ? email : null;
}

export function normalizedUsername(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const username = value.trim();
  return username.length >= 3
    && username.length <= INPUT_LIMITS.username
    && USERNAME_PATTERN.test(username)
    ? username
    : null;
}

export function passwordError(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 10) return 'Password must be at least 10 characters';
  if (value.length > 128) return 'Password must be no more than 128 characters';
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return 'Password must include a letter and a number';
  return null;
}

export function boundedString(value: unknown, maxLength: number, required = true): string | null {
  if (typeof value !== 'string') return required ? null : '';
  const text = value.trim();
  if ((required && text.length === 0) || text.length > maxLength) return null;
  return text;
}

export function boundedStringArray(value: unknown, maxItems = INPUT_LIMITS.arrayItems): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const values = value.map((item) => boundedString(item, INPUT_LIMITS.name));
  return values.every((item): item is string => item !== null) ? values : null;
}

export function isValidGeneration(value: string): boolean {
  return validGenerations.has(value);
}

export function isValidSystem(value: string): boolean {
  return validSystems.has(value);
}

export function requestClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export function hasPdfMagicBytes(value: Uint8Array): boolean {
  return value.length >= 5
    && value[0] === 0x25
    && value[1] === 0x50
    && value[2] === 0x44
    && value[3] === 0x46
    && value[4] === 0x2d;
}

export async function readJsonObject(request: Request, maxBytes = 64 * 1024): Promise<Record<string, unknown> | null> {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) return null;

  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) return null;

  try {
    const value = JSON.parse(text) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}
