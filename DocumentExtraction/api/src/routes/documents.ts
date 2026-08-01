import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadDocuments } from "../features/document/controllers/uploadDocuments.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();

const upload = multer({
  dest: path.join(process.cwd(), "storage", "raw_docs"),
});
router.use(requireAuth);
router.post("/upload", upload.single("file"), uploadDocuments);
router.get("/", listDocuments);
router.get("/:id", getDocument);
router.get("/:id/file", downloadDocument);
router.get("/:id/events", jobUpdates);
router.post("/:id/reextract", reRunExtraction);
router.delete("/:id", deleteDocuments);

export default router;
