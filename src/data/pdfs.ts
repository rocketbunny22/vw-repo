import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';
import { PdfDocument } from '@/types';

const pdfsDbFile = path.resolve(process.cwd(), 'pdfs.json');
const pdfStorageDir = path.resolve(process.cwd(), 'public', 'pdfs');

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function getFilePdfs(): Promise<PdfDocument[]> {
  try {
    const data = await readFile(pdfsDbFile, 'utf-8');
    const pdfs = JSON.parse(data);
    return Array.isArray(pdfs) ? pdfs : [];
  } catch {
    return [];
  }
}

async function getRedisPdfs(): Promise<PdfDocument[]> {
  if (!redis) {
    return [];
  }

  const pdfs = await redis.get<PdfDocument[]>('pdfs');
  return Array.isArray(pdfs) ? pdfs : [];
}

export async function getAllPdfs(): Promise<PdfDocument[]> {
  const [filePdfs, redisPdfs] = await Promise.all([getFilePdfs(), getRedisPdfs()]);
  const mergedPdfs = new Map<string, PdfDocument>();

  for (const pdf of filePdfs) {
    mergedPdfs.set(pdf.id, pdf);
  }

  for (const pdf of redisPdfs) {
    mergedPdfs.set(pdf.id, pdf);
  }

  return Array.from(mergedPdfs.values());
}

export async function saveAllPdfs(pdfs: PdfDocument[]): Promise<void> {
  await writeFile(pdfsDbFile, JSON.stringify(pdfs, null, 2));

  if (redis) {
    await redis.set('pdfs', pdfs);
  }
}

export async function savePdfFile(filename: string, buffer: Buffer): Promise<void> {
  await mkdir(pdfStorageDir, { recursive: true });
  await writeFile(path.join(pdfStorageDir, filename), buffer);
}
