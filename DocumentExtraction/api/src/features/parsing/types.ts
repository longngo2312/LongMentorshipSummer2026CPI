//type of parsing methods
export type ParseMethod =
  | "pdf-text"
  | "pdf-ocr"
  | "pdf-hybrid"
  | "image-ocr"
  | "office"
  | "plain";

export interface ParsedPage {
  text: string;
  page: number;
  source: "text" | "ocr";
}

export interface ParsedDocument {
  text: string;
  pages: ParsedPage[];
  pageCount: number;
  method: ParseMethod;
  charCount: number;
  warning: string[];
  durationMs: number;
}

//what every parser returns — extractText() adds charCount and durationMs
export type ParserResult = Omit<ParsedDocument, "charCount" | "durationMs">;
