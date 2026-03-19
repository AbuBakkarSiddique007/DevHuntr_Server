import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import verifyAdmin from "../../middlewares/verifyAdmin";
import validateRequest from "../../middlewares/validateRequest";
import { TagController } from "./tag.controller";
import { createTagSchema } from "./tag.validation";

const router = Router();

// Public : Get all tags
router.get("/", TagController.listTags);

// Admin : Create tag
router.post("/", verifyToken, verifyAdmin, validateRequest(createTagSchema), TagController.createTag);

export const TagRoute = router;
