import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { TagController } from "./tag.controller.js";
import { createTagSchema } from "./tag.validation.js";

const router = Router();

// Public : Get all tags
router.get("/", TagController.listTags);

// Admin : Create tag
router.post("/", verifyToken, verifyAdmin, validateRequest(createTagSchema), TagController.createTag);

export const TagRoute = router;
