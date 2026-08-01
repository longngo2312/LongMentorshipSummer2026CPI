export const DOCUMENTS_SQL = {
  upload:
    "INSERT INTO documents (schema_id, filename, mime_type, storage_path, status) VALUES (?,?,?,?,?);",
};
