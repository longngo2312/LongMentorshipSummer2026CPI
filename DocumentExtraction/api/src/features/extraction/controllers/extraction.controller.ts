import type { Request, Response } from "express";
import * as extractionService from "../services/extraction.service.js";

export function getExtractedValue(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "User authentication required" });
  }
  const documentId = req.params.id;
  const docId = Number(documentId);

  if (!Number.isInteger(docId))
    return res.status(400).json({ error: "A valid document id is required" });

  try {
    const result = extractionService.getExtractedDocument(userId, docId);
    if (!result) return res.status(404).json({ error: "Document not found" });
    return res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get extracted values" });
  }
}
