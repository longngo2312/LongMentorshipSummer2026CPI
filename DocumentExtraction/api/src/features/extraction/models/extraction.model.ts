import {
  DocumentListItem,
  DocumentRecord,
} from "../../document/models/document.model.js";
import type {
  NormalizedBox,
  ParsedSpan,
} from "../../parsing/types.js";
import type { SchemaColumns } from "../../schema/models/schema.model.js";

export interface DocumentText {
  document_id: number;
  text: string;
  pages_json: string; // JSON.stringify(ReviewPage[]) — parse before use
  /**
   * JSON.stringify(PageSpans[]). Absent on rows read through
   * getPagesForReview, which deliberately does not select it.
   */
  spans_json: string;
  page_count: number;
  char_count: number;
  method: string;
  parsed_at: string;
}

/** One page's geometry, as stored in parsedDocumentText.spans_json. */
export interface PageSpans {
  page: number;
  width: number;
  height: number;
  spans: ParsedSpan[];
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
  source_span_ids: string | null; // JSON number[] — raw from SELECT *
  source_boxes: string | null; // JSON NormalizedBox[] — raw from SELECT *
  match_kind: MatchKind | null;
  confidence: number | null;
  review_status: ReviewStatus;
  reviewed_at: string | null;
}

export interface ExtractedValueRow extends ExtractedValue {
  column_name: string;
  data_type: SchemaColumns["data_type"];
  position: number;
}

export interface ExtractedDocument {
  document_id: number;
  status: DocumentRecord["status"];
  value: ExtractedValueRow[];
}
export interface SchemaJson {
  schema: Record<string, unknown>;
  keyToColumnId: Map<string, number>;
  fieldLines: string[];
}

export interface LlmFieldAnswer {
  value: string | null;
  quote: string | null;
  page: number | null;
}

// --- Review types (for the split-panel review API) ---

export interface ReviewField {
  column_id: number;
  name: string;
  data_type: SchemaColumns["data_type"];
  enum_options: string[] | null;
  llm_value: string | null;
  llm_quote: string | null;
  value_text: string | null;
  source_page: number | null;
  // Index into the matching ReviewPage.text, so the text viewer can slice the
  // quote out directly. Null whenever match_kind is "none".
  source_start: number | null;
  source_end: number | null;
  /**
   * Normalized 0..1 rects, one per line, ready to draw. Null for formats with
   * no geometry — office and plain text — which is what puts the client on its
   * search fallback rather than leaving it with an empty highlight.
   */
  source_boxes: NormalizedBox[] | null;
  /** Span identity, so geometry can be re-derived without re-running the match. */
  source_span_ids: number[] | null;
  match_kind: MatchKind | null;
  confidence: number | null;
  review_status: ReviewStatus;
}

export interface ReviewPage {
  page: number;
  source: "text" | "ocr";
  text: string;
  /** Human name for the unit when "page N" is wrong: "Q3 Actuals", "Slide 4". */
  label?: string;
}

export interface ReviewPayload {
  document: DocumentListItem;
  pages: ReviewPage[];
  fields: ReviewField[];
}

export interface ReviewEdit {
  column_id: number;
  value: string | null;
}
