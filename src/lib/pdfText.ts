const MAX_INDEXED_TEXT_LENGTH = 200_000;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  let parser: { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> } | null = null;

  try {
    const { PDFParse } = await import('pdf-parse');
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return normalizePdfText(result.text).slice(0, MAX_INDEXED_TEXT_LENGTH);
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    return '';
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
