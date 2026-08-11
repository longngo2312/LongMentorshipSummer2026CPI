import fs from "fs";
import { PasswordException, PDFParse } from "pdf-parse";
import { OcrImage } from "../ocr/tesseract.js";
import { ParsingError } from "../parsing.error.js";
import type { ParsedPage, ParseMethod, ParserResult } from "../types.js";
import {
  hasUsableText,
  joinPages,
  normalizeWhiteSpace,
} from "../utils/text.util.js";

const MIN_CHARS_PER_PAGE = 100;
const OCR_PAGE_CAP = 20;
const OCR_SCALE = 3;
export async function getPdfText(path: string): Promise<ParserResult> {
  const data = new Uint8Array(fs.readFileSync(path));
  const parser = new PDFParse({ data });
  const warning: string[] = [];
  try {
    let result;
    try {
      result = await parser.getText({ pageJoiner: "" });
    } catch (error) {
      throw new ParsingError(
        error instanceof PasswordException ? "encrypted" : "corrupt",
        error instanceof PasswordException
          ? "This PDF is password-protected. Remove the password and upload it again."
          : `This PDF could not be read: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const pages: ParsedPage[] = result.pages.map((p) => ({
      page: p.num,
      text: normalizeWhiteSpace(p.text),
      source: "text",
    }));

    //which page needs OCR in the pdf
    const needOCR = pages.filter(
      (p) => !hasUsableText(p.text, MIN_CHARS_PER_PAGE),
    );

    if (needOCR.length > 0) {
      //Step F
      const toOcr = needOCR.slice(0, OCR_PAGE_CAP);
      if (needOCR.length > toOcr.length) {
        warning.push(
          `Scanned document: only the first ${toOcr.length} of ${needOCR.length} were read`,
        );
      }
      //Step G - OCR loop, one page at a time
      for (const p of toOcr) {
        try {
          const screenshot = await parser.getScreenshot({
            partial: [p.page], //1-based page number, so exactly one page comes back
            scale: OCR_SCALE,
            imageDataUrl: false,
          });
          const png = screenshot.pages[0]?.data;
          if (!png) {
            warning.push(`Page ${p.page} could not be rendered for OCR.`);
            continue;
          }

          const text = normalizeWhiteSpace(await OcrImage(png));
          if (!text.trim()) {
            warning.push(`Page ${p.page} is an image with no readable text.`);
            continue;
          }

          //p is the same object pages holds, so this updates both
          p.text = text;
          p.source = "ocr";
        } catch (error) {
          warning.push(
            `Page ${p.page} could not be read: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    //Step H - what actually happened, counted off the finished pages
    const ocrCount = pages.filter((p) => p.source === "ocr").length;
    const method: ParseMethod =
      ocrCount === 0
        ? "pdf-text"
        : ocrCount === pages.length
          ? "pdf-ocr"
          : "pdf-hybrid";

    //Step I - glue the pages back together
    const text = joinPages(pages.map((p) => p.text));
    if (!text.trim()) {
      throw new ParsingError(
        "empty",
        "No text could be read from this PDF. It may be blank, or a scan too poor to read.",
      );
    }

    return { text, pages, pageCount: pages.length, method, warning };
  } finally {
    await parser.destroy();
  }
}
