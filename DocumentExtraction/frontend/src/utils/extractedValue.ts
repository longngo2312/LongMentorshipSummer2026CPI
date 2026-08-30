import type { ReviewField, ReviewStatus } from "../types";

/**
 * The one string the reviewer reads for a field.
 *
 * The server keeps the typed columns (value_number, value_date) for querying,
 * but only ever sends value_text to the review UI — for numbers that is the
 * document's own formatting, which is what a reviewer needs to compare against
 * the page. Null means the model found nothing.
 */
export function displayValue(field: ReviewField): string | null {
  return field.value_text;
}

/** "true"/"false" is how coerce() stores booleans — value_text, not an integer. */
export function booleanLabel(value: string): string {
  return value === "true" ? "True" : "False";
}

/** 0.9 -> "90%". Null confidence means the quote step found nothing. */
export function formatConfidence(confidence: number | null): string {
  if (confidence === null) return "—";
  return `${Math.round(confidence * 100)}%`;
}

/** Whether a field has a quote the viewer could actually navigate to. */
export function hasLocatableQuote(field: ReviewField): boolean {
  return Boolean(field.llm_quote) && field.match_kind !== "none";
}

/**
 * Fields the reviewer has ruled on — either saved earlier, or pending in this
 * session. Drives the progress bar and gates the save button.
 */
export function countDecided(
  fields: ReviewField[],
  edits: Map<number, string | null>,
): number {
  return fields.filter(
    (field) =>
      edits.has(field.column_id) || field.review_status !== "unreviewed",
  ).length;
}

/**
 * The review_status the server will derive for a pending edit.
 *
 * Mirrors review.service.ts exactly, so the chip a reviewer sees before saving
 * matches what comes back after. Note the comparison is against llm_value — the
 * raw model answer — not the displayed value_text.
 */
export function projectStatus(
  field: ReviewField,
  edit: string | null | undefined,
): ReviewStatus {
  if (edit === undefined) return field.review_status;
  if (edit === null || edit === "") return "rejected";
  return edit === field.llm_value ? "accepted" : "edited";
}
