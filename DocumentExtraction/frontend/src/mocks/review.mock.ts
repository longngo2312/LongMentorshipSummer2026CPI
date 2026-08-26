import type { ReviewPayload } from "../types";

const PAGE_ONE = `ACME SUPPLY CO.
1200 Harbor Way, Portland OR 97209

Invoice No. INV-2026-0417
Issued March 4, 2026

Bill To:
Northwind Trading
88 Rivergate Ave

Description                 Qty      Unit      Line Total
Steel bracket, 40mm         120      $18.00    $2,160.00
Aluminium rail, 2m           45      $92.00    $4,140.00
Fastener kit                300       $8.50    $2,550.00`;

const PAGE_TWO = `Subtotal                                      $8,850.00
Freight                                       $1,410.50
Tax (14%)                                     $2,220.00

Amount Due: $12,480.50

All figures in USD. Payment due within 30 days of issue.
Remit to account 4471-0092 or contact accounts@acmesupply.example.`;

/**
 * Stand-in for GET /api/documents/:id/review, used when VITE_MOCK_REVIEW=true so
 * the UI can be worked on without a running API or a loaded model.
 *
 * The document is text/plain so the TextViewer path is exercised; the PDF path
 * needs a real upload. Every quote below appears verbatim in the page text
 * above, and source_start/source_end are the real offsets into it — so the
 * text viewer's slice-and-mark path is genuinely tested.
 */
export const MOCK_REVIEW: ReviewPayload = {
  document: {
    id: 1,
    schema_id: 1,
    filename: "acme-invoice-0417.txt",
    mime_type: "text/plain",
    storage_path: "user_1/mock.txt",
    size_bytes: PAGE_ONE.length + PAGE_TWO.length,
    status: "extracted",
    uploaded_at: "2026-08-26 09:14:02",
    schema_name: "Invoice",
  },
  pages: [
    { page: 1, source: "text", text: PAGE_ONE },
    { page: 2, source: "text", text: PAGE_TWO },
  ],
  fields: [
    {
      column_id: 11,
      name: "Invoice Number",
      data_type: "text",
      enum_options: null,
      llm_value: "INV-2026-0417",
      llm_quote: "Invoice No. INV-2026-0417",
      value_text: "INV-2026-0417",
      source_page: 1,
      source_start: PAGE_ONE.indexOf("Invoice No. INV-2026-0417"),
      source_end:
        PAGE_ONE.indexOf("Invoice No. INV-2026-0417") +
        "Invoice No. INV-2026-0417".length,
      match_kind: "exact",
      confidence: 0.9,
      review_status: "unreviewed",
    },
    {
      column_id: 12,
      name: "Total Amount",
      data_type: "number",
      enum_options: null,
      // The model decorates numbers when the grammar forces them into a string;
      // coerce() strips that, which is why llm_value and value_text differ.
      // Accepting this field must submit llm_value, not what's on screen.
      llm_value: "{$12,480.50}",
      llm_quote: "Amount Due: $12,480.50",
      value_text: "$12,480.50",
      source_page: 2,
      source_start: PAGE_TWO.indexOf("Amount Due: $12,480.50"),
      source_end:
        PAGE_TWO.indexOf("Amount Due: $12,480.50") +
        "Amount Due: $12,480.50".length,
      match_kind: "exact",
      confidence: 0.9,
      review_status: "unreviewed",
    },
    {
      column_id: 13,
      name: "Invoice Date",
      data_type: "date",
      enum_options: null,
      llm_value: "March 4, 2026",
      llm_quote: "Issued March 4, 2026",
      value_text: "2026-03-04",
      source_page: 1,
      source_start: PAGE_ONE.indexOf("Issued March 4, 2026"),
      source_end:
        PAGE_ONE.indexOf("Issued March 4, 2026") + "Issued March 4, 2026".length,
      match_kind: "exact",
      confidence: 0.9,
      review_status: "accepted",
    },
    {
      column_id: 14,
      name: "Paid",
      data_type: "boolean",
      enum_options: null,
      // Quote the model invented — resolveQuote could not find it, so this row
      // must not offer a clickable source.
      llm_value: "Yes",
      llm_quote: "Status: PAID IN FULL",
      value_text: "true",
      source_page: null,
      source_start: null,
      source_end: null,
      match_kind: "none",
      confidence: 0,
      review_status: "unreviewed",
    },
    {
      column_id: 15,
      name: "Currency",
      data_type: "enum",
      enum_options: ["USD", "EUR", "GBP"],
      // coerce() stores the canonical casing from enum_options, not the model's.
      llm_value: "usd",
      llm_quote: "All figures in USD.",
      value_text: "USD",
      source_page: 2,
      source_start: PAGE_TWO.indexOf("All figures in USD."),
      source_end:
        PAGE_TWO.indexOf("All figures in USD.") + "All figures in USD.".length,
      match_kind: "exact",
      confidence: 0.9,
      review_status: "unreviewed",
    },
    {
      column_id: 16,
      name: "Purchase Order",
      data_type: "text",
      enum_options: null,
      // Absent from the document. A null here is the model behaving correctly.
      llm_value: null,
      llm_quote: null,
      value_text: null,
      source_page: null,
      source_start: null,
      source_end: null,
      match_kind: null,
      confidence: null,
      review_status: "unreviewed",
    },
  ],
};
