import { Redis } from '@upstash/redis';
import { PdfDocument } from '@/types';
import path from 'path';
import { readFile } from 'fs/promises';

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
  if (!isSafePdfFilename(filename)) return null;

  if (redis) {
    const pdfData = await redis.get<string>(`pdf:${filename}`);
    if (pdfData) {
      return Buffer.from(pdfData, 'base64');
    }
  }

  return getPublicPdfFile(filename);
}

export async function deletePdfFile(filename: string): Promise<void> {
  if (!redis) {
    throw new Error('Redis not configured');
  }
  await redis.del(`pdf:${filename}`);
}

function isSafePdfFilename(filename: string): boolean {
  return path.basename(filename) === filename && filename.endsWith('.pdf');
}

async function getPublicPdfFile(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(path.join(process.cwd(), 'public', 'pdfs', filename));
  } catch {
    return null;
  }
}
