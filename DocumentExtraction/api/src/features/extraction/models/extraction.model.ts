export interface DocumentText {
  document_id: number;
  text: string;
  pages_json: string; // JSON.stringify(ParsedPage[]) — parse before use
  page_count: number;
  char_count: number;
  method: string;
  parsed_at: string;
}

export interface ExtractedText {
  id: number;
  document_id: number;
  schema_id: number;
  value_text: string;
  value_number: number;
  value_date: string;
  confidence: number;
  source_snippet: string;
}

export interface SchemaJson {
  schema: Record<string, unknown>;
  keyToColumnId: Map<string, number>;
  fieldLines: string[];
}
