export const EXTRACTED_VALUES_SQL = {
  upsert: `
        INSERT INTO extracted_values (
            document_id, column_id, llm_value, llm_quote,
            value_text, value_number, value_date,
            source_page, source_start, source_end,
            source_span_ids, source_boxes,
            match_kind, confidence
        ) VALUES(?,?,?,?, ?,?,?, ?,?,?, ?,?, ?,?)
        ON CONFLICT(document_id, column_id) DO UPDATE SET
            llm_value    = excluded.llm_value,
            llm_quote    = excluded.llm_quote,
            value_text   = excluded.value_text,
            value_number = excluded.value_number,
            value_date   = excluded.value_date,
            source_page  = excluded.source_page,
            source_start = excluded.source_start,
            source_end   = excluded.source_end,
            source_span_ids = excluded.source_span_ids,
            source_boxes    = excluded.source_boxes,
            match_kind   = excluded.match_kind,
            confidence   = excluded.confidence,
            -- A re-extraction produces a brand new model answer, so any verdict
            -- a reviewer left on the previous one no longer applies to it.
            review_status = 'unreviewed',
            reviewed_at   = NULL;
    `,

  getByDocument: `
        SELECT
            extracted_values.*,
            schema_columns.name AS column_name,
            schema_columns.data_type AS data_type,
            schema_columns.position AS position
        FROM extracted_values
        JOIN schema_columns ON schema_columns.id = extracted_values.column_id
        WHERE extracted_values.document_id = ?
        ORDER BY schema_columns.position;
    `,

  // Review payload: joined with column metadata the UI needs
  getForReview: `
        SELECT
            ev.column_id,
            sc.name,
            sc.data_type,
            sc.enum_options,
            ev.llm_value,
            ev.llm_quote,
            ev.value_text,
            ev.source_page,
            -- Offsets into pages_json[source_page-1].text, which is the exact
            -- string ReviewPage.text hands the client — so the text viewer can
            -- slice instead of searching.
            ev.source_start,
            ev.source_end,
            -- Normalized 0..1 rects, one per line, resolved server-side at
            -- extraction. Null for formats with no geometry (office, plain
            -- text), which is what sends the client down its search fallback.
            ev.source_boxes,
            ev.source_span_ids,
            ev.match_kind,
            ev.confidence,
            ev.review_status
        FROM extracted_values ev
        JOIN schema_columns sc ON sc.id = ev.column_id
        WHERE ev.document_id = ?
        ORDER BY sc.position;
    `,

  // Deliberately does not touch source_* or llm_*: after a human edits a value,
  // the stored quote and boxes still describe where the *model* looked, not
  // where the correction came from. Provenance survives a review save intact.
  updateReviewedValue: `
        UPDATE extracted_values
        SET value_text     = ?,
            value_number   = ?,
            value_date     = ?,
            review_status  = ?,
            reviewed_at    = datetime('now')
        WHERE document_id = ? AND column_id = ?;
    `,
};
