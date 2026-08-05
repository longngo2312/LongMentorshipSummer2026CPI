import adminDB from "../../../db/adminDB.js";
import { getTenantDb } from "../../../db/tenantDb.js";
import type { UploadResponse } from "../dtos/document.dto.js";
import type {
  DocumentListItem,
  DocumentRecord,
} from "../models/document.model.js";
import { DOCUMENT_SQL, JOB_SQL } from "../sqls/document.sql.js";
import { DocumentError } from "../utils/error.utils.js";
import { safeUnlink, toStoragePath } from "../utils/storage.util.js";

export function createDocument(
  userId: number,
  file: Express.Multer.File,
  schemaId: number,
): UploadResponse {
  const db = getTenantDb(userId);

  // Multer has already written the file by the time we get here, so every
  // failure path below has to clean it up or we leak a file on disk.
  const schema = db.prepare(DOCUMENT_SQL.schemaExists).get(schemaId);
  if (!schema) {
    safeUnlink(file.path);
    throw new DocumentError(404, "Schema not found");
  }

  const { lastInsertRowid } = db
    .prepare(DOCUMENT_SQL.insertDocument)
    .run(
      schemaId,
      file.originalname,
      file.mimetype,
      toStoragePath(file.path),
      file.size,
    );
  const documentId = Number(lastInsertRowid);

  let jobId: number;
  try {
    const job = adminDB.prepare(JOB_SQL.insertJob).run(userId, documentId);
    jobId = Number(job.lastInsertRowid);
  } catch (error) {
    db.prepare(DOCUMENT_SQL.deleteById).run(documentId);
    safeUnlink(file.path);
    throw error;
  }

  const document = db
    .prepare(DOCUMENT_SQL.getById)
    .get(documentId) as DocumentRecord;

  return { document, jobId };
}

export function listDocuments(userId: number): DocumentListItem[] {
  const db = getTenantDb(userId);
  return db.prepare(DOCUMENT_SQL.getDocuments).all() as DocumentListItem[];
}

export function getDocById(
  userId: number,
  id: number,
): DocumentListItem | undefined {
  const db = getTenantDb(userId);
  return db.prepare(DOCUMENT_SQL.getDocumentById).get(id) as
    | DocumentListItem
    | undefined;
}
