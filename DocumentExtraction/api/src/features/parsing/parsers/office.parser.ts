import fs from "fs";
import { getTextExtractor } from "office-text-extractor";
import { ParsingError } from "../parsing.error.js";
import type { ParserResult } from "../types.js";
import { normalizeWhiteSpace } from "../utils/text.util.js";

//what the library throws when it recognises the file but has no parser for it
const UNSUPPORTED_MARKER = "could not find a method to handle";

export async function getOfficeText(path: string): Promise<ParserResult> {
  const file = new Uint8Array(fs.readFileSync(path));
  const extractor = getTextExtractor();
  let text: string;
  try {
    //the library identifies the file by its bytes, not by its extension
    text = normalizeWhiteSpace(
      await extractor.extractText({ input: file, type: "buffer" }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    //a pre-2007 .doc/.xls/.ppt lands here — a retry would fail in exactly the same way
    const unsupported = message.includes(UNSUPPORTED_MARKER);
    throw new ParsingError(
      unsupported ? "unsupported" : "corrupt",
      unsupported
        ? "This file type cannot be read. Save it as .docx, .xlsx or .pptx and upload it again."
        : `This document could not be read: ${message}`,
    );
  }

  //empty means the file held no words — a blank document, or slides that are only pictures
  if (!text.trim()) {
    throw new ParsingError(
      "empty",
      "No text could be found in this document. It may be blank, or contain only images.",
    );
  }

  //Office files carry no page numbers we can recover, so the whole document is one page.
  return {
    text,
    pages: [{ page: 1, text, source: "text" }],
    pageCount: 1,
    method: "office",
    warning: [],
  };
}
