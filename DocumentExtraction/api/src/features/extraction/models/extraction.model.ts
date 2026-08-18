export interface DocumentText {
  document_id: number;
  text: string;
  pages_json: string; // JSON.stringify(ParsedPage[]) — parse before use
  page_count: number;
  char_count: number;
  method: string;
  parsed_at: string;
}
