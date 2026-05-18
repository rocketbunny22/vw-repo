import { Redis } from '@upstash/redis';
import { PdfDocument } from '@/types';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function getAllPdfs(): Promise<PdfDocument[]> {
  if (!redis) {
    return [];
  }

  const pdfs = await redis.get<PdfDocument[]>('pdfs');
  return Array.isArray(pdfs) ? pdfs : [];
}

export async function saveAllPdfs(pdfs: PdfDocument[]): Promise<void> {
  if (!redis) {
    throw new Error('Redis not configured');
  }

  await redis.set('pdfs', pdfs);
}

export async function savePdfFile(filename: string, buffer: Buffer): Promise<void> {
  if (!redis) {
    throw new Error('Redis not configured');
  }
  await redis.set(`pdf:${filename}`, buffer.toString('base64'));
}

export async function getPdfFile(filename: string): Promise<Buffer | null> {
  if (!redis) {
    return null;
  }

  const pdfData = await redis.get<string>(`pdf:${filename}`);
  return pdfData ? Buffer.from(pdfData, 'base64') : null;
}

export async function deletePdfFile(filename: string): Promise<void> {
  if (!redis) {
    throw new Error('Redis not configured');
  }
  await redis.del(`pdf:${filename}`);
}
