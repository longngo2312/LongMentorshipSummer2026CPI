export const DOCUMENT_TEXT_SQL = {
  upsert: `
        INSERT INTO parsedDocumentText (document_id, text, pages_json, page_count, char_count, method, parsed_at)
        VALUES (?,?,?,?,?,?,datetime('now'))
        ON CONFLICT(document_id) DO UPDATE SET 
            text = excluded.text, 
            pages_json = excluded.pages_json,
            page_count = excluded.page_count, 
            char_count = excluded.char_count,
            method = excluded.method, 
            parsed_at = excluded.parsed_at;
    `,
  getByDocumentId: `
        SELECT * FROM parsedDocumentText WHERE document_id = ?;
    `,
};
