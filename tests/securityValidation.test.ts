import { describe, expect, it } from 'vitest';
import { createOpaqueResetToken, digestResetToken } from '@/lib/resetTokens';
import { hasPdfMagicBytes, normalizedEmail, normalizedUsername, passwordError } from '@/lib/validation';

describe('security validation', () => {
  it('creates URL-safe opaque reset tokens and only derives fixed-size digests', () => {
    const token = createOpaqueResetToken();
    const digest = digestResetToken(token, 'test-secret-with-at-least-32-characters');

    expect(token).toMatch(/^[a-zA-Z0-9_-]{43}$/);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(token);
  });

  it('rejects spoofed PDF content without a PDF signature', () => {
    expect(hasPdfMagicBytes(Buffer.from('%PDF-1.7'))).toBe(true);
    expect(hasPdfMagicBytes(Buffer.from('<script>alert(1)</script>'))).toBe(false);
  });

  it('normalizes identities and enforces password policy', () => {
    expect(normalizedEmail(' User@Example.COM ')).toBe('user@example.com');
    expect(normalizedUsername('valid_user')).toBe('valid_user');
    expect(normalizedUsername('invalid user')).toBeNull();
    expect(passwordError('short')).not.toBeNull();
    expect(passwordError('long-enough-1')).toBeNull();
  });
});
