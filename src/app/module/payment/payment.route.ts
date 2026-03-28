import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import verifyToken from "../../middlewares/verifyToken.js";
import { PaymentController } from "./payment.controller.js";
import { checkoutSessionSchema } from "./payment.validation.js";

const router = Router();

router.post(
    "/create-checkout-session",
    verifyToken,
    validateRequest({ body: checkoutSessionSchema }),
    PaymentController.createCheckoutSession
);

export const PaymentRoute = router;
