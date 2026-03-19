import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import validateRequest from "../../middlewares/validateRequest";
import { CommentController } from "./comment.controller";
import {
    createCommentSchema,
    listCommentsQuerySchema,
    productIdParamsSchema,
} from "./comment.validation";

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
