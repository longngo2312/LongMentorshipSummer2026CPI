export type ColumnDataType = "text" | "number" | "date" | "boolean" | "enum";

export interface SchemaColumn {
  id: number;
  schema_id: number;
  name: string;
  description: string;
  data_type: ColumnDataType;
  enum_options: string[] | null;
  required: boolean;
  position: number;
}

export interface DocumentSchema {
  id: number;
  name: string;
  description: string | null;
  column_count: number;
  created_at: string;
  updated_at: string;
}

export interface SchemaDetail {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  schemaColumns: SchemaColumn[];
}
export interface User {
  id: number;
  username: string;
  email: string;
}

// Mirrors the union in api/.../document.model.ts — the CHECK constraint was
// dropped from the documents table, so this is the only thing enforcing it.
export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "extracted"
  | "reviewed"
  | "indexed"
  | "failed";

//Shape returned by POST /documents
export interface DocumentRecord {
  id: number;
  schema_id: number;
  filename: string;
  mime_type: string;
  storage_path: string;
  size_bytes: number;
  status: DocumentStatus;
  uploaded_at: string;
}

//interface return by a GET request
export interface DocumentListItem extends DocumentRecord {
  schema_name: string;
}

export interface UploadResponse {
  document: DocumentRecord;
  jobId: number;
}

export interface UploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}
// --- Review (GET/PATCH /api/documents/:id/review) ---
// Mirrors api/.../features/extraction/models/extraction.model.ts. These replace
// the old ExtractedValueRow/ExtractedDocument, which described the deleted
// /api/extraction/:id endpoint.

export type DataType = "text" | "number" | "date" | "boolean" | "enum";

export type MatchKind = "exact" | "normalized" | "none";

export type ReviewStatus = "unreviewed" | "accepted" | "edited" | "rejected";

/** Normalized to 0..1 against the page box, origin top-left. Scale independent. */
export type NormalizedBox = [x0: number, y0: number, x1: number, y1: number];

export interface ReviewField {
  column_id: number;
  name: string;
  data_type: DataType;
  enum_options: string[] | null;
  /** The raw model answer, frozen at extraction time. */
  llm_value: string | null;
  llm_quote: string | null;
  /** The working value — what the reviewer sees and edits. */
  value_text: string | null;
  source_page: number | null;
  /** Offsets into the matching ReviewPage.text. Null when match_kind is "none". */
  source_start: number | null;
  source_end: number | null;
  /**
   * Rects the server resolved from the parse itself, one per line. Null for
   * formats that carry no geometry — office, plain text — and that null is what
   * puts the viewer on its text-search fallback.
   */
  source_boxes: NormalizedBox[] | null;
  /** Span identity behind those rects. Stored now, surfaced in a later phase. */
  source_span_ids: number[] | null;
  match_kind: MatchKind | null;
  confidence: number | null;
  review_status: ReviewStatus;
}

export interface ReviewPage {
  page: number;
  source: "text" | "ocr";
  text: string;
  /** Set when "page N" is the wrong word for the unit: "Q3 Actuals", "Slide 4". */
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

/** The one piece of state linking the review panel to the document viewer. */
export interface ActiveQuote {
  columnId: number;
  quote: string;
  pageNumber: number;
  /** Present when the server located the quote in the parsed page text. */
  start: number | null;
  end: number | null;
  /** Server-resolved rects. Null means the viewer has to search for itself. */
  boxes: NormalizedBox[] | null;
}
