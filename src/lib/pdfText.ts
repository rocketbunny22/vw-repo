const MAX_INDEXED_TEXT_LENGTH = 200_000;

export type PdfTextExtractionResult =
  | { text: string }
  | { error: string };

export async function extractPdfText(buffer: Buffer): Promise<PdfTextExtractionResult> {
  let parser: { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> } | null = null;

  try {
    const { PDFParse } = await import('pdf-parse');
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = normalizePdfText(result.text).slice(0, MAX_INDEXED_TEXT_LENGTH);

    if (!text) {
      return { error: 'No searchable text could be extracted' };
    }

    return { text };
  } catch (error) {
    const message = formatExtractionError(error);
    console.error('PDF text extraction failed:', message);
    return { error: message };
  } finally {
    await parser?.destroy().catch(() => undefined);
  }
}

function normalizePdfText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatExtractionError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error || 'Unknown PDF text extraction error');
}
