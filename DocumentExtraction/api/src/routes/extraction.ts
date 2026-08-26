import { Router } from "express";
import { getExtractedValue } from "../features/extraction/controllers/extraction.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/:id", getExtractedValue);

export default router;
