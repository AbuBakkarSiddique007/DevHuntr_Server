import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { CouponController } from "./coupon.controller.js";
import {
	couponIdParamsSchema,
	createCouponSchema,
	updateCouponSchema,
	validateCodeParamsSchema,
} from "./coupon.validation.js";

const router = Router();

// public
router.get("/",
	CouponController.listActiveCoupons);

router.get("/validate/:code",
	validateRequest({ params: validateCodeParamsSchema }),
	CouponController.validateCoupon);


// admin
router.post("/",
	verifyToken,
	verifyAdmin,
	validateRequest(createCouponSchema),
	CouponController.createCoupon);


router.patch(
	"/:id",
	verifyToken,
	verifyAdmin,
	validateRequest({ params: couponIdParamsSchema, body: updateCouponSchema }),
	CouponController.updateCoupon,
);

router.delete(
	"/:id",
	verifyToken,
	verifyAdmin,
	validateRequest({ params: couponIdParamsSchema }),
	CouponController.deleteCoupon,
);

export const CouponRoute = router;
