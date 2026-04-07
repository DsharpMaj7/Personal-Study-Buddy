import "server-only";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = new Uint8Array(buffer);
    const pdf = await getDocument({ data }).promise;

    const pages: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");

      pages.push(pageText);
    }

    const text = pages.join("\n\n").trim();

    if (!text) {
      throw new Error("No text extracted from PDF.");
    }

    return text;
  } catch (err) {
    console.error("PDF parse failed:", err);
    throw new Error(
      "Could not extract text from this PDF. It may be image-only (scanned) or protected."
    );
  }
}

