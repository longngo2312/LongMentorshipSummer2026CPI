import adminDB from "../../../db/adminDB.js";
import type { DocumentRecord } from "../models/document.model.js";
import { DOCUMENTS_SQL } from "../sqls/documents.sqls.js";

export function upload(body: Request): Promise<DocumentRecord> {
  const { filename, schema_id, mime_type, storage_path, status } = body.file;
  const fileUpload = adminDB.prepare(DOCUMENTS_SQL.upload).run();
}
