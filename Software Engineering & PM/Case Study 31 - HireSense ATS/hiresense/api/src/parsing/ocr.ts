// OCR fallback for PDFs without a text layer (scanned or outlined). PP-OCRv6 tiny via ONNX Runtime
// (ppu-paddle-ocr), pages rasterised by pdf.js onto @napi-rs/canvas. Optional: if the packages or the
// models are unavailable, OCR reports itself unavailable and such résumés go to manual review as before.
import { getDocumentProxy, renderPageAsImage } from "unpdf";
import type { PdfLayout, TextItem } from "./pdf";

export const OCR_ENGINE = "PP-OCRv6 tiny";
const SCALE = 2; // render at 144 dpi; box coordinates are divided back to PDF points

type Service = { recognize(img: ArrayBuffer): Promise<{ lines: { text: string; box: { x: number; y: number; width: number; height: number }; confidence: number }[][] }> };
let service: Promise<Service | null> | null = null;

function load(): Promise<Service | null> {
  if (process.env.HIRESENSE_OCR === "0") return Promise.resolve(null);
  service ??= (async () => {
    try {
      const { PaddleOcrService } = await import("ppu-paddle-ocr");
      const s = new PaddleOcrService({ debugging: { verbose: false } } as never);
      await s.initialize(); // downloads the ~5 MB models on first use, then cached
      return s as unknown as Service;
    } catch (e) {
      console.warn(`OCR unavailable (${(e as Error).message}); scanned résumés will go to manual review`);
      return null;
    }
  })();
  return service;
}

export async function ocrAvailable(): Promise<boolean> {
  return (await load()) != null;
}

/** Text items recovered by OCR, in the same shape pdf.js produces, plus mean word confidence (0–1). */
export async function ocrLayout(bytes: Uint8Array): Promise<{ layout: PdfLayout; meanConfidence: number } | null> {
  const ocr = await load();
  if (!ocr) return null;
  const pdf = await getDocumentProxy(bytes.slice());
  const layout: PdfLayout = { pages: [] };
  const confidences: number[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const { width, height } = (await pdf.getPage(n)).getViewport({ scale: 1 });
    const png = await renderPageAsImage(bytes.slice(), n, { canvasImport: () => import("@napi-rs/canvas"), scale: SCALE });
    const { lines } = await ocr.recognize(png);
    const items: TextItem[] = [];
    for (const line of lines)
      for (const w of line) {
        confidences.push(w.confidence);
        const b = w.box;
        items.push({ str: w.text, x: b.x / SCALE, y: height - (b.y + b.height) / SCALE, w: b.width / SCALE, h: b.height / SCALE, page: n });
      }
    layout.pages.push({ width, height, items });
  }
  const meanConfidence = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
  return { layout, meanConfidence };
}
