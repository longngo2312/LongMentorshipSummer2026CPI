import fs from "fs";
import { OcrImage } from "../ocr/tesseract.js";
import { ParsingError } from "../parsing.error.js";
import type { ParserResult } from "../types.js";
import { normalizeWhiteSpace } from "../utils/text.util.js";

export async function getImageText(path: string): Promise<ParserResult> {
  //get image from uploaded file => turn into machine readable type
  const image = new Uint8Array(fs.readFileSync(path));

  let text: string;
  try {
    //clean the text extracted from OCR
    text = normalizeWhiteSpace(await OcrImage(image));
  } catch (error) {
    //throw error if image can't be read
    throw new ParsingError(
      "corrupt",
      `This image could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  //empty text meaning there was nothing to extract from the image
  if (!text.trim()) {
    throw new ParsingError(
      "empty",
      "No text could be found in this image. It may contain no writing, or be too blurry to read.",
    );
  }

  //One image is one page, so the chunker on Thursday sees the same shape as a PDF.
  return {
    text,
    pages: [{ page: 1, text, source: "ocr" }],
    pageCount: 1,
    method: "image-ocr",
    warning: [],
  };
}
