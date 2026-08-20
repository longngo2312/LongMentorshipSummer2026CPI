import fs from "fs";
import { ParsingError } from "../parsing.error.js";
import type { ParserResult } from "../types.js";
import { normalizeWhiteSpace } from "../utils/text.util.js";

//covers .txt, .csv and .md — an LLM reads raw comma-separated text perfectly well,
//so a CSV is not parsed into rows we would only flatten back into text anyway
export async function getPlainText(path: string): Promise<ParserResult> {
  const text = normalizeWhiteSpace(fs.readFileSync(path, "utf8"));

  //empty means the file held no words, so there is nothing for the LLM to read
  if (!text.trim()) {
    throw new ParsingError("empty", "This file is empty.");
  }

  //one file is one page, so the chunker sees the same shape as a PDF
  return {
    text,
    pages: [{ page: 1, text, source: "text" }],
    pageCount: 1,
    method: "plain",
    warning: [],
  };
}
