import crypto from 'node:crypto';

export function createOpaqueResetToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function digestResetToken(token: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}
