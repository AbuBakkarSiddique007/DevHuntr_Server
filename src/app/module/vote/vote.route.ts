import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import validateRequest from "../../middlewares/validateRequest";
import { VoteController } from "./vote.controller";
import { castVoteBodySchema, productIdParamsSchema } from "./vote.validation";

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