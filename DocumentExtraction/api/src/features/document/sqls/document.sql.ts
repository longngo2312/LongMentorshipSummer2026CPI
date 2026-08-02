export const DOCUMENT_SQL = {
  schemaExists: `SELECT id FROM document_schemas WHERE id = ?;`,

  insertDocument: `
    INSERT INTO documents (schema_id, filename, mime_type, storage_path, size_bytes, status)
    VALUES (?, ?, ?, ?, ?, 'uploaded');
  `,

  getById: `SELECT * FROM documents WHERE id = ?;`,

  deleteById: `DELETE FROM documents WHERE id = ?;`,
};

// Lives in the admin DB, not the tenant DB.
export const JOB_SQL = {
  insertJob: `
    INSERT INTO extraction_jobs (user_id, document_id, status)
    VALUES (?, ?, 'queued');
  `,
};
