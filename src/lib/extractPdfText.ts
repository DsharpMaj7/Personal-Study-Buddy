import "server-only";

/**
 * PDF parsing runs only on the server. Dynamic import keeps `pdf-parse` (and pdfjs-dist)
 * out of webpack’s server-action client chunks, where it breaks at runtime.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const textContent = result.text?.trim() ?? "";
    if (!textContent) {
      throw new Error(
        "Could not extract text from this PDF. It may be image-only (scanned) or protected."
      );
    }
    return textContent;
  } finally {
    await parser.destroy();
  }
}
