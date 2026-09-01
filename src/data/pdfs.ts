import { PdfDocument } from '@/types';
import path from 'path';
import { readFile } from 'fs/promises';
import { mutateJsonValue, runRedis } from '@/lib/redis';

export async function getAllPdfs(): Promise<PdfDocument[]> {
  const pdfs = await runRedis((redis) => redis.get<PdfDocument[]>('pdfs'));
  if (!Array.isArray(pdfs) || pdfs.length === 0) return [];

  const counters = await runRedis((redis) => redis.mget<Array<number | null>>(
    ...pdfs.map((pdf) => `pdf:downloads:${pdf.id}`),
  ));
  return pdfs.map((pdf, index) => ({
    ...pdf,
    downloads: (pdf.downloads || 0) + Number(counters[index] || 0),
  }));
}

export async function mutatePdfs(updater: (pdfs: PdfDocument[]) => PdfDocument[]): Promise<PdfDocument[]> {
  return mutateJsonValue('pdfs', () => [], updater);
}

export async function savePdfFile(filename: string, buffer: Buffer): Promise<void> {
  await runRedis((redis) => redis.set(`pdf:${filename}`, buffer.toString('base64')));
}

export async function getPdfFile(filename: string): Promise<Buffer | null> {
  if (!isSafePdfFilename(filename)) return null;

  const pdfData = await runRedis((redis) => redis.get<string>(`pdf:${filename}`));
  if (pdfData) {
    return Buffer.from(pdfData, 'base64');
  }

  return getPublicPdfFile(filename);
}

export async function deletePdfFile(filename: string): Promise<void> {
  await runRedis((redis) => redis.del(`pdf:${filename}`));
}

export async function incrementPdfDownloads(id: string): Promise<void> {
  await runRedis((redis) => redis.incr(`pdf:downloads:${id}`));
}

export async function deletePdfDownloadCounter(id: string): Promise<void> {
  await runRedis((redis) => redis.del(`pdf:downloads:${id}`));
}

function isSafePdfFilename(filename: string): boolean {
  return path.basename(filename) === filename && filename.endsWith('.pdf');
}

export async function getPublicPdfFile(filename: string): Promise<Buffer | null> {
  if (!isSafePdfFilename(filename)) return null;

  try {
    return await readFile(path.join(process.cwd(), 'public', 'pdfs', filename));
  } catch {
    return null;
  }
}
