import { Router } from "express";
import {
  createSchema,
  deleteSchemaById,
  getAllSchemas,
  getSchemaDetails,
} from "../controllers/schemaControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
//middleware here before hitting any routes
router.use(requireAuth);

router.post("/", createSchema);
router.get("/", getAllSchemas);
router.get("/:id", getSchemaDetails);
router.put("/:id", UpdateSchemaDetails);
router.delete("/:id", deleteSchemaById);

export default router;
