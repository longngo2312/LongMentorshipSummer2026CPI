import { Request, Response } from "express";
import { upload } from "../services/documents.services.ts";
export default function uploadDocuments(req: Request, res: Response) {
  try {
    const { file } = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is needed" });
    }

    const upLoad = await upload(file);
  } catch (error) {}
}
