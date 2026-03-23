import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { CommentController } from "./comment.controller.js";
import {
    createCommentSchema,
    listCommentsQuerySchema,
    productIdParamsSchema,
} from "./comment.validation.js";

const router = Router();

// protected: 
router.post("/", verifyToken, validateRequest(createCommentSchema), CommentController.createComment);


// public:
router.get(
    "/:productId",
    validateRequest({ params: productIdParamsSchema, query: listCommentsQuerySchema }),
    CommentController.listCommentsByProduct,
);

export const CommentRoute = router;
