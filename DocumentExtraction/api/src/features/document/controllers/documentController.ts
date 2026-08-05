import { Request, Response } from "express";
import type { UploadBody } from "../dtos/document.dto.js";
import * as documentService from "../services/documents.services.js";
import { DocumentError } from "../utils/error.utils.js";
import { safeUnlink } from "../utils/storage.util.js";

//post(/) upload a document against a schema
export function uploadDocument(
  req: Request<{}, {}, UploadBody>,
  res: Response,
) {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  // Multipart text fields arrive as strings, so schema_id needs parsing.
  const schemaId = Number(req.body.schema_id);
  if (!Number.isInteger(schemaId) || schemaId <= 0) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: "A valid schema_id is required" });
  }

  try {
    const userId = req.user?.userId;
    if (!userId) {
      safeUnlink(req.file.path);
      return res.status(401).json({ error: "User authentication required" });
    }
    const created = documentService.createDocument(userId, req.file, schemaId);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof DocumentError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to upload document" });
  }
}

export function getDocuments(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "User authentication required" });
  }
  try {
    res.json(documentService.listDocuments(userId));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to list documents" });
  }
}
