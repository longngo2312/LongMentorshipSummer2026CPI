import express from "express";
import documentsController from "../controllers/documentsController";

const router = express.Router();

router.post("/getDocuments", documentsController);

export default router;
