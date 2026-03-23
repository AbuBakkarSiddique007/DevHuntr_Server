import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { VoteController } from "./vote.controller.js";
import { castVoteBodySchema, productIdParamsSchema } from "./vote.validation.js";

const router = Router();

// protected
router.post(
    "/:productId",
    verifyToken,
    validateRequest({ params: productIdParamsSchema, body: castVoteBodySchema }),
    VoteController.castVote,
);


router.get(
    "/:productId/check",
    verifyToken,
    validateRequest({ params: productIdParamsSchema }),
    VoteController.checkMyVote,
);

export const VoteRoute = router;