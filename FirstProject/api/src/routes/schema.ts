import { Router } from "express";
import {
  createSchema,
  deleteSchemaById,
  getAllSchemas,
  getSchemaById,
  updateSchemaById,
} from "../controllers/schemaControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
//middleware here before hitting any routes
router.use(requireAuth);

router.post("/", createSchema);
router.get("/", getAllSchemas);
router.get("/:id", getSchemaById);
router.put("/:id", updateSchemaById);
router.delete("/:id", deleteSchemaById);

export default router;
