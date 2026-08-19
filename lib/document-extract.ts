import { hfVisionExtract } from "./hf";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export type ExtractResult = { text: string; method: "pdf" | "docx" | "text" | "vision-ocr" };

// pdfjs-dist (via pdf-parse) references DOMMatrix even for plain text extraction,
// which doesn't exist in Vercel's Node serverless runtime (it's a browser API).
// Polyfill it once, lazily, only when a PDF actually needs parsing.
async function ensurePdfPolyfills() {
  if (typeof (globalThis as Record<string, unknown>).DOMMatrix === "undefined") {
    const { default: DOMMatrix } = await import("dommatrix");
    (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrix;
  }
}

export async function extractContractText(file: File): Promise<ExtractResult> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (name.endsWith(".pdf") || type === "application/pdf") {
    await ensurePdfPolyfills();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return { text: result.text, method: "pdf" };
    } finally {
      await parser.destroy();
    }
  }

  if (name.endsWith(".docx") || type.includes("wordprocessingml")) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, method: "docx" };
  }

  if (IMAGE_TYPES.has(type) || /\.(png|jpe?g|webp)$/i.test(name)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const text = await hfVisionExtract(base64, type || "image/png");
    if (!text) {
      throw new Error(
        "Could not transcribe that image — the vision model call failed or returned nothing. Try a clearer photo/scan, or paste the text directly."
      );
    }
    return { text, method: "vision-ocr" };
  }

  // .txt and anything else readable as plain text
  const buffer = Buffer.from(await file.arrayBuffer());
  return { text: buffer.toString("utf-8"), method: "text" };
}
