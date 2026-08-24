export interface DocumentText {
  document_id: number;
  text: string;
  pages_json: string; // JSON.stringify(ParsedPage[]) — parse before use
  page_count: number;
  char_count: number;
  method: string;
  parsed_at: string;
}

export type ReviewStatus = "unreviewed" | "accepted" | "edited" | "rejected";

export type MatchKind = "exact" | "normalized" | "none";

export interface ExtractedValue {
  id: number;
  document_id: number;
  column_id: number;
  llm_value: string | null;
  llm_quote: string | null;
  value_text: string | null;
  value_number: number | null;
  value_date: string | null;
  source_page: number | null;
  source_start: number | null;
  source_end: number | null;
  match_kind: MatchKind | null;
  confidence: number | null;
  review_status: ReviewStatus;
  reviewed_at: string | null;
}

export interface SchemaJson {
  schema: Record<string, unknown>;
  keyToColumnId: Map<string, number>;
  fieldLines: string[];
}

export interface LlmFieldAnswer {
  value: string | null;
}
