import type { ExtractedValueRow } from "../types";

/**
 * The one string the reviewer reads for a row. Which column holds it depends on
 * data_type — coerce() writes the typed column and, for numbers, keeps the
 * document's own formatting in value_text.
 *
 * Returns null when the model found nothing, so callers can render "not found"
 * rather than an empty cell that looks like a rendering bug.
 */
export function displayValue(row: ExtractedValueRow): string | null {
  if (row.data_type === "date") return row.value_date;
  return row.value_text;
}

/** "true"/"false" is how coerce() stores booleans — value_text, not an integer. */
export function booleanLabel(value: string): string {
  return value === "true" ? "True" : "False";
}

/** 0.91 -> "91%". Null confidence means the quote step never ran. */
export function formatConfidence(confidence: number | null): string {
  if (confidence === null) return "—";
  return `${Math.round(confidence * 100)}%`;
}

/** How many rows a human has actually looked at. Drives the review progress. */
export function countReviewed(values: ExtractedValueRow[]): number {
  return values.filter((row) => row.review_status !== "unreviewed").length;
}
