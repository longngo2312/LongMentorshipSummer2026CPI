import { getTenantDb } from "../../../db/tenantDb.js";
import type { DocumentListItem } from "../../document/models/document.model.js";
import { DOCUMENT_SQL } from "../../document/sqls/document.sql.js";
import type { ParsedPage } from "../../parsing/types.js";
import type { SchemaColumns } from "../../schema/models/schema.model.js";
import type {
  DocumentText,
  ReviewEdit,
  ReviewField,
  ReviewPayload,
} from "../models/extraction.model.js";
import { DOCUMENT_TEXT_SQL } from "../sql/documentText.sql.js";
import { EXTRACTED_VALUES_SQL } from "../sql/extractedValues.sql.js";
import { coerce } from "../utils/coerce.util.js";

interface ReviewFieldRow {
  column_id: number;
  name: string;
  data_type: SchemaColumns["data_type"];
  enum_options: string | null;
  llm_value: string | null;
  llm_quote: string | null;
  value_text: string | null;
  source_page: number | null;
  match_kind: string | null;
  confidence: number | null;
  review_status: string;
}

export function getReviewPayload(
  userId: number,
  documentId: number,
): ReviewPayload | undefined {
  const db = getTenantDb(userId);

  const document = db.prepare(DOCUMENT_SQL.getDocumentById).get(documentId) as
    | DocumentListItem
    | undefined;
  if (!document) return undefined;

  const parsedText = db
    .prepare(DOCUMENT_TEXT_SQL.getByDocumentId)
    .get(documentId) as DocumentText | undefined;

  const pages: ParsedPage[] = parsedText
    ? JSON.parse(parsedText.pages_json)
    : [];

  const rows = db
    .prepare(EXTRACTED_VALUES_SQL.getForReview)
    .all(documentId) as ReviewFieldRow[];

  const fields: ReviewField[] = rows.map((row) => ({
    column_id: row.column_id,
    name: row.name,
    data_type: row.data_type,
    enum_options: row.enum_options ? JSON.parse(row.enum_options) : null,
    llm_value: row.llm_value,
    llm_quote: row.llm_quote,
    value_text: row.value_text,
    source_page: row.source_page,
    match_kind: row.match_kind as ReviewField["match_kind"],
    confidence: row.confidence,
    review_status: row.review_status as ReviewField["review_status"],
  }));

  return {
    document,
    pages: pages.map((p) => ({ page: p.page, source: p.source, text: p.text })),
    fields,
  };
}

export function saveReview(
  userId: number,
  documentId: number,
  edits: ReviewEdit[],
): void {
  const db = getTenantDb(userId);

  const document = db.prepare(DOCUMENT_SQL.getDocumentById).get(documentId) as
    | DocumentListItem
    | undefined;
  if (!document) {
    throw new Error("Document not found");
  }

  // Load current extracted values to compare for review_status derivation
  const currentRows = db
    .prepare(EXTRACTED_VALUES_SQL.getForReview)
    .all(documentId) as ReviewFieldRow[];

  const currentByColumnId = new Map(
    currentRows.map((r) => [r.column_id, r]),
  );

  const updateStmt = db.prepare(EXTRACTED_VALUES_SQL.updateReviewedValue);
  const updateStatus = db.prepare(DOCUMENT_SQL.updateStatus);

  db.transaction(() => {
    for (const edit of edits) {
      const current = currentByColumnId.get(edit.column_id);
      if (!current) continue;

      const enumOptions: string[] | null = current.enum_options
        ? JSON.parse(current.enum_options)
        : null;

      // Derive review_status server-side from comparison with llm_value
      let reviewStatus: "accepted" | "edited" | "rejected";
      if (edit.value === null || edit.value === "") {
        reviewStatus = "rejected";
      } else if (edit.value === current.llm_value) {
        reviewStatus = "accepted";
      } else {
        reviewStatus = "edited";
      }

      const coerced = coerce(
        reviewStatus === "rejected" ? null : edit.value,
        current.data_type,
        enumOptions,
      );

      updateStmt.run(
        coerced.value_text,
        coerced.value_number,
        coerced.value_date,
        reviewStatus,
        documentId,
        edit.column_id,
      );
    }

    updateStatus.run("reviewed", documentId);
  })();
}