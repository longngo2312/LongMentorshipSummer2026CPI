export const EXTRACTED_VALUES_SQL = {
  upsert: `
        INSERT INTO extracted_values (document_id, column_id, llm_value, value_text, value_number, value_date)
            VALUES(?,?,?,?,?,?)
        ON CONFLICT(document_id, column_id) DO UPDATE SET
            llm_value = excluded.llm_value,
            value_text = excluded.value_text,
            value_number = excluded.value_number,
            value_date = excluded.value_date,
            -- A re-extraction produces a brand new model answer, so any verdict
            -- a reviewer left on the previous one no longer applies to it.
            review_status = 'unreviewed',
            reviewed_at = NULL;
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
};
